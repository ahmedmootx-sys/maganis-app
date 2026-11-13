package app.maganis.coach;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.nio.file.Files;

import static org.junit.Assert.*;

/**
 * Verifies that WorkoutAlarmHelper reads and writes maganis:notify.schedule using
 * the exact same DurableFileStore format and instance lock used by MaganisNative.
 */
public class WorkoutAlarmStoreTest {

    private File tempDir;

    @Before
    public void setUp() throws Exception {
        tempDir = Files.createTempDirectory("bunyan-alarm-store-test-").toFile();
    }

    @After
    public void tearDown() {
        deleteRecursively(tempDir);
    }

    private void deleteRecursively(File f) {
        if (f == null || !f.exists()) return;
        File[] children = f.listFiles();
        if (children != null) {
            for (File c : children) {
                deleteRecursively(c);
            }
        }
        f.delete();
    }

    @Test
    public void testScheduleWriteReadRoundTripMatchesDurableFileStore() throws Exception {
        String sampleSchedule = "[{\"id\":900001,\"type\":\"workout_day\",\"triggerAt\":1900000000000,\"isSnooze\":true}]";

        WorkoutAlarmHelper.writeScheduleJson(tempDir, sampleSchedule);

        // Must be readable both through WorkoutAlarmHelper.readScheduleJson and MaganisNative's DurableFileStore
        String fromHelper = WorkoutAlarmHelper.readScheduleJson(tempDir);
        assertEquals(sampleSchedule, fromHelper);

        DurableFileStore store = WorkoutAlarmHelper.getSharedKvStore(tempDir);
        String fromStore = store.read(WorkoutAlarmHelper.SCHEDULE_STORE_KEY);
        assertEquals(sampleSchedule, fromStore);

        // Must write hex-encoded .json file with MAGANIS_KV_V1 envelope, not raw literal filename
        String expectedFileName = DurableFileStore.encodeKey(WorkoutAlarmHelper.SCHEDULE_STORE_KEY) + ".json";
        File encodedFile = new File(tempDir, expectedFileName);
        assertTrue("Expected DurableFileStore hex envelope file to exist", encodedFile.exists());
        assertFalse("Must not create literal unencoded schedule file", new File(tempDir, "maganis-notify.schedule").exists());
    }

    @Test
    public void testSharedStoreReadWrittenByDurableFileStoreDirectly() throws Exception {
        DurableFileStore nativeLikeStore = new DurableFileStore(tempDir);
        String tsSchedule = "[{\"id\":12345,\"type\":\"workout_day\",\"triggerAt\":1999999999999,\"isSnooze\":false}]";
        nativeLikeStore.write("maganis:notify.schedule", tsSchedule);

        String readByAlarmRestore = WorkoutAlarmHelper.readScheduleJson(tempDir);
        assertEquals(tsSchedule, readByAlarmRestore);
    }

    @Test
    public void testGetSharedKvStoreReturnsSameInstanceForCanonicalDir() {
        DurableFileStore a = WorkoutAlarmHelper.getSharedKvStore(tempDir);
        DurableFileStore b = WorkoutAlarmHelper.getSharedKvStore(new File(tempDir, "."));
        assertSame(a, b);
    }
}
