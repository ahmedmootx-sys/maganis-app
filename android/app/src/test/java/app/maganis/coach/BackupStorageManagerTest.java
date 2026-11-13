package app.maganis.coach;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

public class BackupStorageManagerTest {

    private File tempDir;

    @Before
    public void setUp() throws Exception {
        tempDir = Files.createTempDirectory("maganis-backup-test-").toFile();
    }

    @After
    public void tearDown() {
        if (tempDir != null && tempDir.exists()) {
            File[] files = tempDir.listFiles();
            if (files != null) {
                for (File f : files) {
                    f.delete();
                }
            }
            tempDir.delete();
        }
    }

    @Test
    public void testValidBackupFileName() {
        assertTrue(BackupStorageManager.isValidBackupFileName("maganis-backup-2026-11-04-1230.json"));
        assertTrue(BackupStorageManager.isValidBackupFileName("maganis-backup-2026-11-04-123045.json"));
        assertTrue(BackupStorageManager.isValidBackupFileName("bunyan-backup-2026-11-12-1000.json"));

        // Invalid patterns and foreign names
        assertFalse(BackupStorageManager.isValidBackupFileName("maganis-backup.json"));
        assertFalse(BackupStorageManager.isValidBackupFileName("backup-2026-11-04.json"));
        assertFalse(BackupStorageManager.isValidBackupFileName("photo.jpg"));
        assertFalse(BackupStorageManager.isValidBackupFileName("maganis-backup-2026-11-04-1230.txt"));
        assertFalse(BackupStorageManager.isValidBackupFileName("maganis-backup-invalid-date.json"));
        assertFalse(BackupStorageManager.isValidBackupFileName(null));
        assertFalse(BackupStorageManager.isValidBackupFileName(""));
    }

    @Test
    public void testSnapshotMarkerDetection() throws Exception {
        String validSnapshotJson = "{\"format\":\"maganis-snapshot\",\"exportVersion\":2,\"createdAt\":1730000000000}";
        ByteArrayInputStream is1 = new ByteArrayInputStream(validSnapshotJson.getBytes(StandardCharsets.UTF_8));
        assertTrue(BackupStorageManager.hasSnapshotMarker(is1));

        String validSnapshotJsonSpaced = "{\n  \"format\": \"maganis-snapshot\",\n  \"exportVersion\": 2\n}";
        ByteArrayInputStream is2 = new ByteArrayInputStream(validSnapshotJsonSpaced.getBytes(StandardCharsets.UTF_8));
        assertTrue(BackupStorageManager.hasSnapshotMarker(is2));

        String foreignJson = "{\"title\":\"shopping list\",\"items\":[\"apples\",\"milk\"]}";
        ByteArrayInputStream is3 = new ByteArrayInputStream(foreignJson.getBytes(StandardCharsets.UTF_8));
        assertFalse(BackupStorageManager.hasSnapshotMarker(is3));

        // Physical file check
        File validFile = new File(tempDir, "maganis-backup-2026-11-04-1000.json");
        try (FileOutputStream fos = new FileOutputStream(validFile)) {
            fos.write(validSnapshotJson.getBytes(StandardCharsets.UTF_8));
        }
        assertTrue(BackupStorageManager.hasSnapshotMarker(validFile));

        File foreignFile = new File(tempDir, "foreign.json");
        try (FileOutputStream fos = new FileOutputStream(foreignFile)) {
            fos.write(foreignJson.getBytes(StandardCharsets.UTF_8));
        }
        assertFalse(BackupStorageManager.hasSnapshotMarker(foreignFile));
    }

    @Test
    public void testDigestCalculationAndIncrementalHasher() throws Exception {
        byte[] payload = "Hello Maganis Native Storage Testing Digest!".getBytes(StandardCharsets.UTF_8);

        // Expected SHA-256 for this exact byte string
        BackupStorageManager.VerifyResult fullResult =
                BackupStorageManager.calculateStreamDigest(new ByteArrayInputStream(payload));

        assertEquals(payload.length, fullResult.bytes);
        assertNotNull(fullResult.sha256);
        assertEquals(64, fullResult.sha256.length());

        // Test incremental hasher in 5-byte chunks
        BackupStorageManager.IncrementalHasher hasher = new BackupStorageManager.IncrementalHasher();
        int offset = 0;
        int chunkSize = 5;
        while (offset < payload.length) {
            int len = Math.min(chunkSize, payload.length - offset);
            hasher.update(payload, offset, len);
            offset += len;
        }

        BackupStorageManager.VerifyResult incResult = hasher.finish();
        assertEquals(fullResult.bytes, incResult.bytes);
        assertEquals(fullResult.sha256, incResult.sha256);
    }

