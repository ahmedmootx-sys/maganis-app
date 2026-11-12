# Changelog

All notable changes to Bunyan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-12

### ar

- إطلاق الهوية الجديدة الكاملة لتطبيق «بنيان» (Bunyan) مع أيقونات وشاشة ترحيب محدثة.
- إصلاح التمرير في شاشة التمرين النشط وتنظيم الإعدادات في نوافذ فرعية مدمجة.
- إصلاح حساب بداية الأسبوع (السبت أو أي يوم مخصص) ويوم الكارديو في الجدول.
- تنبيهات تمرين مخصصة وعشوائية مع أزرار تأجيل (Snooze) أصلية على أندرويد.

### en

- Full Bunyan rebrand across app labels, adaptive launcher icons, splash screens, and UI copy.
- Fixed scrolling and layout constraints during active workout sessions.
- Reorganized Settings into compact dedicated sub-sheets (Preferences, Notifications, Data & Backup, About).
- Fixed Saturday/custom `weekStartDay` resolution and Cardio day handling across weekly schedules and dashboard.
- Added custom and randomized workout notification reminders with native Android Snooze actions.

## [0.1.0] - 2026-11-04

### ar

- إطلاق النسخة الأولى من تطبيق «مجانص» لأندرويد مع حفظ بيانات دائم ومحمي.
- نظام تنبيهات موثوق لانتهاء فترات الراحة وجلسات التمرين بدون استهلاك بطارية.
- وضع آمن وحماية كاملة ضد تكرار الأعطال وفقدان البيانات.

### en

- Initial release of Maganis native Android shell (Capacitor 8).
- Atomic DurableFileStore with SHA-256 validation and .bak rotation (Task N2).
- Multi-layer streaming backup engine and verified restore (Task N3).
- Monotonic timestamp timers and rolling-window notification scheduler (Task N4).
- React error boundaries, safe mode crash-loop protection, and release gating (Task N5).
