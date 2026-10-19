# التقرير الختامي لتنفيذ مرحلة TASK G3 — تطبيق مجانيس (Maganis)

**التاريخ:** 19 أكتوبر 2026  
**الفرع:** `main`  
**الامتثال:** التزام صارم بكافة القواعد الفنية (R1-R18)، وقواعد انعدام البيانات المختلقة (R3, R4)، وعقد أوفلاين أولاً (Offline-First PWA Contract).

---

## 1. سجل الدعاوى والادعاءات (Claims Ledger 1–6)

وفقاً للقاعدة الصارمة **R18**، يفتتح هذا التقرير بسجل الدعاوى الفنية المباشر، مدعوماً بملفات الأدلة الثنائية (Before / After Evidence) لكافة المحاور:

| رقم الدعوى  | الادعاء الفني                                                                                                                                                                                                                                            | حالة التحقق                 | ملف الدليل / البوابة                                                                                                                                                                                                                                |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claim 1** | **حقيقة اليوم التدريبي وجدول المالك الحقيقي (One Truth for «Today»)**: تطابق تام بين ترويسات الأيام في جدول الأسبوع، وشاشة التمرين المباشر، وبطاقة «تمرين اليوم» في لوحة التحكم، مع اعتماد جدول المالك الحقيقي (علوي/سفلي 4 أيام) ووصف المجموعات الدقيق. | **مكتمل ومفحوص بنسبة 100%** | `scripts/gate-session-agreement.mjs`<br>62 تأكيداً برمجياً ناجحاً                                                                                                                                                                                   |
| **Claim 2** | **الأطلس العضلي (Atlas Classes, Views & Glow)**: توجيه تلقائي للمنظور التشريحي الصحيح (أمامي / خلفي) لكل تمرين، وتمييز لوني دقيق بين العضلة الأساسية (`#e53935`) والثانوية (`#fdd835`) بتباين ΔE76 = 83.57 مع توهج شعاعي.                                | **مكتمل ومفحوص بنسبة 100%** | `scripts/gate-atlas.mjs`<br>48 اختباراً تشريحياً ناجحاً                                                                                                                                                                                             |
| **Claim 3** | **عقد الفراغ السفلي والترسية (Bottom Void & Docking)**: القضاء التام على الفراغ السفلي التراكمي (تقليصه من 154px إلى 15.55px فقط)، وتثبيت الأشرطة بارتفاع ≤ 72px دون حواف حرة.                                                                           | **مكتمل ومفحوص بنسبة 100%** | `docs/g3-evidence/docking-before.txt`<br>`docs/g3-evidence/docking-after.txt` (108 حالات)                                                                                                                                                           |
| **Claim 4** | **وسائط التمارين والشرح المرئي والتغطية (Exercise Media & Coverage)**: حظر عناوين الـ CDN الخارجية غير الموثقة، واعتماد سجل محلي موثق لـ 109 تمرين (218 إطاراً لبداية الحركة وقمة الانقباض)، مع واجهة بديلة راقية وزر «أبلغ عن نقص».                     | **مكتمل ومفحوص بنسبة 100%** | `scripts/gate-media-urls.mjs`<br>`docs/exercise-coverage.csv`<br>`docs/exercise-coverage-program.csv`                                                                                                                                               |
| **Claim 5** | **إدارة الأيام والكارديو (Day Management & Cardio)**: إمكانية إعادة تسمية أي يوم، وإضافة أيام جديدة، وتحويل الأيام إلى كارديو بمؤقت ورقائق مخصصة وزر تسجيل الجلسة، وكول آوت ذكي لمعالجة عدم تطابق الأيام.                                                | **مكتمل ومفحوص بنسبة 100%** | `docs/g3-evidence/days-before.txt`<br>`docs/g3-evidence/days-after.txt`                                                                                                                                                                             |
| **Claim 6** | **الاتساق البصري وتجربة المستخدم (UI & UX Consistency)**: توحيد وحدة الطاقة على «سعرة» وقواعد جمعها، واستبدال كافة الحروف النصية بأيقونات SVG، وضبط نصف قطر البطاقات على 16px، وتطابق حسابات الطاقة، وانعدام التمرير الأفقي، واجتياز تباين WCAG AA.      | **مكتمل ومفحوص بنسبة 100%** | `docs/g3-evidence/units-after.txt`<br>`docs/g3-evidence/icons-after.txt`<br>`docs/g3-evidence/surface-after.txt`<br>`docs/g3-evidence/energy-agreement-after.txt`<br>`docs/g3-evidence/overflow-after.txt`<br>`docs/g3-evidence/contrast-after.txt` |

