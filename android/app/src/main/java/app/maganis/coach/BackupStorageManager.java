package app.maganis.coach;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * BackupStorageManager: Plain Java utility for backup file name validation,
 * foreign file protection, SHA-256 streaming verification, and retention policy calculation.
 *
 * Implements strict rules for Task N3:
 * - Retention: Keep newest 10 verified files.
 * - Total size cap: 200 MB (drop oldest first).
 * - Minimum floor: Never delete when fewer than 3 verified files would remain.
 * - Foreign file protection: Never delete or prune a file that does not match the
 *   name pattern AND the internal "maganis-snapshot" marker.
 * - Zero Android framework dependencies for fast JVM unit testing.
 */
public class BackupStorageManager {

    public static final int MAX_BACKUP_FILES = 10;
    public static final long MAX_BACKUP_TOTAL_BYTES = 200L * 1024L * 1024L; // 200 MB
    public static final int MIN_BACKUP_RETENTION = 3;

    private static final Pattern BACKUP_FILENAME_PATTERN =
            Pattern.compile("^maganis-backup-\\d{4}-\\d{2}-\\d{2}-\\d{4}(\\d{2})?\\.json$");

    private static final String SNAPSHOT_MARKER = "\"format\":\"maganis-snapshot\"";
    private static final String SNAPSHOT_MARKER_SPACED = "\"format\": \"maganis-snapshot\"";

    public static class BackupFileRecord {
        public final String name;
        public final long sizeBytes;
        public final long modifiedTimestamp;
        public final boolean isOwnVerified;

        public BackupFileRecord(String name, long sizeBytes, long modifiedTimestamp, boolean isOwnVerified) {
            this.name = name;
            this.sizeBytes = sizeBytes;
            this.modifiedTimestamp = modifiedTimestamp;
            this.isOwnVerified = isOwnVerified;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            BackupFileRecord that = (BackupFileRecord) o;
            return Objects.equals(name, that.name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }
    }

    public static class VerifyResult {
        public final long bytes;
        public final String sha256;

        public VerifyResult(long bytes, String sha256) {
            this.bytes = bytes;
            this.sha256 = sha256;
        }
    }

    /**
     * Validates whether a file name matches the Maganis backup pattern:
     * maganis-backup-YYYY-MM-DD-HHmm.json or maganis-backup-YYYY-MM-DD-HHmmss.json
     */
    public static boolean isValidBackupFileName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        return BACKUP_FILENAME_PATTERN.matcher(name).matches();
    }

    /**
     * Checks whether file content contains the Maganis Snapshot marker.
     * Inspects up to the first 4096 bytes of the stream.
     */
    public static boolean hasSnapshotMarker(InputStream is) throws IOException {
        byte[] buffer = new byte[4096];
        int read = is.read(buffer);
        if (read <= 0) {
            return false;
        }
        String header = new String(buffer, 0, read, StandardCharsets.UTF_8);
        return header.contains(SNAPSHOT_MARKER) || header.contains(SNAPSHOT_MARKER_SPACED);
    }

    /**
     * Checks whether a physical file contains the Maganis Snapshot marker.
     */
    public static boolean hasSnapshotMarker(File file) {
        if (file == null || !file.exists() || !file.isFile() || file.length() == 0) {
            return false;
        }
        try (FileInputStream fis = new FileInputStream(file)) {
            return hasSnapshotMarker(fis);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Calculates SHA-256 and total bytes of an InputStream in a single streaming pass.
     */
    public static VerifyResult calculateStreamDigest(InputStream is) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] buf = new byte[16384];
            long totalBytes = 0;
            int r;
            while ((r = is.read(buf)) != -1) {
                md.update(buf, 0, r);
                totalBytes += r;
            }
            byte[] digest = md.digest();
            return new VerifyResult(totalBytes, bytesToHex(digest));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Calculates SHA-256 and total bytes of a physical file.
     */
    public static VerifyResult calculateFileDigest(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            return calculateStreamDigest(fis);
        }
    }

    /**
     * Incremental SHA-256 builder for chunked append operations.
     */
    public static class IncrementalHasher {
        private final MessageDigest md;
        private long totalBytes = 0;

