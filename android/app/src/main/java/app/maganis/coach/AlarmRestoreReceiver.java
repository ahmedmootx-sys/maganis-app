package app.maganis.coach;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;

/**
 * Task N4.8: Native Alarm & Notification Gap-Closing Receiver.
 * Android OS clears AlarmManager alarms upon device reboot, app update (MY_PACKAGE_REPLACED),
 * and permission changes.
 *
 * This receiver listens for:
 * - android.intent.action.MY_PACKAGE_REPLACED (app update over install)
 * - android.intent.action.BOOT_COMPLETED (device reboot fallback)
 * - android.intent.action.TIME_SET (system clock change)
 * - android.intent.action.TIMEZONE_CHANGED (system time zone shift)
 * - android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED (exact alarm granted/revoked)
 *
 * It re-arms all future alarms idempotently and drops past alarms without firing stale bursts.
 */
public class AlarmRestoreReceiver extends BroadcastReceiver {

    private static final String TAG = "MaganisAlarmRestore";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        Log.i(TAG, "Received broadcast action: " + action);

        // 1. Delegate to Capacitor's restore receiver to restore plugin storage
        try {
            com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver pluginReceiver =
                    new com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver();
            pluginReceiver.onReceive(context, intent);
            Log.i(TAG, "Capacitor LocalNotificationRestoreReceiver invoked successfully");
        } catch (Throwable t) {
            Log.w(TAG, "Could not invoke plugin restore receiver: " + t.getMessage());
        }

        // 2. Read atomic schedule file from DurableFileStore kv directory (maganis:notify.schedule)
        rearmFutureAlarmsFromStore(context);
    }

    private void rearmFutureAlarmsFromStore(Context context) {
        try {
            File kvDir = new File(context.getFilesDir(), "maganis/kv");
            String content = WorkoutAlarmHelper.readScheduleJson(kvDir);
            if (content == null || content.trim().isEmpty()) {
                return;
            }

            JSONArray items = new JSONArray(content);
            long now = System.currentTimeMillis();
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            int rearmedCount = 0;
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                int id = item.optInt("id", 0);
                long triggerAt = item.optLong("triggerAt", 0);
                String type = item.optString("type", "");
                String channelId = item.optString("channelId", "timer_v1");
                String title = item.optString("title", "بُنْيَان");
                String body = item.optString("body", "");
                boolean isExact = item.optBoolean("isExactNotification", false);
                boolean isSnooze = item.optBoolean("isSnooze", false);
                JSONObject extra = item.optJSONObject("extra");
                String route = extra != null ? extra.optString("route", "weekly_plan") : "weekly_plan";
                String targetDate = extra != null ? extra.optString("targetDate", "") : "";

                // Strictly drop expired past alarms
                if (triggerAt <= now || id <= 0) {
                    continue;
                }

                // Workout reminders & snoozed workout reminders re-arm natively with full Snooze actions
                if ("workout_day".equals(type) || isSnooze) {
                    WorkoutAlarmHelper.scheduleWorkoutAlarm(
                            context, id, triggerAt, channelId, title, body, route, targetDate, isExact
                    );
                    rearmedCount++;
                    continue;
                }

                // Other notification channels target Capacitor's TimedNotificationPublisher with exact contract keys
                Intent fireIntent = new Intent(context, com.capacitorjs.plugins.localnotifications.TimedNotificationPublisher.class);
                fireIntent.putExtra("LocalNotificationId", id);

                int iconRes = context.getResources().getIdentifier("ic_stat_bunyan", "drawable", context.getPackageName());
                if (iconRes == 0) {
                    iconRes = android.R.drawable.ic_popup_reminder;
                }

                // Build standard system notification
                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setSmallIcon(iconRes)
                        .setColor(0xFFEA6A15)
                        .setAutoCancel(true);

                // Open MainActivity on tap
                Intent tapIntent = new Intent(context, MainActivity.class);
                tapIntent.setAction(Intent.ACTION_MAIN);
                tapIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                tapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                tapIntent.putExtra("notificationId", id);
                tapIntent.putExtra("channelId", channelId);

                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                PendingIntent tapPending = PendingIntent.getActivity(context, id, tapIntent, flags);
                builder.setContentIntent(tapPending);

                fireIntent.putExtra("NotificationPublisher.notification", builder.build());

                PendingIntent alarmPending = PendingIntent.getBroadcast(context, id, fireIntent, flags);

                boolean canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms();
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
                rearmedCount++;
            }
            Log.i(TAG, "Re-armed " + rearmedCount + " future notifications successfully");
        } catch (Throwable t) {
            Log.w(TAG, "Failed to re-arm notifications from store: " + t.getMessage());
        }
    }
}

