package app.maganis.coach;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * DurableFileStore: Plain Java atomic file store implementing strict fsync,
 * write-ahead tmp-file validation, backup rotation (.bak), and crash recovery.
 *
 * Rules:
 * - App-private directory (no external storage).
 * - Key encoding is 100% reversible and safe for every filesystem.
 * - Fault injection supported at every step of write protocol.
 * - Under any failure, returns old value or new value; never empty or partial.
 * - Corrupted files are preserved with .corrupt-<epoch> suffix.
 */
public class DurableFileStore {

    public enum WriteStep {
        BEFORE_WRITE_TMP,
        AFTER_WRITE_TMP,
        BEFORE_FSYNC_TMP,
        AFTER_FSYNC_TMP,
        BEFORE_VALIDATE_TMP,
        AFTER_VALIDATE_TMP,
        BEFORE_ROTATE_BAK,
        AFTER_ROTATE_BAK,
        BEFORE_ATOMIC_RENAME,
        AFTER_ATOMIC_RENAME,
        BEFORE_DIR_FSYNC,
        AFTER_DIR_FSYNC
    }

    public interface FaultInjector {
        void onStep(WriteStep step) throws IOException;
    }

    public static class RecoveryEvent {
        public final String key;
        public final String recoveredFrom;
        public final String reason;
        public final long timestamp;

        public RecoveryEvent(String key, String recoveredFrom, String reason) {
            this.key = key;
            this.recoveredFrom = recoveredFrom;
            this.reason = reason;
            this.timestamp = System.currentTimeMillis();
        }

        public Map<String, Object> toMap() {
            Map<String, Object> m = new HashMap<>();
            m.put("key", key);
            m.put("recoveredFrom", recoveredFrom);
            m.put("reason", reason);
            m.put("timestamp", timestamp);
            return m;
        }
    }

    public static class ReadResult {
        public final Map<String, String> data;
        public final List<RecoveryEvent> recoveryEvents;

        public ReadResult(Map<String, String> data, List<RecoveryEvent> recoveryEvents) {
            this.data = data;
            this.recoveryEvents = recoveryEvents;
        }
    }

    public static class StoreStats {
        public final int keyCount;
        public final long totalBytes;
        public final long freeSpaceBytes;

        public StoreStats(int keyCount, long totalBytes, long freeSpaceBytes) {
            this.keyCount = keyCount;
            this.totalBytes = totalBytes;
            this.freeSpaceBytes = freeSpaceBytes;
        }
    }

    private final File baseDir;
    private final ConcurrentHashMap<String, ReentrantLock> keyLocks = new ConcurrentHashMap<>();
    private final List<RecoveryEvent> recordedRecoveryEvents = Collections.synchronizedList(new ArrayList<>());
    private volatile FaultInjector faultInjector = null;

    public DurableFileStore(File baseDir) {
        this.baseDir = baseDir;
        if (!baseDir.exists()) {
            baseDir.mkdirs();
        }
    }

    public void setFaultInjector(FaultInjector injector) {
        this.faultInjector = injector;
    }

    private ReentrantLock getLockForKey(String key) {
        return keyLocks.computeIfAbsent(key, k -> new ReentrantLock());
    }

