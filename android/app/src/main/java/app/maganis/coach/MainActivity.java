package app.maganis.coach;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MaganisActivity";
    public static final String PREFS_CRASH = "maganis_crash_loop";
    public static final String KEY_LAUNCH_TIMESTAMPS = "launch_timestamps";
    public static final String KEY_SAFE_MODE = "is_safe_mode";
    public static final long THREE_MINUTES_MS = 3 * 60 * 1000L;
    public static final long HEALTHY_THRESHOLD_MS = 30 * 1000L;
    public static final int MAX_LAUNCHES_BEFORE_SAFE_MODE = 3;

    private Handler healthyHandler;
    private Runnable healthyRunnable;
    private Thread.UncaughtExceptionHandler defaultHandler;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Step 1: Install native uncaught exception handler before super.onCreate
        installUncaughtExceptionHandler();

        // Step 2: Track launch for crash loop safe mode
        trackStartup();

        registerPlugin(MaganisNative.class);
        super.onCreate(savedInstanceState);
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        updateSystemBarsForTheme();

        // Step 3: Install WebViewClient for onRenderProcessGone recovery
        setupWebViewRendererRecovery();
    }

    private void installUncaughtExceptionHandler() {
        defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            try {
                File logsDir = new File(getFilesDir(), "maganis/logs");
                if (!logsDir.exists()) {
                    logsDir.mkdirs();
                }
                long epoch = System.currentTimeMillis();
                File crashFile = new File(logsDir, "native-crash-" + epoch + ".txt");
                try (PrintWriter pw = new PrintWriter(new FileWriter(crashFile, true))) {
                    pw.println("Crash Epoch: " + epoch);
                    pw.println("Thread: " + (thread != null ? thread.getName() : "unknown"));
                    pw.println("Android SDK: " + android.os.Build.VERSION.SDK_INT);
                    pw.println("Device: " + android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL);
                    pw.println("Exception: " + (throwable != null ? throwable.getClass().getName() : "null"));
                    pw.println("Message: " + (throwable != null ? throwable.getMessage() : "null"));
                    pw.println("--- Stack Trace ---");
                    if (throwable != null) {
                        throwable.printStackTrace(pw);
                    }
                }
            } catch (Throwable t) {
                Log.e(TAG, "Failed to write native crash file", t);
            } finally {
                if (defaultHandler != null) {
                    defaultHandler.uncaughtException(thread, throwable);
                }
            }
        });
    }

    private void trackStartup() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_CRASH, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY_LAUNCH_TIMESTAMPS, "");
            long now = System.currentTimeMillis();

            List<Long> recentLaunches = new ArrayList<>();
            if (!raw.isEmpty()) {
                String[] parts = raw.split(",");
                for (String p : parts) {
                    try {
                        long ts = Long.parseLong(p.trim());
                        if (now - ts <= THREE_MINUTES_MS) {
                            recentLaunches.add(ts);
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }

            // If started 3 times within 3 minutes without reaching 30s healthy point -> Safe Mode!
            boolean safeMode = recentLaunches.size() >= MAX_LAUNCHES_BEFORE_SAFE_MODE;
            recentLaunches.add(now);

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < recentLaunches.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(recentLaunches.get(i));
            }

            prefs.edit()
                .putString(KEY_LAUNCH_TIMESTAMPS, sb.toString())
                .putBoolean(KEY_SAFE_MODE, safeMode)
                .apply();

            if (safeMode) {
                Log.w(TAG, "Maganis entered SAFE MODE: " + recentLaunches.size() + " rapid launches detected.");
            }

            // Schedule 30-second healthy mark clearance
            healthyHandler = new Handler(Looper.getMainLooper());
            healthyRunnable = () -> {
                try {
                    SharedPreferences p = getSharedPreferences(PREFS_CRASH, Context.MODE_PRIVATE);
                    p.edit()
                        .remove(KEY_LAUNCH_TIMESTAMPS)
                        .putBoolean(KEY_SAFE_MODE, false)
                        .apply();
                    Log.i(TAG, "App reached 30s healthy threshold: crash loop counter reset.");
                } catch (Exception ignored) {}
            };
            healthyHandler.postDelayed(healthyRunnable, HEALTHY_THRESHOLD_MS);

        } catch (Exception e) {
            Log.e(TAG, "Error tracking startup crash loop", e);
        }
    }

    private void setupWebViewRendererRecovery() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                final WebView webView = getBridge().getWebView();
                webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                    @Override
                    public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                        boolean didCrash = detail != null && detail.didCrash();
                        Log.e(TAG, "WebView render process gone! didCrash=" + didCrash);

                        try {
                            File logsDir = new File(getFilesDir(), "maganis/logs");
                            if (!logsDir.exists()) logsDir.mkdirs();
                            File crashFile = new File(logsDir, "native-crash-render-process-" + System.currentTimeMillis() + ".txt");
                            try (FileWriter fw = new FileWriter(crashFile, true)) {
                                fw.write("RenderProcessGone: didCrash=" + didCrash + " priorityAtExit=" +
                                    (detail != null ? detail.rendererPriorityAtExit() : -1) + "\n");
                            }
                        } catch (Exception ignored) {}

                        // Clean up and recreate activity to reload with hydrated state
                        runOnUiThread(() -> {
                            recreate();
                        });
                        return true; // Prevents OS from terminating host app!
                    }
                });
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to setup WebView renderer recovery", e);
        }
    }

    @Override
    public void onDestroy() {
        if (healthyHandler != null && healthyRunnable != null) {
            healthyHandler.removeCallbacks(healthyRunnable);
        }
        super.onDestroy();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        updateSystemBarsForTheme();
    }

    private void updateSystemBarsForTheme() {
        int nightMode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        boolean isNight = (nightMode == Configuration.UI_MODE_NIGHT_YES);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(!isNight);
            controller.setAppearanceLightNavigationBars(!isNight);
        }
    }
}
