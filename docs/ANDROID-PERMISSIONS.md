# Android Permissions Audit

This document records all Android permissions requested by Maganis, their technical rationale, and audit status.

## Required Permissions

| Permission                                  | Protection Level | Purpose / Justification                                                                                                                                                                                                                                         |
| :------------------------------------------ | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `android.permission.INTERNET`               | `normal`         | Required to stream YouTube and Vimeo exercise demonstration videos embedded inside exercise detail sheets, and to optionally load external user-provided reference images. The core app remains 100% offline-first and functional without network connectivity. |
| `android.permission.POST_NOTIFICATIONS`     | `dangerous`      | Android 13+ (API 33+) runtime permission to show local notifications for workout reminders, rest timer completion, cardio target completion, daily nutrition logging reminder, and backup warnings. Requested strictly in context, never on first launch.       |
| `android.permission.SCHEDULE_EXACT_ALARM`   | `normal`         | Android 12+ (API 31+) user-controllable permission to schedule exact alarms for rest timer completion and cardio target alerts. Gracefully degrades to inexact alarm with clear Egyptian Arabic UI notice when disabled.                                        |
| `android.permission.RECEIVE_BOOT_COMPLETED` | `normal`         | Re-arms future scheduled rolling window notifications (workout days, nutrition reminder) after device restart.                                                                                                                                                  |
| `android.permission.VIBRATE`                | `normal`         | Enables native haptic feedback patterns upon set completion, rest timer finish, and cardio target reached.                                                                                                                                                      |

---

## Out of Scope / Excluded Permissions

The following permissions are strictly **NOT** requested in the native shell:

- `android.permission.USE_EXACT_ALARM`: **STRICTLY FORBIDDEN**. Google Play and Android policy restrict this permission strictly to alarm clocks and calendar applications. Maganis uses `SCHEDULE_EXACT_ALARM` which respects user autonomy and falls back gracefully to inexact alarms.
- `android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: **STRICTLY FORBIDDEN**. Highly sensitive permission liable to policy violations. Maganis opens the standard system settings screen (`ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`) via intent without declaring the broad permission.
- `android.permission.ACCESS_NETWORK_STATE`: Not required for basic offline WebView usage.
- `android.permission.READ_EXTERNAL_STORAGE` / `READ_MEDIA_IMAGES`: Native `<input type="file">` uses the system photo picker without requiring broad storage permissions.
- `android.permission.FOREGROUND_SERVICE`: Strictly out of scope.
