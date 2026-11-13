package app.maganis.coach;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Calendar;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Native helper for Bunyan workout reminder alarms, rich Snooze action buttons,
 * silent background snoozing, and durable schedule updates in maganis:notify.schedule.
 */
public final class WorkoutAlarmHelper {

    public static final String TAG = "BunyanWorkoutAlarm";
    public static final String ACTION_FIRE_WORKOUT = "app.maganis.coach.ACTION_FIRE_WORKOUT";
    public static final String ACTION_SNOOZE_WORKOUT = "app.maganis.coach.ACTION_SNOOZE_WORKOUT";

    public static final String EXTRA_NOTIFICATION_ID = "notificationId";
    public static final String EXTRA_CHANNEL_ID = "channelId";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_ROUTE = "route";
    public static final String EXTRA_TARGET_DATE = "targetDate";
    public static final String EXTRA_SNOOZE_MINUTES = "snoozeMinutes";
    public static final String EXTRA_SNOOZE_TOMORROW = "snoozeTomorrow";

    public static final String DEFAULT_CHANNEL_ID = "workout_v1";
    public static final String SCHEDULE_STORE_KEY = "maganis:notify.schedule";
    public static final int BRAND_COLOR = 0xFFEA6A15;

    private static final Object KV_LOCK = new Object();
    private static final ConcurrentHashMap<String, DurableFileStore> KV_STORES = new ConcurrentHashMap<>();

    private WorkoutAlarmHelper() {}

    public static DurableFileStore getSharedKvStore(File kvDir) {
        String cacheKey;
        try {
            cacheKey = kvDir.getCanonicalPath();
        } catch (IOException e) {
            cacheKey = kvDir.getAbsolutePath();
        }
        return KV_STORES.computeIfAbsent(cacheKey, k -> new DurableFileStore(kvDir));
    }

    public static void ensureWorkoutChannel(Context context, String channelId) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        String resolvedId = (channelId == null || channelId.isEmpty()) ? DEFAULT_CHANNEL_ID : channelId;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (nm.getNotificationChannel(resolvedId) != null) return;