    @Test
    public void testRetentionRuleNeverPrunesWhenThreeOrFewer() {
        List<BackupStorageManager.BackupFileRecord> existing = new ArrayList<>();
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-01-1000.json", 1000, 1000, true));
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-02-1000.json", 1000, 2000, true));

        BackupStorageManager.BackupFileRecord newlyVerified =
                new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-03-1000.json", 1000, 3000, true);

        // Total files = 3. Exactly the minimum floor.
        List<String> pruned = BackupStorageManager.computeFilesToPrune(existing, newlyVerified);
        assertTrue("Must never prune when total files <= 3", pruned.isEmpty());
    }

    @Test
    public void testRetentionRulePrunesOldestWhenOverTenFiles() {
        List<BackupStorageManager.BackupFileRecord> existing = new ArrayList<>();
        // Create 11 existing verified files
        for (int i = 1; i <= 11; i++) {
            String name = String.format("maganis-backup-2026-11-%02d-1000.json", i);
            long time = 10000L + (i * 1000L);
            existing.add(new BackupStorageManager.BackupFileRecord(name, 1024, time, true));
        }

        // Add 12th verified file
        BackupStorageManager.BackupFileRecord newlyVerified =
                new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-12-1000.json", 1024, 25000L, true);

        // 12 files total. Max is 10. Oldest 2 should be pruned: day 01 and day 02.
        List<String> pruned = BackupStorageManager.computeFilesToPrune(existing, newlyVerified);
        assertEquals(2, pruned.size());
        assertTrue(pruned.contains("maganis-backup-2026-11-01-1000.json"));
        assertTrue(pruned.contains("maganis-backup-2026-11-02-1000.json"));
        assertFalse(pruned.contains("maganis-backup-2026-11-12-1000.json"));
    }

    @Test
    public void testRetentionRuleEnforces200MbCapWhileRespectingMinimumFloor() {
        List<BackupStorageManager.BackupFileRecord> existing = new ArrayList<>();
        // 5 files, each 60 MB -> total 300 MB (over 200 MB cap)
        long sixtyMb = 60L * 1024L * 1024L;
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-01-1000.json", sixtyMb, 1000L, true));
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-02-1000.json", sixtyMb, 2000L, true));
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-03-1000.json", sixtyMb, 3000L, true));
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-04-1000.json", sixtyMb, 4000L, true));

        BackupStorageManager.BackupFileRecord newlyVerified =
                new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-05-1000.json", sixtyMb, 5000L, true);

        // Total 5 files of 60 MB = 300 MB.
        // Dropping oldest (day 01): remaining 4 files = 240 MB (> 200 MB).
        // Dropping next oldest (day 02): remaining 3 files = 180 MB (<= 200 MB).
        // Remaining = 3 files (meets MIN_BACKUP_RETENTION floor).
        List<String> pruned = BackupStorageManager.computeFilesToPrune(existing, newlyVerified);
        assertEquals(2, pruned.size());
        assertTrue(pruned.contains("maganis-backup-2026-11-01-1000.json"));
        assertTrue(pruned.contains("maganis-backup-2026-11-02-1000.json"));
    }

    @Test
    public void testRetentionNeverPrunesForeignOrUnverifiedFiles() {
        List<BackupStorageManager.BackupFileRecord> existing = new ArrayList<>();
        // 12 files, but some are foreign or unverified
        existing.add(new BackupStorageManager.BackupFileRecord("other-file.json", 1024, 1000L, false));
        existing.add(new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-01-1000.json", 1024, 1100L, false)); // unverified!
        for (int i = 2; i <= 10; i++) {
            String name = String.format("maganis-backup-2026-11-%02d-1000.json", i);
            existing.add(new BackupStorageManager.BackupFileRecord(name, 1024, 10000L + i, true));
        }

        BackupStorageManager.BackupFileRecord newlyVerified =
                new BackupStorageManager.BackupFileRecord("maganis-backup-2026-11-11-1000.json", 1024, 20000L, true);

        List<String> pruned = BackupStorageManager.computeFilesToPrune(existing, newlyVerified);
        // Foreign and unverified must never be in pruned list
        assertFalse(pruned.contains("other-file.json"));
        assertFalse(pruned.contains("maganis-backup-2026-11-01-1000.json"));
    }
}

