# Android Permissions Audit

This document records all Android permissions requested by Maganis, their technical rationale, and audit status.

## Required Permissions

| Permission                    | Protection Level | Purpose / Justification                                                                                                                                                                                                                                         |
| :---------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `android.permission.INTERNET` | `normal`         | Required to stream YouTube and Vimeo exercise demonstration videos embedded inside exercise detail sheets, and to optionally load external user-provided reference images. The core app remains 100% offline-first and functional without network connectivity. |

---

## Out of Scope / Excluded Permissions

The following permissions are strictly **NOT** requested in the native shell:

- `android.permission.ACCESS_NETWORK_STATE`: Not required for basic offline WebView usage.
- `android.permission.READ_EXTERNAL_STORAGE` / `READ_MEDIA_IMAGES`: Native `<input type="file">` uses the system photo picker without requiring broad storage permissions.
- `android.permission.POST_NOTIFICATIONS`: Handled separately in Task N4 with runtime permission prompts.
- `android.permission.WAKE_LOCK`: Handled separately in Task N4 via Capacitor KeepAwake plugin.
- `android.permission.VIBRATE`: Handled separately in Task N4 via Capacitor Haptics plugin.
- `android.permission.FOREGROUND_SERVICE`: Strictly out of scope.