    /**
     * Reversible, filesystem-safe encoding: Hex of UTF-8 bytes.
     * Prevents case-collision and illegal character issues on FAT/ext4.
     */
    public static String encodeKey(String key) {
        byte[] bytes = key.getBytes(StandardCharsets.UTF_8);
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

    public static String decodeKey(String encoded) {
        int len = encoded.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(encoded.charAt(i), 16) << 4)
                                 + Character.digit(encoded.charAt(i + 1), 16));
        }
        return new String(data, StandardCharsets.UTF_8);
    }

    public static String computeSha256(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data);
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private static class Envelope {
        final String key;
        final String sha256;
        final String value;

        Envelope(String key, String sha256, String value) {
            this.key = key;
            this.sha256 = sha256;
            this.value = value;
        }

        byte[] serialize() {
            // Self-delimiting robust format:
            // Line 1: MAGANIS_KV_V1
            // Line 2: key
            // Line 3: sha256
            // Line 4: length in bytes of value
            // Line 5+: raw value UTF-8 bytes
            byte[] valBytes = value.getBytes(StandardCharsets.UTF_8);
            String header = "MAGANIS_KV_V1\n" + key + "\n" + sha256 + "\n" + valBytes.length + "\n";
            byte[] headerBytes = header.getBytes(StandardCharsets.UTF_8);
            byte[] result = new byte[headerBytes.length + valBytes.length];
            System.arraycopy(headerBytes, 0, result, 0, headerBytes.length);
            System.arraycopy(valBytes, 0, result, headerBytes.length, valBytes.length);
            return result;
        }

        static Envelope parseAndValidate(File file, String expectedKey) throws IOException {
            if (!file.exists() || file.length() == 0) {
                throw new IOException("File missing or empty: " + file.getName());
            }

            byte[] allBytes = Files.readAllBytes(file.toPath());
            String text = new String(allBytes, StandardCharsets.UTF_8);
            int idx1 = text.indexOf('\n');
            if (idx1 < 0) throw new IOException("Malformed header line 1");
            String magic = text.substring(0, idx1).trim();
            if (!"MAGANIS_KV_V1".equals(magic)) throw new IOException("Invalid magic header: " + magic);

            int idx2 = text.indexOf('\n', idx1 + 1);
            if (idx2 < 0) throw new IOException("Malformed header line 2");
            String key = text.substring(idx1 + 1, idx2).trim();
            if (expectedKey != null && !expectedKey.equals(key)) {
                throw new IOException("Key mismatch: expected " + expectedKey + " but found " + key);
            }

            int idx3 = text.indexOf('\n', idx2 + 1);
            if (idx3 < 0) throw new IOException("Malformed header line 3");
            String sha256 = text.substring(idx2 + 1, idx3).trim();

            int idx4 = text.indexOf('\n', idx3 + 1);
            if (idx4 < 0) throw new IOException("Malformed header line 4");
            int expectedLength;
            try {
                expectedLength = Integer.parseInt(text.substring(idx3 + 1, idx4).trim());
            } catch (NumberFormatException e) {
                throw new IOException("Invalid length field: " + e.getMessage());
            }

            int valueByteOffset = (text.substring(0, idx4 + 1)).getBytes(StandardCharsets.UTF_8).length;
            int actualValueBytes = allBytes.length - valueByteOffset;
            if (actualValueBytes != expectedLength) {
                throw new IOException("Value length mismatch: expected " + expectedLength + " bytes, found " + actualValueBytes);
            }

            byte[] valBytes = new byte[expectedLength];
            System.arraycopy(allBytes, valueByteOffset, valBytes, 0, expectedLength);
            String computedSha = computeSha256(valBytes);
            if (!computedSha.equalsIgnoreCase(sha256)) {
                throw new IOException("SHA-256 mismatch: expected " + sha256 + ", computed " + computedSha);
            }

            String value = new String(valBytes, StandardCharsets.UTF_8);
            return new Envelope(key, sha256, value);
        }
    }

    private void callFaultInjector(WriteStep step) throws IOException {
        FaultInjector fi = this.faultInjector;
        if (fi != null) {
            fi.onStep(step);
        }
    }

    /**
     * Writes a key-value entry atomically with fsync and recovery backup.
     */
    public void write(String key, String value) throws IOException {
        if (key == null || value == null) {
            throw new IllegalArgumentException("key and value cannot be null");
        }

        ReentrantLock lock = getLockForKey(key);
        lock.lock();
        try {
            if (!baseDir.exists()) {
                if (!baseDir.mkdirs()) {
                    throw new IOException("Failed to create base directory: " + baseDir.getAbsolutePath());
                }
            }

            String encoded = encodeKey(key);
            File tmpFile = new File(baseDir, encoded + ".tmp");
            File jsonFile = new File(baseDir, encoded + ".json");
            File bakFile = new File(baseDir, encoded + ".bak");

            byte[] valBytes = value.getBytes(StandardCharsets.UTF_8);
            String sha256 = computeSha256(valBytes);
            Envelope envelope = new Envelope(key, sha256, value);
            byte[] filePayload = envelope.serialize();

            // Step 1: Write <name>.tmp
            callFaultInjector(WriteStep.BEFORE_WRITE_TMP);
            try (FileOutputStream fos = new FileOutputStream(tmpFile)) {
                fos.write(filePayload);
                fos.flush();

                // Step 2: fsync the file
                callFaultInjector(WriteStep.BEFORE_FSYNC_TMP);
                try {
                    fos.getFD().sync();
                } catch (Exception e) {
                    throw new IOException("fsync failed on tmp file: " + e.getMessage(), e);
                }
                callFaultInjector(WriteStep.AFTER_FSYNC_TMP);
            }
            callFaultInjector(WriteStep.AFTER_WRITE_TMP);

            // Step 3: Validate tmp by reading back and verifying hash + key
            callFaultInjector(WriteStep.BEFORE_VALIDATE_TMP);
            try {
                Envelope.parseAndValidate(tmpFile, key);
            } catch (Exception e) {
                // Validation failed: preserve as corrupt
                File corruptFile = new File(baseDir, encoded + ".corrupt-" + System.currentTimeMillis());
                tmpFile.renameTo(corruptFile);
                throw new IOException("Write validation failed on tmp file: " + e.getMessage(), e);
            }
            callFaultInjector(WriteStep.AFTER_VALIDATE_TMP);

            // Step 4: Rotate current json to .bak if valid
            callFaultInjector(WriteStep.BEFORE_ROTATE_BAK);
            if (jsonFile.exists()) {
                try {
                    Envelope.parseAndValidate(jsonFile, key);
                    // Valid json file: rotate to .bak
                    Files.move(jsonFile.toPath(), bakFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                } catch (Exception e) {
                    // Current json is corrupt: preserve as corrupt and leave bak intact
                    File corruptJson = new File(baseDir, encoded + ".json.corrupt-" + System.currentTimeMillis());
                    jsonFile.renameTo(corruptJson);
                }
            }
            callFaultInjector(WriteStep.AFTER_ROTATE_BAK);

            // Step 5: Atomic rename tmp to json
            callFaultInjector(WriteStep.BEFORE_ATOMIC_RENAME);
            try {
                Files.move(tmpFile.toPath(), jsonFile.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                if (!tmpFile.renameTo(jsonFile)) {
                    throw new IOException("Atomic rename from tmp to json failed: " + e.getMessage(), e);
                }
            }
            callFaultInjector(WriteStep.AFTER_ATOMIC_RENAME);

            // Step 6: fsync directory where supported
            callFaultInjector(WriteStep.BEFORE_DIR_FSYNC);
            try {
                try (FileChannel dirChannel = FileChannel.open(baseDir.toPath(), StandardOpenOption.READ)) {
                    dirChannel.force(true);
                }
            } catch (Exception ignored) {
                // Directory fsync is not supported on all OS/filesystems (e.g. Windows FAT/NTFS throws)
            }
            callFaultInjector(WriteStep.AFTER_DIR_FSYNC);

        } finally {
            lock.unlock();
        }
    }

    /**
     * Reads a single key with automatic recovery (picks newest valid of json, bak, tmp).
     */
    public String read(String key) throws IOException {
        ReentrantLock lock = getLockForKey(key);
        lock.lock();
        try {
            String encoded = encodeKey(key);
            File jsonFile = new File(baseDir, encoded + ".json");
            File bakFile = new File(baseDir, encoded + ".bak");
            File tmpFile = new File(baseDir, encoded + ".tmp");

            // 1. Try jsonFile
            if (jsonFile.exists()) {
                try {
                    Envelope env = Envelope.parseAndValidate(jsonFile, key);
                    return env.value;
                } catch (Exception e) {
                    // Mark json as corrupt
                    File corrupt = new File(baseDir, encoded + ".json.corrupt-" + System.currentTimeMillis());
                    jsonFile.renameTo(corrupt);
                    recordRecovery(new RecoveryEvent(key, "corrupt", "json invalid: " + e.getMessage()));
                }
            }

            // 2. Try bakFile
            if (bakFile.exists()) {
                try {
                    Envelope env = Envelope.parseAndValidate(bakFile, key);
                    recordRecovery(new RecoveryEvent(key, "bak", "Recovered from backup file"));
                    return env.value;
                } catch (Exception e) {
                    File corrupt = new File(baseDir, encoded + ".bak.corrupt-" + System.currentTimeMillis());
                    bakFile.renameTo(corrupt);
                    recordRecovery(new RecoveryEvent(key, "corrupt", "bak invalid: " + e.getMessage()));
                }
            }

            // 3. Try tmpFile
            if (tmpFile.exists()) {
                try {
                    Envelope env = Envelope.parseAndValidate(tmpFile, key);
                    recordRecovery(new RecoveryEvent(key, "tmp", "Recovered from validated tmp file"));
                    return env.value;
                } catch (Exception e) {
                    File corrupt = new File(baseDir, encoded + ".tmp.corrupt-" + System.currentTimeMillis());
                    tmpFile.renameTo(corrupt);
                    recordRecovery(new RecoveryEvent(key, "corrupt", "tmp invalid: " + e.getMessage()));
                }
            }

            return null;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Reads all stored keys in a single operation and reports recovery events.
     */
    public ReadResult readAll() {
        Map<String, String> data = new HashMap<>();
        List<RecoveryEvent> events = new ArrayList<>();

        File[] files = baseDir.listFiles();
        if (files == null || files.length == 0) {
            return new ReadResult(data, events);
        }

        Set<String> processedKeys = new HashSet<>();
        for (File f : files) {
            String name = f.getName();
            if (name.endsWith(".json") && !name.contains(".corrupt")) {
                String encoded = name.substring(0, name.length() - 5);
                try {
                    String key = decodeKey(encoded);
                    processedKeys.add(key);
                    String val = read(key);
                    if (val != null) {
                        data.put(key, val);
                    }
                } catch (Exception ignored) {
                }
            }
        }

        // Check for any orphaned bak/tmp files whose json was missing
        for (File f : files) {
            String name = f.getName();
            if ((name.endsWith(".bak") || name.endsWith(".tmp")) && !name.contains(".corrupt")) {
                int dotIdx = name.lastIndexOf('.');
                String encoded = name.substring(0, dotIdx);
                try {
                    String key = decodeKey(encoded);
                    if (!processedKeys.contains(key)) {
                        processedKeys.add(key);
                        String val = read(key);
                        if (val != null) {
                            data.put(key, val);
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }

        synchronized (recordedRecoveryEvents) {
            events.addAll(recordedRecoveryEvents);
            recordedRecoveryEvents.clear();
        }

        return new ReadResult(data, events);
    }

    public void remove(String key) throws IOException {
        ReentrantLock lock = getLockForKey(key);
        lock.lock();
        try {
            String encoded = encodeKey(key);
            File jsonFile = new File(baseDir, encoded + ".json");
            File bakFile = new File(baseDir, encoded + ".bak");
            File tmpFile = new File(baseDir, encoded + ".tmp");

            if (jsonFile.exists()) jsonFile.delete();
            if (bakFile.exists()) bakFile.delete();
            if (tmpFile.exists()) tmpFile.delete();
        } finally {
            lock.unlock();
        }
    }

    public void clear() throws IOException {
        File[] files = baseDir.listFiles();
        if (files != null) {
            for (File f : files) {
                f.delete();
            }
        }
    }

    public StoreStats stats() {
        File[] files = baseDir.listFiles();
        int count = 0;
        long bytes = 0;
        if (files != null) {
            for (File f : files) {
                if (f.getName().endsWith(".json") && !f.getName().contains(".corrupt")) {
                    count++;
                    bytes += f.length();
                }
            }
        }
        long free = baseDir.getFreeSpace();
        return new StoreStats(count, bytes, free);
    }

    public List<RecoveryEvent> getAndClearRecoveryEvents() {
        synchronized (recordedRecoveryEvents) {
            List<RecoveryEvent> copy = new ArrayList<>(recordedRecoveryEvents);
            recordedRecoveryEvents.clear();
            return copy;
        }
    }

    private void recordRecovery(RecoveryEvent event) {
        recordedRecoveryEvents.add(event);
    }
}
