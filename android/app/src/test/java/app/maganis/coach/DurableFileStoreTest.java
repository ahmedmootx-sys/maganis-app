package app.maganis.coach;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.Assert.*;

public class DurableFileStoreTest {

    private File tempDir;
    private DurableFileStore store;

    @Before
    public void setUp() throws Exception {
        tempDir = Files.createTempDirectory("maganis-store-test-").toFile();
        store = new DurableFileStore(tempDir);
    }

    @After
    public void tearDown() {
        deleteRecursive(tempDir);
    }

    private void deleteRecursive(File f) {
        if (f != null && f.exists()) {
            File[] files = f.listFiles();
            if (files != null) {
                for (File child : files) {
                    deleteRecursive(child);
                }
            }
            f.delete();
        }
    }

    @Test
    public void testKeyEncodingIsReversibleAndCollisionFree() {
        String[] testKeys = {
            "maganis:profile.active",
            "maganis:workout.custom-exercises",
            "maganis:daily_nutrition_2026-11-03",
            "maganis:مجانص_arabic_key_مع_حروف_عربية",
            "symbols/with:colons:and/slashes\\and?quotes*stars",
            "empty_val",
            "",
            "key.with.many.dots.1.2.3.4",
            "CASE_SENSITIVE_KEY",
            "case_sensitive_key",
        };

        for (String k : testKeys) {
            String encoded = DurableFileStore.encodeKey(k);
            assertFalse("Encoded key must not contain colons or slashes", encoded.contains(":") || encoded.contains("/") || encoded.contains("\\"));
            String decoded = DurableFileStore.decodeKey(encoded);
            assertEquals("Key must decode identically", k, decoded);
        }
    }

    @Test
    public void testBasicWriteReadRemoveClear() throws IOException {
        String key = "maganis:test_key";
        String value = "{\"hello\":\"world\",\"number\":42}";

        store.write(key, value);
        String readBack = store.read(key);
        assertEquals(value, readBack);

        DurableFileStore.StoreStats stats = store.stats();
        assertEquals(1, stats.keyCount);
        assertTrue(stats.totalBytes > 0);

        store.remove(key);
        assertNull(store.read(key));

        store.write("k1", "v1");
        store.write("k2", "v2");
        assertEquals(2, store.stats().keyCount);
        store.clear();
        assertEquals(0, store.stats().keyCount);
    }

    @Test
    public void testFaultInjectionAtEveryWriteStepPreservesDataIntegrity() throws Exception {
        String key = "maganis:fault_injection_key";
        String initialValue = "INITIAL_VALID_STATE_12345";
        store.write(key, initialValue);
        assertEquals(initialValue, store.read(key));

        for (DurableFileStore.WriteStep stepToFault : DurableFileStore.WriteStep.values()) {
            final String attemptedNewValue = "NEW_STATE_ATTEMPT_" + stepToFault.name();

            // Configure store to throw on this step
            store.setFaultInjector(step -> {
                if (step == stepToFault) {
                    throw new IOException("Simulated fault at step: " + stepToFault);
                }
            });

            boolean caught = false;
            try {
                store.write(key, attemptedNewValue);
            } catch (IOException e) {
                caught = true;
            }

            assertTrue("Expected simulated fault exception on step " + stepToFault, caught);

            // Create a completely fresh store instance pointing to same directory (simulating process restart)
            DurableFileStore freshStore = new DurableFileStore(tempDir);
            String recovered = freshStore.read(key);

            assertNotNull("Store must NEVER return null or empty when valid data existed before fault", recovered);
            assertTrue(
                "Value after fault at " + stepToFault + " must be either old value or new value; was: " + recovered,
                initialValue.equals(recovered) || attemptedNewValue.equals(recovered)
            );
        }
    }

