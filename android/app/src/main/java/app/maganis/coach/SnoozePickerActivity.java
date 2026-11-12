package app.maganis.coach;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Lightweight translucent dialog picker triggered ONLY when the user taps
 * "خيارات أخرى..." on a workout notification. Never launches MainActivity.
 */
public class SnoozePickerActivity extends AppCompatActivity {

    private int notificationId;
    private String channelId;
    private String notifTitle;
    private String notifBody;
    private String notifRoute;
    private String notifTargetDate;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        overridePendingTransition(0, 0);

        Intent src = getIntent();
        notificationId = src.getIntExtra(WorkoutAlarmHelper.EXTRA_NOTIFICATION_ID, 900001);
        channelId = src.getStringExtra(WorkoutAlarmHelper.EXTRA_CHANNEL_ID);
        notifTitle = src.getStringExtra(WorkoutAlarmHelper.EXTRA_TITLE);
        notifBody = src.getStringExtra(WorkoutAlarmHelper.EXTRA_BODY);
        notifRoute = src.getStringExtra(WorkoutAlarmHelper.EXTRA_ROUTE);
        notifTargetDate = src.getStringExtra(WorkoutAlarmHelper.EXTRA_TARGET_DATE);

        setContentView(buildDialogView());
    }

    private View buildDialogView() {
        float dp = getResources().getDisplayMetrics().density;
        int pad16 = Math.round(16 * dp);
        int pad12 = Math.round(12 * dp);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(pad16, pad16, pad16, pad16);
        card.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);

        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(Color.parseColor("#1B1917"));
        cardBg.setCornerRadius(18 * dp);
        cardBg.setStroke(Math.max(1, Math.round(dp)), Color.parseColor("#35302A"));
        card.setBackground(cardBg);

        TextView heading = new TextView(this);
        heading.setText("تأجيل تذكير التمرين");
        heading.setTextColor(Color.parseColor("#F6B05E"));
        heading.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        heading.setTypeface(null, android.graphics.Typeface.BOLD);
        heading.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(heading);

        TextView sub = new TextView(this);
        sub.setText(notifTitle != null && !notifTitle.isEmpty() ? notifTitle : "اختر مدة التأجيل المناسبة");
        sub.setTextColor(Color.parseColor("#B4ACA0"));
        sub.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        subLp.topMargin = Math.round(4 * dp);
        subLp.bottomMargin = pad12;
        card.addView(sub, subLp);

        addOptionButton(card, "تأجيل 15 دقيقة", 15, false, dp);
        addOptionButton(card, "تأجيل 30 دقيقة", 30, false, dp);
        addOptionButton(card, "تأجيل ساعة واحدة", 60, false, dp);
        addOptionButton(card, "تأجيل 3 ساعات", 180, false, dp);
        addOptionButton(card, "تأجيل لغداً (9:00 صباحاً)", 0, true, dp);

        Button cancelBtn = new Button(this);
        cancelBtn.setText("إلغاء");
        cancelBtn.setAllCaps(false);
        cancelBtn.setTextColor(Color.parseColor("#B4ACA0"));
        cancelBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        GradientDrawable cancelBg = new GradientDrawable();
        cancelBg.setColor(Color.TRANSPARENT);
        cancelBg.setCornerRadius(12 * dp);
        cancelBtn.setBackground(cancelBg);
        cancelBtn.setMinimumHeight(Math.round(44 * dp));
        cancelBtn.setOnClickListener(v -> closeSilently());
        LinearLayout.LayoutParams cancelLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cancelLp.topMargin = Math.round(4 * dp);
        card.addView(cancelBtn, cancelLp);

        return card;
    }

    private void addOptionButton(
            LinearLayout parent,
            String label,
            int minutes,
            boolean untilTomorrow,
            float dp
    ) {
        Button btn = new Button(this);
        btn.setText(label);
        btn.setAllCaps(false);
        btn.setTextColor(Color.parseColor("#F6F2EA"));
        btn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        btn.setTypeface(null, android.graphics.Typeface.BOLD);
        btn.setMinimumHeight(Math.round(48 * dp));

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#262320"));
        bg.setCornerRadius(12 * dp);
        bg.setStroke(Math.max(1, Math.round(dp)), Color.parseColor("#443D34"));
        btn.setBackground(bg);

        btn.setOnClickListener(v -> {
            WorkoutAlarmHelper.snoozeWorkoutNotification(
                    getApplicationContext(),
                    notificationId,
                    minutes,
                    untilTomorrow,
                    channelId,
                    notifTitle,
                    notifBody,
                    notifRoute,
                    notifTargetDate
            );
            Toast.makeText(getApplicationContext(), "تم " + label, Toast.LENGTH_SHORT).show();
            closeSilently();
        });

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        );
        lp.bottomMargin = Math.round(8 * dp);
        parent.addView(btn, lp);
    }

    private void closeSilently() {
        finish();
        overridePendingTransition(0, 0);
    }

    @Override
    public void finish() {
        super.finish();
        overridePendingTransition(0, 0);
    }
}