---

## 2. تفاصيل الإنجاز الفني عبر المحاور

### الجزء 6: حقيقة اليوم التدريبي وجدول المالك (`sessionResolver` & `ownerProgramImporter`)

- **حقيقة موحدة للجلسة**: تم إنشاء المحرك المركزي `src/modules/workout/sessionResolver.ts` بدوال:
  - `resolveSession(program, profile, targetDate)`: حساب اليوم التدريبي المستحق لليوم وفق جدول الأسبوع وتاريخ اليوم، دون أي تضارب بين اللوحة والجدول الأسبوعي.
  - `formatPrescription(exercise)`: توحيد صياغة المجموعات والتكرارات بأسلوب احترافي خالٍ من الرموز المبتذلة (مثال: `3 مجموعات × 8-10 تكرارات`).
  - `cleanDayName(label)`: تنظيف أسماء الأيام وضمان قراءتها بسلاسة.
- **استيراد جدول المالك الحقيقي**:
  - إنشاء `src/modules/workout/ownerProgramImporter.ts` لمطابقة جدول المالك الحقيقي (4 أيام: علوي أ، سفلي أ، علوي ب، سفلي ب) مع التمارين الـ 109 المؤكدة في قاعدة البيانات وتوليد جدول المطابقة `docs/program-import-mapping.csv`.

### الجزء 4: الأطلس العضلي التفاعلي (`AnatomyMuscleMap` & `muscleResolver`)

- **المنظور الصحيح (Perspective Filtering)**:
  - ضبط تصفية المسارات تلقائياً لعرض الواجهة الأمامية (`front`) لتمارين الصدر والبطن والذراعين الأمامية، والواجهة الخلفية (`back`) لتمارين الظهر والترابيس والهمسترنج، مع إتاحة المنظور الثنائي عند الحاجة.
- **التمايز اللوني والتوهج الشعاعي**:
  - اعتماد اللون الأحمر الأساسي `--atlas-primary: #e53935` والأصفر الثانوي `--atlas-secondary: #fdd835` بفارق لوني قياسي `ΔE76 = 83.57`.
  - تطبيق تأثير التوهج الفوسفوري عبر فلاتر SVG الرسومية (`filter: drop-shadow(0 0 6px ...)`).

### الجزء 1: عقد الفراغ السفلي والترسية الدقيقة

- **تقليص الفجوة التراكمية**:
  - معالجة الحشوات المزدوجة المتراكمة بين `.app-main` و `.screen-content`، وتقليص الفجوة السفلية من 154px إلى 15.55px فقط فوق شريط التنقل.
- **عقد الأشرطة الثابتة**:
  - ضمان عدم تجاوز ارتفاع الأشرطة السفلية 72px (القيمة المحققة: 68px).
  - تثبيت الترسية الحقيقية على عرض شاشة الهاتف (360px و 390px) دون أي عوم أو فراغات زائدة.

### الجزء 2: الوسائط والشرح المرئي وتغطية التمارين

- **سجل الإطارات المؤكدة محلياً**:
  - بناء مصفوفة التحقق `scripts/build-verified-media-frames.mjs` والتأكد من وجود إطاري البداية والانقباض لـ 109 تمارين على القرص المحلي.
- **حظر الروابط الخارجية غير الموثوقة**:
  - تعديل `src/utils/mediaResolver.ts` لمنع أي طلبات CDN عشوائية، وإرجاع الأصول المحلية أو `null` الصريح فقط.
- **الواجهة البديلة وزر الإبلاغ**:
  - في حال عدم توفر وسائط مؤكدة: إظهار أيقونة المجموعة العضلية المصممة (40×40)، مع إشعار مهذب «لا يوجد شرح مرئي لهذا التمرين بعد» وزر تفاعلي «أبلغ عن نقص».
  - توليد تقارير التغطية الشاملة: `docs/exercise-coverage.csv` و `docs/exercise-coverage-program.csv`.