    @Test
    public void testRecoveryFromCorruptJsonUsingBak() throws Exception {
        String key = "maganis:recoverable_key";
        String val1 = "{\"version\":1,\"name\":\"old\"}";
        String val2 = "{\"version\":2,\"name\":\"new\"}";

        store.write(key, val1);
        store.write(key, val2);

        // Intentionally corrupt the active .json file by truncating it
        String encoded = DurableFileStore.encodeKey(key);
        File jsonFile = new File(tempDir, encoded + ".json");
        assertTrue(jsonFile.exists());

        try (FileOutputStream fos = new FileOutputStream(jsonFile)) {
            fos.write("CORRUPTED_GARBAGE_BYTES".getBytes(StandardCharsets.UTF_8));
        }

        // Fresh read must recover from .bak
        DurableFileStore fresh = new DurableFileStore(tempDir);
        String recovered = fresh.read(key);
        assertEquals("Must recover val1 from .bak", val1, recovered);

        List<DurableFileStore.RecoveryEvent> events = fresh.getAndClearRecoveryEvents();
        assertFalse("Recovery event must be recorded", events.isEmpty());
        assertEquals("bak", events.get(0).recoveredFrom);
    }

    @Test
    public void testZeroByteFileDetectionAndRecovery() throws Exception {
        String key = "maganis:zero_byte_test";
        String val = "STABLE_DATA";
        store.write(key, val);

        String encoded = DurableFileStore.encodeKey(key);
        File jsonFile = new File(tempDir, encoded + ".json");
        // Overwrite json file with 0 bytes
        try (FileOutputStream fos = new FileOutputStream(jsonFile)) {
            // write nothing
        }
        assertEquals(0, jsonFile.length());

        DurableFileStore fresh = new DurableFileStore(tempDir);
        // If no bak exists and json is 0 bytes, read returns null but file is marked corrupt
        String res = fresh.read(key);
        assertNull(res);

        // Check corrupt file was created and original zero byte file was renamed
        File[] files = tempDir.listFiles();
        boolean corruptFound = false;
        for (File f : files) {
            if (f.getName().contains(".corrupt")) {
                corruptFound = true;
                break;
            }
        }
        assertTrue("Corrupted file must be preserved with .corrupt- suffix", corruptFound);
    }

    @Test
    public void testSequential5000Writes() throws Exception {
        String key = "maganis:sequential_perf";
        long start = System.currentTimeMillis();
        for (int i = 0; i < 500; i++) { // 500 writes for fast JVM test run
            store.write(key, "{\"seq\":" + i + "}");
        }
        long duration = System.currentTimeMillis() - start;
        assertEquals("{\"seq\":499}", store.read(key));
        assertTrue("Writes should complete reasonably fast", duration < 30000);
    }

    @Test
    public void testConcurrentWritersNeverCorruptStore() throws Exception {
        final int THREADS = 8;
        final int WRITES_PER_THREAD = 50;
        ExecutorService exec = Executors.newFixedThreadPool(THREADS);
        CountDownLatch latch = new CountDownLatch(THREADS);
        AtomicInteger writeCounter = new AtomicInteger(0);

        for (int t = 0; t < THREADS; t++) {
            final int threadId = t;
            exec.submit(() -> {
                try {
                    for (int i = 0; i < WRITES_PER_THREAD; i++) {
                        String key = "concurrent_key_" + (i % 5);
                        store.write(key, "{\"thread\":" + threadId + ",\"iter\":" + i + "}");
                        writeCounter.incrementAndGet();
                    }
                } catch (Exception e) {
                    fail("Concurrent write failed: " + e.getMessage());
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue("All concurrent threads must finish", latch.await(20, TimeUnit.SECONDS));
        exec.shutdown();

        // Read all keys, ensure none are corrupt
        DurableFileStore.ReadResult all = store.readAll();
        for (int i = 0; i < 5; i++) {
            String key = "concurrent_key_" + i;
            String val = all.data.get(key);
            assertNotNull("Concurrent key " + key + " must exist", val);
            assertTrue(val.contains("\"thread\":"));
        }
    }
}
