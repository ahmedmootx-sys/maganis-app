package app.maganis.coach;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Handles firing native Bunyan workout reminders (with 3 Snooze action buttons)
 * and silently executing background snooze actions (15m / 1h) without opening MainActivity.
 */
public class NotificationSnoozeReceiver extends BroadcastReceiver {

    private static final String TAG = "BunyanSnoozeReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        String action = intent.getAction();
        int id = intent.getIntExtra(WorkoutAlarmHelper.EXTRA_NOTIFICATION_ID, 900001);
        String channelId = intent.getStringExtra(WorkoutAlarmHelper.EXTRA_CHANNEL_ID);
        String title = intent.getStringExtra(WorkoutAlarmHelper.EXTRA_TITLE);
        String body = intent.getStringExtra(WorkoutAlarmHelper.EXTRA_BODY);
        String route = intent.getStringExtra(WorkoutAlarmHelper.EXTRA_ROUTE);
        String targetDate = intent.getStringExtra(WorkoutAlarmHelper.EXTRA_TARGET_DATE);

        if (WorkoutAlarmHelper.ACTION_FIRE_WORKOUT.equals(action)) {
            Log.i(TAG, "Firing workout reminder id=" + id);
            WorkoutAlarmHelper.showWorkoutNotification(
                    context, id, channelId, title, body, route, targetDate
            );
        } else if (WorkoutAlarmHelper.ACTION_SNOOZE_WORKOUT.equals(action)) {
            int mins = intent.getIntExtra(WorkoutAlarmHelper.EXTRA_SNOOZE_MINUTES, 15);
            boolean tomorrow = intent.getBooleanExtra(WorkoutAlarmHelper.EXTRA_SNOOZE_TOMORROW, false);
            Log.i(TAG, "Silent background snooze id=" + id + " mins=" + mins + " tomorrow=" + tomorrow);
            WorkoutAlarmHelper.snoozeWorkoutNotification(
                    context, id, mins, tomorrow, channelId, title, body, route, targetDate
            );
        }
    }
}