        public IncrementalHasher() {
            try {
                this.md = MessageDigest.getInstance("SHA-256");
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("SHA-256 not available", e);
            }
        }

        public synchronized void update(byte[] data, int offset, int length) {
            md.update(data, offset, length);
            totalBytes += length;
        }

        public synchronized void update(byte[] data) {
            update(data, 0, data.length);
        }

        public synchronized VerifyResult finish() {
            byte[] digest = md.digest();
            return new VerifyResult(totalBytes, bytesToHex(digest));
        }

        public synchronized long getTotalBytes() {
            return totalBytes;
        }
    }

    /**
     * Computes the list of filenames to prune according to Task N3 retention rules:
     * 1. Only prune files that are own, verified, and match the backup file name pattern.
     * 2. Keep the newest 10 files.
     * 3. Cap total size at 200 MB (pruning oldest first).
     * 4. NEVER prune if fewer than 3 verified files would remain.
     *
     * @param existingFiles currently existing files in the destination
     * @param newlyVerified optional newly verified file to include in retention calculation
     * @return List of file names that should be safely deleted
     */
    public static List<String> computeFilesToPrune(
            List<BackupFileRecord> existingFiles,
            BackupFileRecord newlyVerified
    ) {
        if (existingFiles == null) {
            existingFiles = Collections.emptyList();
        }

        // Build unique set of candidate files
        Set<BackupFileRecord> set = new HashSet<>(existingFiles);
        if (newlyVerified != null) {
            set.add(newlyVerified);
        }

        // Filter: only valid backup names and verified own files
        List<BackupFileRecord> validFiles = new ArrayList<>();
        for (BackupFileRecord rec : set) {
            if (rec != null && isValidBackupFileName(rec.name) && rec.isOwnVerified) {
                validFiles.add(rec);
            }
        }

        // If total verified files <= MIN_BACKUP_RETENTION (3), never delete anything
        if (validFiles.size() <= MIN_BACKUP_RETENTION) {
            return Collections.emptyList();
        }

        // Sort descending: newest first, oldest last
        validFiles.sort(new Comparator<BackupFileRecord>() {
            @Override
            public int compare(BackupFileRecord a, BackupFileRecord b) {
                int cmp = Long.compare(b.modifiedTimestamp, a.modifiedTimestamp);
                if (cmp != 0) return cmp;
                return b.name.compareTo(a.name);
            }
        });

        Set<String> toPrune = new HashSet<>();

        // Rule 1: Files beyond the newest 10 (index >= 10)
        for (int i = MAX_BACKUP_FILES; i < validFiles.size(); i++) {
            if (validFiles.size() - toPrune.size() > MIN_BACKUP_RETENTION) {
                toPrune.add(validFiles.get(i).name);
            }
        }

        // Rule 2: Total size cap (200 MB)
        // Calculate remaining size
        long currentTotalSize = 0;
        for (BackupFileRecord f : validFiles) {
            if (!toPrune.contains(f.name)) {
                currentTotalSize += f.sizeBytes;
            }
        }

        // If over 200 MB, drop oldest remaining files until size <= 200 MB or down to MIN_BACKUP_RETENTION
        if (currentTotalSize > MAX_BACKUP_TOTAL_BYTES) {
            for (int i = validFiles.size() - 1; i >= 0; i--) {
                BackupFileRecord candidate = validFiles.get(i);
                if (!toPrune.contains(candidate.name)) {
                    if (validFiles.size() - toPrune.size() <= MIN_BACKUP_RETENTION) {
                        // Floor reached: never delete if <= 3 would remain
                        break;
                    }
                    toPrune.add(candidate.name);
                    currentTotalSize -= candidate.sizeBytes;
                    if (currentTotalSize <= MAX_BACKUP_TOTAL_BYTES) {
                        break;
                    }
                }
            }
        }

        // Never prune the newly verified file itself!
        if (newlyVerified != null) {
            toPrune.remove(newlyVerified.name);
        }

        return new ArrayList<>(toPrune);
    }

    public static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

