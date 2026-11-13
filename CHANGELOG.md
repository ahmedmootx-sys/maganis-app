# Changelog

All notable changes to Bunyan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-11-13

### ar

- إصلاح زر استيراد الجدول في مصمم الذكاء الاصطناعي وإضافة زر اللصق السريع من الحافظة.
- تمكين استيراد وتصدير الجداول ومشاركتها مع الأصدقاء بسلاسة وتطبيع مدى التكرارات وملاحظات المدرب.
- واجهة جديدة للتمارين المضافة عبر الذكاء الاصطناعي مع أزرار نسخ الاسم والبحث المباشر في Google و YouTube و Pinterest (بدون أي إيموجي).
- إصلاح فحص التحديثات في تطبيق APK لقراءة مسار Releases العام ودعم التحقق في حزم Debug.
- تحديث برومبت مصمم الذكاء الاصطناعي لإنتاج أكواد وجداول مطابقة بنسبة 100%.

### en

- Fixed the Import Schedule button in the AI Schedule Designer and added a clipboard paste button.
- Enabled seamless export, import, and sharing of workout schedules between friends with relaxed schema and reps-range normalization.
- Added dedicated detail view for AI/uncataloged exercises with Copy Name and direct search actions for Google, YouTube, and Pinterest (strictly using SVG icons, zero emojis).
- Fixed in-app update checker in APK builds to query the general releases feed and enable updates for debug builds.
- Refined the AI Designer system prompt to generate 100% compliant workout program JSON structures.

## [0.2.1] - 2026-11-13

### ar

- حل انشطار وتقطيع الكلمات العربية وضبط التمرير الأفقي لتبويبات التمرين وأزرار الإعدادات.
- اجتياز بوابات التباين (WCAG AA) وضبط التباين في الوضعين الفاتح والداكن.
- دعم تشغيل فيديوهات بينترست (Pinterest) بمشغل متكيف 9:16 مع الصوت وفك روابط pin.it تلقائياً.
- دعم 5 أنواع للتمارين (أوزان، وزن جسم، وقت وثبات، تكرارات، كارديو) في الإنشاء والتعديل وضبط تمارين الكتالوج الثابتة.
- تدقيق كافة تمارين الكتالوج الـ 44 ورسم الأطلس التشريحي بنسبة 100%.

### en

- Resolved Arabic word splitting and line-break artifacts; adjusted horizontal scrolling for workout tabs and settings action buttons.
- Passed WCAG AA contrast gates with fine-tuned contrast across both light and dark themes.
- Added Pinterest video playback with an adaptive 9:16 player, audio control, and automatic pin.it short-link resolution.
- Added full support for 5 exercise tracking types (weights, bodyweight, duration/hold, reps-only, cardio) in creation and editing flows, and updated static catalog exercises.
- Audited all 44 built-in catalog exercises and achieved 100% anatomical muscle atlas illustration coverage.

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
