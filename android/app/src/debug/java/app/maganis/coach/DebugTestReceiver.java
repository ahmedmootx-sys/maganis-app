package app.maganis.coach;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import java.io.File;
import java.util.List;

/**
 * Debug-only broadcast receiver for CI emulator storage tests (Task N6.3).
 *
 * Rules:
 * - Compiled ONLY into the debug variant (lives under src/debug/).
 * - Strictly absent from the release APK (enforced by gate).
 * - Off by default, activated only via explicit broadcast with matching action.
 */
public class DebugTestReceiver extends BroadcastReceiver {
    private static final String TAG = "DebugTestReceiver";
    public static final String ACTION_TEST = "app.maganis.coach.TEST_ACTION";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_TEST.equals(intent.getAction())) {
            return;
        }

        String cmd = intent.getStringExtra("cmd");
        if (cmd == null) return;

        File kvDir = new File(context.getFilesDir(), "maganis/kv");
        DurableFileStore store = new DurableFileStore(kvDir);

        Bundle resultData = new Bundle();

        try {
            switch (cmd) {
                case "PING": {
                    resultData.putString("status", "PONG");
                    setResult(1, "PONG", resultData);
                    break;
                }
                case "WRITE": {
                    String key = intent.getStringExtra("key");
                    String val = intent.getStringExtra("val");
                    if (key == null || val == null) {
                        setResult(-1, "MISSING_PARAMS", resultData);
                        return;
                    }
                    store.write(key, val);
                    resultData.putString("status", "OK");
                    setResult(1, "OK", resultData);
                    break;
                }
                case "READ": {
                    String key = intent.getStringExtra("key");
                    if (key == null) {
                        setResult(-1, "MISSING_KEY", resultData);
                        return;
                    }
                    String val = store.read(key);
                    resultData.putString("status", "OK");
                    resultData.putString("val", val);
                    setResult(1, val != null ? val : "NULL", resultData);
                    break;
                }
                case "GET_EVENTS": {
                    List<DurableFileStore.RecoveryEvent> events = store.getAndClearRecoveryEvents();
                    StringBuilder sb = new StringBuilder();
                    for (DurableFileStore.RecoveryEvent e : events) {
                        if (sb.length() > 0) sb.append(";");
                        sb.append(e.key).append(":").append(e.recoveredFrom).append(":").append(e.reason);
                    }
                    String res = sb.toString();
                    resultData.putString("events", res);
                    setResult(1, res, resultData);
                    break;
                }
                case "ENCODE_KEY": {
                    String key = intent.getStringExtra("key");
                    String encoded = DurableFileStore.encodeKey(key);
                    resultData.putString("encoded", encoded);
                    setResult(1, encoded, resultData);
                    break;
                }
                default:
                    setResult(0, "UNKNOWN_CMD", resultData);
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error executing test cmd " + cmd, e);
            resultData.putString("error", e.getMessage());
            setResult(-1, "ERROR: " + e.getMessage(), resultData);
        }
    }
}