        NotificationChannel ch = new NotificationChannel(
                resolvedId,
                "تذكيرات التمرين",
                NotificationManager.IMPORTANCE_DEFAULT
        );
        ch.setDescription("تنبيه بأيام التمرين المحددة في جدولك");
        ch.enableVibration(true);
        ch.enableLights(true);
        ch.setLightColor(BRAND_COLOR);
        nm.createNotificationChannel(ch);
    }

    public static void scheduleWorkoutAlarm(
            Context context,
            int id,
            long triggerAt,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate,
            boolean isExact
    ) {
        if (id <= 0 || triggerAt <= System.currentTimeMillis()) {
            return;
        }
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        ensureWorkoutChannel(context, channelId);

        PendingIntent alarmPending = buildFirePendingIntent(
                context, id, channelId, title, body, route, targetDate
        );

        boolean canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms();
        try {
            if (isExact && canExact) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
                }
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
                }
            }
        } catch (SecurityException se) {
            Log.w(TAG, "Exact alarm denied, falling back to inexact: " + se.getMessage());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, alarmPending);
            }
        }
    }

    public static void cancelWorkoutAlarm(Context context, int id) {
        if (id <= 0) return;
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            Intent fireIntent = new Intent(context, NotificationSnoozeReceiver.class);
            fireIntent.setAction(ACTION_FIRE_WORKOUT);
            int flags = PendingIntent.FLAG_NO_CREATE;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent existing = PendingIntent.getBroadcast(context, id, fireIntent, flags);
            if (existing != null) {
                alarmManager.cancel(existing);
                existing.cancel();
            }
        }
        try {
            NotificationManagerCompat.from(context).cancel(id);
        } catch (Throwable ignored) {
        }
    }

    public static void showWorkoutNotification(
            Context context,
            int id,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate
    ) {
        String resolvedChannel = (channelId == null || channelId.isEmpty()) ? DEFAULT_CHANNEL_ID : channelId;
        String resolvedTitle = (title == null || title.isEmpty()) ? "بُنْيَان — تمرين اليوم جاهز" : title;
        String resolvedBody = body != null ? body : "معاد تمرينك جهز في جدولك.";
        String resolvedRoute = (route == null || route.isEmpty()) ? "weekly_plan" : route;

        ensureWorkoutChannel(context, resolvedChannel);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "POST_NOTIFICATIONS permission missing; skipping notify");
                return;
            }
        }

        int iconRes = context.getResources().getIdentifier("ic_stat_bunyan", "drawable", context.getPackageName());
        if (iconRes == 0) {
            iconRes = android.R.drawable.ic_popup_reminder;
        }

        // Body tap opens MainActivity cleanly (with Capacitor LocalNotification action payload)
        Intent tapIntent = new Intent(context, MainActivity.class);
        tapIntent.setAction(Intent.ACTION_MAIN);
        tapIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        tapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        tapIntent.putExtra(EXTRA_NOTIFICATION_ID, id);
        tapIntent.putExtra(EXTRA_CHANNEL_ID, resolvedChannel);
        tapIntent.putExtra(EXTRA_ROUTE, resolvedRoute);
        tapIntent.putExtra(EXTRA_TARGET_DATE, targetDate != null ? targetDate : "");
        tapIntent.putExtra("LocalNotificationId", id);
        tapIntent.putExtra("LocalNotificationUserAction", "tap");
        try {
            JSONObject notifObj = new JSONObject();
            notifObj.put("id", id);
            notifObj.put("title", resolvedTitle);
            notifObj.put("body", resolvedBody);
            JSONObject extraObj = new JSONObject();
            extraObj.put("type", "workout_day");
            extraObj.put("route", resolvedRoute);
            if (targetDate != null && !targetDate.isEmpty()) {
                extraObj.put("targetDate", targetDate);
            }
            notifObj.put("extra", extraObj);
            tapIntent.putExtra("LocalNotficationObject", notifObj.toString());
        } catch (Exception ignored) {
        }

        int immutableFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            immutableFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent tapPending = PendingIntent.getActivity(context, id, tapIntent, immutableFlags);

        // Action 1: Silent Snooze 15m via BroadcastReceiver
        PendingIntent snooze15Pending = buildSnoozeBroadcastPendingIntent(
                context, id, 15, false, resolvedChannel, resolvedTitle, resolvedBody, resolvedRoute, targetDate, 1
        );

        // Action 2: Silent Snooze 1h via BroadcastReceiver
        PendingIntent snooze60Pending = buildSnoozeBroadcastPendingIntent(
                context, id, 60, false, resolvedChannel, resolvedTitle, resolvedBody, resolvedRoute, targetDate, 2
        );

        // Action 3: Transparent quick picker dialog with all 5 durations (15m, 30m, 1h, 3h, tomorrow)
        Intent pickerIntent = new Intent(context, SnoozePickerActivity.class);
        pickerIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NO_ANIMATION);
        pickerIntent.putExtra(EXTRA_NOTIFICATION_ID, id);
        pickerIntent.putExtra(EXTRA_CHANNEL_ID, resolvedChannel);
        pickerIntent.putExtra(EXTRA_TITLE, resolvedTitle);
        pickerIntent.putExtra(EXTRA_BODY, resolvedBody);
        pickerIntent.putExtra(EXTRA_ROUTE, resolvedRoute);
        pickerIntent.putExtra(EXTRA_TARGET_DATE, targetDate != null ? targetDate : "");
        PendingIntent morePending = PendingIntent.getActivity(
                context, computeActionRequestCode(id, 3), pickerIntent, immutableFlags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, resolvedChannel)
                .setSmallIcon(iconRes)
                .setColor(BRAND_COLOR)
                .setContentTitle(resolvedTitle)
                .setContentText(resolvedBody)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(resolvedBody))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .setContentIntent(tapPending)
                .addAction(0, "تأجيل 15د", snooze15Pending)
                .addAction(0, "تأجيل ساعة", snooze60Pending)
                .addAction(0, "خيارات أخرى...", morePending);

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build());
        } catch (SecurityException se) {
            Log.w(TAG, "Unable to post workout notification: " + se.getMessage());
        }
    }

    public static long computeSnoozeTriggerAt(int snoozeMinutes, boolean untilTomorrow) {
        long now = System.currentTimeMillis();
        if (untilTomorrow) {
            Calendar cal = Calendar.getInstance();
            cal.setTimeInMillis(now);
            cal.add(Calendar.DAY_OF_YEAR, 1);
            cal.set(Calendar.HOUR_OF_DAY, 9);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            return cal.getTimeInMillis();
        }
        int safeMins = Math.max(1, snoozeMinutes);
        return now + (long) safeMins * 60_000L;
    }

    public static long snoozeWorkoutNotification(
            Context context,
            int id,
            int snoozeMinutes,
            boolean untilTomorrow,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate
    ) {
        int safeId = id > 0 ? id : 900001;
        String resolvedChannel = (channelId == null || channelId.isEmpty()) ? DEFAULT_CHANNEL_ID : channelId;
        String resolvedTitle = (title == null || title.isEmpty()) ? "بُنْيَان — تمرين اليوم جاهز" : title;
        String resolvedBody = body != null ? body : "معاد تمرينك جهز في جدولك.";
        String resolvedRoute = (route == null || route.isEmpty()) ? "weekly_plan" : route;

        // 1. Dismiss visible notification immediately
        try {
            NotificationManagerCompat.from(context).cancel(safeId);
        } catch (Throwable ignored) {
        }

        // 2. Compute snooze target timestamp
        long nextTriggerAt = computeSnoozeTriggerAt(snoozeMinutes, untilTomorrow);

        // 3. Persist updated snooze entry atomically in DurableFileStore (maganis:notify.schedule)
        upsertScheduleEntry(
                context, safeId, nextTriggerAt, resolvedChannel, resolvedTitle, resolvedBody, resolvedRoute, targetDate, true, true
        );

        // 4. Re-arm native alarm (silent in background, exact if available)
        scheduleWorkoutAlarm(
                context, safeId, nextTriggerAt, resolvedChannel, resolvedTitle, resolvedBody, resolvedRoute, targetDate, true
        );

        Log.i(TAG, "Snoozed notification " + safeId + " to " + nextTriggerAt + " (tomorrow=" + untilTomorrow + ")");
        return nextTriggerAt;
    }

    static String readScheduleJson(File kvDir) {
        if (kvDir == null) return null;
        DurableFileStore store = getSharedKvStore(kvDir);
        synchronized (KV_LOCK) {
            try {
                String stored = store.read(SCHEDULE_STORE_KEY);
                if (stored != null && !stored.trim().isEmpty()) {
                    return stored;
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed reading schedule from DurableFileStore: " + e.getMessage());
            }

            // One-time migration fallback if a legacy unencoded raw file exists
            try {
                File legacyFile = new File(kvDir, SCHEDULE_STORE_KEY);
                if (legacyFile.exists() && legacyFile.isFile() && legacyFile.length() > 0) {
                    byte[] bytes = Files.readAllBytes(legacyFile.toPath());
                    String legacyJson = new String(bytes, StandardCharsets.UTF_8);
                    if (!legacyJson.trim().isEmpty()) {
                        store.write(SCHEDULE_STORE_KEY, legacyJson);
                        legacyFile.delete();
                        return legacyJson;
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed migrating legacy raw schedule file: " + e.getMessage());
            }
        }
        return null;
    }

    static void writeScheduleJson(File kvDir, String scheduleJson) throws IOException {
        if (kvDir == null || scheduleJson == null) return;
        DurableFileStore store = getSharedKvStore(kvDir);
        synchronized (KV_LOCK) {
            store.write(SCHEDULE_STORE_KEY, scheduleJson);
            try {
                File legacyFile = new File(kvDir, SCHEDULE_STORE_KEY);
                if (legacyFile.exists()) {
                    legacyFile.delete();
                }
            } catch (Exception ignored) {
            }
        }
    }

    public static void upsertScheduleEntry(
            Context context,
            int id,
            long triggerAt,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate,
            boolean isSnooze
    ) {
        upsertScheduleEntry(
                context, id, triggerAt, channelId, title, body, route, targetDate, isSnooze, isSnooze
        );
    }

    public static void upsertScheduleEntry(
            Context context,
            int id,
            long triggerAt,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate,
            boolean isSnooze,
            boolean isExact
    ) {
        File kvDir = new File(context.getFilesDir(), "maganis/kv");
        upsertScheduleEntry(
                kvDir, id, triggerAt, channelId, title, body, route, targetDate, isSnooze, isExact, System.currentTimeMillis()
        );
    }

    static void upsertScheduleEntry(
            File kvDir,
            int id,
            long triggerAt,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate,
            boolean isSnooze,
            boolean isExact,
            long now
    ) {
        synchronized (KV_LOCK) {
            try {
                if (!kvDir.exists()) kvDir.mkdirs();

                JSONArray items = new JSONArray();
                String raw = readScheduleJson(kvDir);
                if (raw != null && !raw.trim().isEmpty()) {
                    try {
                        items = new JSONArray(raw);
                    } catch (Exception parseErr) {
                        Log.w(TAG, "Could not parse existing schedule, resetting array: " + parseErr.getMessage());
                        items = new JSONArray();
                    }
                }

                JSONArray nextItems = new JSONArray();
                for (int i = 0; i < items.length(); i++) {
                    JSONObject existing = items.optJSONObject(i);
                    if (existing == null) continue;
                    int existingId = existing.optInt("id", -1);
                    long existingTrigger = existing.optLong("triggerAt", 0);
                    if (existingId == id) {
                        continue; // Replace this entry cleanly
                    }
                    if (existingTrigger > now) {
                        nextItems.put(existing);
                    }
                }

                JSONObject extra = new JSONObject();
                extra.put("type", "workout_day");
                extra.put("route", route != null ? route : "weekly_plan");
                if (targetDate != null && !targetDate.isEmpty()) {
                    extra.put("targetDate", targetDate);
                }

                JSONObject entry = new JSONObject();
                entry.put("id", id);
                entry.put("type", "workout_day");
                entry.put("channelId", channelId != null ? channelId : DEFAULT_CHANNEL_ID);
                entry.put("title", title);
                entry.put("body", body);
                entry.put("triggerAt", triggerAt);
                entry.put("isExactNotification", isExact);
                entry.put("isExactMandatory", false);
                entry.put("isSnooze", isSnooze);
                entry.put("extra", extra);
                nextItems.put(entry);

                writeScheduleJson(kvDir, nextItems.toString());
            } catch (Exception e) {
                Log.w(TAG, "Failed updating maganis:notify.schedule: " + e.getMessage());
            }
        }
    }

    private static PendingIntent buildFirePendingIntent(
            Context context,
            int id,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate
    ) {
        Intent fireIntent = new Intent(context, NotificationSnoozeReceiver.class);
        fireIntent.setAction(ACTION_FIRE_WORKOUT);
        fireIntent.putExtra(EXTRA_NOTIFICATION_ID, id);
        fireIntent.putExtra(EXTRA_CHANNEL_ID, channelId != null ? channelId : DEFAULT_CHANNEL_ID);
        fireIntent.putExtra(EXTRA_TITLE, title != null ? title : "");
        fireIntent.putExtra(EXTRA_BODY, body != null ? body : "");
        fireIntent.putExtra(EXTRA_ROUTE, route != null ? route : "weekly_plan");
        fireIntent.putExtra(EXTRA_TARGET_DATE, targetDate != null ? targetDate : "");

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, id, fireIntent, flags);
    }

    private static PendingIntent buildSnoozeBroadcastPendingIntent(
            Context context,
            int id,
            int snoozeMinutes,
            boolean untilTomorrow,
            String channelId,
            String title,
            String body,
            String route,
            String targetDate,
            int actionSlot
    ) {
        Intent snoozeIntent = new Intent(context, NotificationSnoozeReceiver.class);
        snoozeIntent.setAction(ACTION_SNOOZE_WORKOUT);
        snoozeIntent.putExtra(EXTRA_NOTIFICATION_ID, id);
        snoozeIntent.putExtra(EXTRA_SNOOZE_MINUTES, snoozeMinutes);
        snoozeIntent.putExtra(EXTRA_SNOOZE_TOMORROW, untilTomorrow);
        snoozeIntent.putExtra(EXTRA_CHANNEL_ID, channelId);
        snoozeIntent.putExtra(EXTRA_TITLE, title);
        snoozeIntent.putExtra(EXTRA_BODY, body);
        snoozeIntent.putExtra(EXTRA_ROUTE, route);
        snoozeIntent.putExtra(EXTRA_TARGET_DATE, targetDate != null ? targetDate : "");

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(
                context, computeActionRequestCode(id, actionSlot), snoozeIntent, flags
        );
    }

    private static int computeActionRequestCode(int id, int slot) {
        return ((id & 0x0FFFFFFF) * 4) + slot;
    }
}