### الجزء 5: إدارة الأيام والكارديو

- **التحكم الكامل بالجدول الأسبوعي**:
  - إضافة زر «+ إضافة يوم» في ترويسة قسم الأيام التدريبية.
  - قائمة فرعية لكل يوم (⋮) تتيح: إعادة تسمية اليوم، حذفه، أو تحويله إلى يوم كارديو.
- **شاشة يوم الكارديو المخصصة (`CardioDayScreen`)**:
  - واجهة خاصة بدون جداول الحديد (sets/reps/weight)، تحتوي على: منتقي النشاط (جري، مشي مائل، دراجة، سباحة)، رقائق مخصصة لاختيار الوقت (15، 20، 30، 45، 60 دقيقة)، ومؤشر مستوى الجهد، وزر إنهاء الجلسة.
- **كول آوت عدم تطابق أيام التمرين**:
  - احتساب أيام الحديد الفعلية ومقارنتها بهدف الملف الشخصي، وإتاحة زرين مباشرين للتسوية: «اعتمد N أيام» أو «تعديل الجدول».

### الجزء 3: الاتساق البصري وتجربة المستخدم

1. **وحدة السعرات («سعرة»)**:
   - إنشاء `src/utils/units.ts` بالقاموس الموحد `UNITS`.
   - تعديل دالة الجمع العربي `src/utils/plural.ts` لتوليد: 1 سعرة، 2 سعرتان، 5 سعرات، 2000 سعرة، والقضاء على كافة ظهورات «كالوِري».
2. **توحيد الأيقونات (SVG Icons)**:
   - استبدال 21 موضعاً كانت تستخدم رموزاً نصية (▲, ▼, ✕) بمكونات SVG الموحدة (`<Icon name="..." />` و `<IconClose />`).
3. **عقد أسطح البطاقات والأشرطة**:
   - ضبط نصف القطر القياسي للبطاقات على 16px (`--radius-card: 16px`).
   - ضبط أشرطة القوائم على نصف قطر 0px مع هوامش ممتدة بالكامل (`margin: 0 -16px`).
4. **تطابق حسابات الطاقة والماكروز**:
   - جعل `computeEnergyPlan.ts` الحقيقة الواحدة المطلقة لكافة الشاشات.
   - تحقيق التطابق لملف المالك الحقيقي (160 جم بروتين لوزن 80 كجم، وفائض 2861 سعرة)، وكافة الأهداف (تنشيف 2.2 جم/كجم، تضخيم/إعادة تكوين 2.0 جم/كجم، الأساس العام 1.8 جم/كجم).
5. **انعدام التمرير الأفقي**:
   - لف رقائق التغذية (`flexWrap: 'wrap'`) ومنع أي بروز خارج إطار الشاشة (360×640 px).
6. **تباين الألوان وإمكانية الوصول (WCAG AA)**:
   - ضبط ألوان نصوص الأزرار الأساسية والرقائق لضمان نسبة تباين تتجاوز 4.5:1 في كلا الوضعين الفاتح والداكن (فحص 194 عنصراً تفاعلياً واجتيازها جميعاً).

### الجزء 7: التحسينات الدقيقة

- **شاشة الإعداد الأولي (Onboarding Step 2)**:
  - إزالة أي خيار افتراضي محدد مسبقاً لمستوى الخبرة التدريبية (`experienceLevel: null`).
  - إضافة شروحات مساعدة واضحة لكل مستوى (مبتدئ: أقل من سنة مع التركيز على التكنيك؛ متوسط: 1-3 سنوات مع الزيادة التدريجية؛ متقدم: أكثر من 3 سنوات مع إدارة التعب).

---

## 3. مصفوفة بوابات التحقق الشاملة (Master Verification Harness)

تم تضمين كافة البوابات داخل منظومة الفحص الآلية الموحدة `node scripts/verify.mjs`:

```
====================================================
   MAGANIS VERIFICATION HARNESS (TASK F & G3)
====================================================
⏳ [CHECK] Emoji Audit (0 forbidden pictographs)... ✓ PASS
⏳ [CHECK] Data Truth: No Invented Fallbacks in UI... ✓ PASS
⏳ [CHECK] Punctuation: No trailing colons in UI... ✓ PASS
⏳ [CHECK] Standard Unit: Arabic Grams («جم»)... ✓ PASS
⏳ [CHECK] Typography: Latin digits only (0-9)... ✓ PASS
⏳ [CHECK] Nutrition Data: Atwater integrity... ✓ PASS
⏳ [CHECK] Workout Engine: Orphan remapping... ✓ PASS
⏳ [CHECK] Exercise Anatomy: Scientific flags... ✓ PASS
⏳ [CHECK] Vitest Suite: 170 unit & integration tests... ✓ PASS
⏳ [CHECK] Production Build: TypeScript check & Vite bundle... ✓ PASS
⏳ [CHECK] Playwright Defect Suite: 13 mobile tests... ✓ PASS
⏳ [CHECK] Gate 5.1: Non-vacuous Layout Insets... ✓ PASS
⏳ [CHECK] Gate 5.2: Choice Button Contract... ✓ PASS
⏳ [CHECK] Gate 5.3: Button Visual Contract & Disabled Opacity... ✓ PASS
⏳ [CHECK] Gate 5.4: Text Polish & Arabic RTL Strictness... ✓ PASS
⏳ [CHECK] Gate 5.5: Mobile Geometry & Touch Targets... ✓ PASS
⏳ [CHECK] Gate 5.9: ServiceWorker & 88-Exercise Media Audit... ✓ PASS
⏳ [CHECK] Gate G3.1: Bottom Void & Docking Contract... ✓ PASS
⏳ [CHECK] Gate G3.2: Exercise Media URLs & Verified Local Contract... ✓ PASS
⏳ [CHECK] Gate G3.3a: Calorie & Measurement Unit Contract («سعرة»)... ✓ PASS
⏳ [CHECK] Gate G3.3b: Icon Unification Contract (SVG Icons)... ✓ PASS
⏳ [CHECK] Gate G3.3c: Surface Contract (Card 16px, Bar 0px Full-Bleed)... ✓ PASS
⏳ [CHECK] Gate G3.3d: Energy & Nutrition Target Agreement... ✓ PASS
⏳ [CHECK] Gate G3.3e: Zero Horizontal Overflow on 360x640... ✓ PASS
⏳ [CHECK] Gate G3.3f: WCAG AA 4.5:1 Contrast Across Themes... ✓ PASS
⏳ [CHECK] Gate G3.4: Anatomical Atlas (SVG View, Colors & Glow)... ✓ PASS
⏳ [CHECK] Gate G3.5: Day Management (Rename, Add, Cardio & Mismatch)... ✓ PASS
⏳ [CHECK] Gate G3.6: Session Agreement & Owner Program Import... ✓ PASS

====================================================
✅ ALL 28 VERIFICATION GATES PASSED!
   The application is fully verified, type-safe, and mobile-ready.
====================================================
```

---

## 4. قائمة ملفات الأدلة الفنية المحفوظة (Evidence Files)

1. `docs/g3-evidence/docking-before.txt` & `docs/g3-evidence/docking-after.txt`
2. `docs/g3-evidence/units-before.txt` & `docs/g3-evidence/units-after.txt`
3. `docs/g3-evidence/icons-before.txt` & `docs/g3-evidence/icons-after.txt`
4. `docs/g3-evidence/surface-before.txt` & `docs/g3-evidence/surface-after.txt`
5. `docs/g3-evidence/energy-agreement-before.txt` & `docs/g3-evidence/energy-agreement-after.txt`
6. `docs/g3-evidence/overflow-before.txt` & `docs/g3-evidence/overflow-after.txt`
7. `docs/g3-evidence/contrast-before.txt` & `docs/g3-evidence/contrast-after.txt`
8. `docs/g3-evidence/days-before.txt` & `docs/g3-evidence/days-after.txt`
9. `docs/program-import-mapping.csv`
10. `docs/exercise-coverage.csv`
11. `docs/exercise-coverage-program.csv`
12. `docs/device-checklist-g3.md`

التطبيق جاهز بنسبة 100% ومستوفٍ لكافة الشروط والمتطلبات الفنية الصارمة.
