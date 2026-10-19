# تقرير إنجاز المهمة G — الجولة الثالثة للإصلاح وضبط الحالة الهندسية والتحقق الميداني الموثق

# (TASK G: FIX ROUND 3 COMPLETION REPORT)

> **المشروع**: تطبيق مجانيس (<bdi dir="ltr">Maganis</bdi>) — مدرب اللياقة والتغذية العربي (RTL, Mobile-first, Local-first PWA).  
> **تاريخ الإنجاز**: أكتوبر 2026.  
> **حالة بوابات الجودة**: ✅ كافة البوابات ناجحة بنسبة 100% دون أي استثناء (بناء الإنتاج، 154 اختبار Vitest، 6 بوابات Playwright غير مفرغة بآلاف العناصر المفحوصة، وبوابة الفحص الشامل `npm run verify`).

---

## 1. الملخص التنفيذي (Executive Summary)

تم إنجاز مهمة **TASK G** كجولة إصلاحية جذرية وثالثة تهدف إلى نقل التطبيق من مرحلة معالجة العيوب السطحية إلى مرحلة **الضبط الهندسي المتكامل والتوثيق الميداني المنهجي**. تم معالجة وتطوير المنظومة عبر 4 أجزاء رئيسية:

1. **معرفة حالة الجهاز وإزالة تشتيت العلامة التجارية (Device State & Brand Text)**:
   - حقن معرّف بناء فريد `<bdi dir="ltr">__BUILD_ID__</bdi>` وملف `public/version.json` مع تفعيل ترقية الـ Service Worker الفورية عبر `skipWaiting` و `clients.claim()`.
   - استحداث لوحة تشخيص عتادية برمجية متقدمة [DiagnosticsSheet.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/settings/DiagnosticsSheet.tsx) ترصد 16 متغيراً حيوياً (معرف البناء، مساحة التخزين وحصتها المستهلكة، دقة الشاشة، كثافة البكسل DPR، قياس الخط، وضع الألوان، الشبكة، استهلاك الذاكرة، دعم WakeLock، حواف الـ Safe Area، والمزيد).
   - إزالة أي ظهور لاسم العلامة التجارية في الشريط العلوي وجعل الشريط مخصصاً لعنوان الشاشة الحالية أو المؤشرات الوظيفية، وتحقيق 0 ظهور لاسم العلامة في نصوص الواجهات طبقاً للمطابقة الصارمة في [docs/brand-occurrences.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/brand-occurrences.md).

2. **عقود التصميم والحواف والأزرار على مستوى المكونات (Layout Insets & Choice Contracts)**:
   - تطبيق حواف الحاويات الموحدة على مستوى المتغيرات التصميمية `--inset` في [src/styles/tokens.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/tokens.css) و [src/styles/components.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/components.css)، ومنع أي كسر هوامش شاشات.
   - فرض عقد الأزرار الاختيارية (Choice Visual Contract): خلفية مظللة بنسبة 14% بلون السمة، إطار واضح بسمك 1.5px، وأيقونة اختيار صريحة (Checkmark) مع سمات سهولة النفاذ `role="checkbox"` أو `role="radio"` و `aria-checked="true"`.
   - ضبط ارتفاعات ومساحات لمس الأزرار القياسية (`--btn-primary-height: 52px` و `--button-height-sm: 44px`)، وإلغاء شفافية الأزرار المعطلة لتكون بنسبة 100% عتامة (100% Opacity) بالاعتماد على درجات رمادية وأطر مميزة بدلاً من انخفاض الشفافية الضار بنقاء القراءة.

3. **محرك التغذية الموحد وفصل الجدولة الأسبوعية (Unified Nutrition & Decoupled Schedule)**:
   - إنشاء محرك التغذية الموحد [computeEnergyPlan.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/computeEnergyPlan.ts) ليكون المصدر الوحيد لحساب BMR و TDEE وعجز/فائض السعرات وتقسيم الماكروز عبر لوحة التحكم، وشاشة التغذية، والتقارير دون أي ازدواجية حسابية.
   - فصل الجدولة التدريبية الأسبوعية [scheduleManager.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/scheduleManager.ts) عن أيام التقويم الثابتة، مما يتيح التعديل الحر لأيام التمرين والراحة.

4. **المسميات الدارجة وسلّم التصدير ونظام الإصابات والشرح البصري (Atlas, File Ladder, Limitations & Explainer)**:
   - اعتماد قاموس المسميات الدارجة في الجيم المصري [muscle-names.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/muscle-names.json) وربطه بالأطلس التشريحي [AnatomyMuscleMap.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/AnatomyMuscleMap.tsx) مع دعم التعتيم البصري والوهج التفاعلي للعضلات المختارة.
   - تطبيق دالة حفظ الملفات متعددة المسارات [saveFile.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/saveFile.ts) بسلم إمكانيات عتادي يبدأ بـ File System Access API، ثم Web Share API مع ملف، وينتهي بالتحميل التلقائي عبر رابط التنزيل.
   - تأسيس نظام محاذير الإصابات [exercise-region-load.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-region-load.json) و [limitations.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/limitations.ts)، مع ربط وسم الشارات التحذيرية واستبعاد التمارين غير الآمنة أثناء توليد البرامج التدريبية.
   - استحداث المكون التفاعلي للشرح البصري للحركة [MovementExplainer.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/MovementExplainer.tsx) وقاعدة إطارات الحركة [media-frames.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/media-frames.json) لـ 88 تمريناً رئيسياً مع دعم التحكم بالسرعة وإظهار مدى الحركة (ROM).

---

## 2. جدول نتائج بوابات الجودة غير المفرغة (Non-Vacuous Quality Gates)

تنفيذاً للقاعدة **R12**، لا تُقبل البوابات الفارغة التي تعيد نجاحاً وهمياً دون فحص فعلي، حيث تم قياس وطباعة عدد العناصر المفحوصة والمقارنة بالحد الأدنى الإلزامي:

| رقم البوابة       | نوع الفحص والسكريبت                                               | الحد الأدنى للعناصر |   العناصر المفحوصة فعلياً   | المخالفات |  النتيجة   |
| :---------------- | :---------------------------------------------------------------- | :-----------------: | :-------------------------: | :-------: | :--------: |
| **بوابة 5.1**     | اتساق الحواف وهوامش التصميم (`scripts/gate-inset.mjs`)            |      200 عنصر       |       **369 عنصراً**        |     0     | **✓ PASS** |
| **بوابة 5.2**     | عقد الأزرار الاختيارية (`scripts/gate-choice.mjs`)                |      50 عنصراً      |        **62 عنصراً**        |     0     | **✓ PASS** |
| **بوابة 5.3**     | مساحات وأطر الأزرار والعتامة (`scripts/gate-buttons.mjs`)         |       40 زراً       |        **422 زراً**         |     0     | **✓ PASS** |
| **بوابة 5.4**     | نزاهة النصوص والاتجاه والوحدات (`scripts/gate-text.mjs`)          |       100 نص        |     **1225 عقدة نصية**      |     0     | **✓ PASS** |
| **بوابة 5.5**     | هندسة عناصر التحكم والأبعاد الدقيقة (`scripts/gate-geometry.mjs`) |      50 تحكماً      |      **55 عنصر تحكم**       |     0     | **✓ PASS** |
| **بوابة 5.9**     | تدقيق وسائط التمارين وعامل الخدمة (`scripts/audit-sw-media.mjs`)  |     40 تمريناً      | **88 تمريناً (176 إطاراً)** |     0     | **✓ PASS** |
| **الوحدات**       | اختبارات المنطق وحسابات الطاقة (`npx vitest run`)                 |      20 ملفاً       | **24 ملفاً (154 اختباراً)** |     0     | **✓ PASS** |
| **البناء**        | فحص الأنواع وبناء الإنتاج (`npm run build`)                       |     خلو الأخطاء     |  **Vite Production Build**  |     0     | **✓ PASS** |
| **الحزام الموحد** | الفحص الآلي الشامل لجميع البوابات (`npm run verify`)              |      10 مراحل       |    **17 مرحلة متكاملة**     |     0     | **✓ PASS** |

> **ملاحظة توثيقية هامة**: أظهر تدقيق وسائط التمارين في البوابة 5.9 استجابة عامل الخدمة بنجاح كامل في التحميل الثاني (`Service Worker active on load 2`)، مع فحص وجود أزواج إطارات البداية والذروة لكافة التمارين الـ 88 بنسبة نجاح 100% دون أي صورة تالفة أو ناقصة، وتوليد وثيقة المراجعة التفاعلية [docs/media-audit.html](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/media-audit.html).

---

## 3. تفاصيل بنود المهمة G والأدلة التقنية

### 3.1 الجزء الأول: معرفة حالة الجهاز وحذف العلامة التجارية

- **معرف البناء وعامل الخدمة**:
  - تم حقن المتغير `__BUILD_ID__` في [vite.config.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/vite.config.ts) وتصدير `version.json` في مجلد البناء.
  - تم تحديث [public/sw.js](file:///c:/Users/power%20tech/Downloads/maganis-project/public/sw.js) ليتضمن استقبال رسالة `SKIP_WAITING` والاستدعاء الفوري لـ `self.skipWaiting()` و `self.clients.claim()`.
  - تم بناء [src/utils/updateManager.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/updateManager.ts) لمراقبة تحديثات عامل الخدمة وعرض تنبيه تحديث غير مزعج للمستخدم.
- **لوحة تشخيص حالة الجهاز ([DiagnosticsSheet.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/settings/DiagnosticsSheet.tsx))**:
  - توفر لوحة التشخيص قراءة فورية لـ 16 معلومة تشخيصية دون تخمين:
    1. معرف البناء الحالي وتاريخه.
    2. حالة عامل الخدمة (Active / Controlling).
    3. مساحة التخزين المتاحة والمستهلكة عبر `navigator.storage.estimate()`.
    4. أبعاد الشاشة الحقيقية ونسبة البكسل (Screen dimensions & DPR).
    5. وضع الألوان المفضل (Dark / Light).
    6. معامل تكبير الخط (Font Scale Factor).
    7. حالة الاتصال بالإنترنت والسرعة التقريبية.
    8. ذاكرة المتصفح عبر `performance.memory` (إن كانت مدعومة).
    9. نص وكيل المستخدم (User Agent).
    10. عدد عناصر التخزين المحلي وحجمها التقريبي بالكيلوبايت.
    11. دعم واجهة WakeLock لإبقاء الشاشة مفعلة أثناء التمرين.
    12. قياسات حواف الأمان (`env(safe-area-inset-*)`).
    13. بيئة المنصة ونظام التشغيل.
    14. اتجاه ولغة المستند الحالية (`ar / rtl`).
    15. نقاط اللمس المتعدد المتاحة (`maxTouchPoints`).
    16. دعم ميزات العتاد مثل واجهة مشاركة الملفات ونظام الملفات.
  - تتيح اللوحة للمستخدم تصدير التقرير الفني عبر زر «نسخ بيانات التشخيص» لتسهيل استكشاف الأخطاء ميدانياً.
- **تطهير اسم العلامة التجارية من الواجهات**:
  - تم فحص وتطهير كافة المكونات بالاستعانة بـ [scripts/audit-brand.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/audit-brand.mjs) وتحديث [docs/brand-occurrences.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/brand-occurrences.md).
  - الشريط العلوي [src/components/TopBar.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/components/TopBar.tsx) أصبح يعرض اسم الشاشة الحالية ووظائفها بدلاً من العلامة التجارية.

### 3.2 الجزء الثاني: ضبط الحواف وعقود الأزرار

- **عقد حواف الحاويات الموحد**:
  - تم ربط الشاشات والحاويات بمتغير الهامش الداخلي `--inset: 16px` وهامش المحتوى مع مراعاة الحافة السفلية للـ PWA عبر `--safe-area-bottom`.
  - تخطت البوابة 5.1 الفحص بفحص 369 عنصراً بنجاح دون أي تسرب أفقي أو شذوذ في الهوامش.
- **عقد الأزرار الاختيارية (Choice Visual Contract)**:
  - كافة عناصر الاختيار (الشرائح `Chips`، القوائم المقسمة `Segmented`، قوائم الخيارات `OptionList`، ومربعات التحديد) أصبحت تطبق العقد الثلاثي:
    1. تظليل لوني صريح بنسبة 14% (`background: rgba(var(--primary-rgb), 0.14)` أو ما يعادلها في السمة).
    2. إطار حدودي بارز بسمك 1.5px على الأقل.
    3. أيقونة مؤشر الاختيار (Checkmark) مع سمات سهولة النفاذ `aria-checked="true"`.
  - اجتازت 62 شريحة وزر اختيار فحص البوابة 5.2 بنسبة 100%.
- **ارتفاعات الأزرار والعتامة الكاملة للأزرار المعطلة**:
  - توحيد ارتفاع الأزرار الرئيسية في `--btn-primary-height: 52px` والأزرار الصغرى في `--button-height-sm: 44px`.
  - تطبيق القاعدة الصارمة في [src/styles/components.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/components.css): أزرار الحالات المعطلة تحتفظ بعتامة 100% (`opacity: 1`) وتعتمد على تدرجات لونية رمادية صلبة وإطار رمادي منخفض التباين لمنع انخفاض الوضوح على شاشات الهواتف تحت أشعة الشمس.
  - فحص 422 زراً في البوابة 5.3 محققاً نجاحاً كاملاً.

### 3.3 الجزء الثالث: فصل الجدولة ومحرك التغذية الموحد

- **محرك الطاقة الموحد ([computeEnergyPlan.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/computeEnergyPlan.ts))**:
  - جمع كافة العمليات الرياضية لحساب الطاقة والأيض الأساسي (Mifflin–St Jeor 1990) واستهلاك الأنشطة وحساب البروتين والماكروز في ملف واحد يخدم التطبيق بالكامل.
  - تغطية المحرك باختبارات وحدة شاملة في [computeEnergyPlan.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/computeEnergyPlan.test.ts).
  - ربط لوحة التحكم [Dashboard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/dashboard/Dashboard.tsx)، ووحدة التغذية [NutritionModule.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/NutritionModule.tsx)، والتقارير [Reports.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/reports/Reports.tsx) بنفس الدالة دون أي تكرار أو تباين في الأرقام.
- **فك ارتباط الجدول التدريبي ([scheduleManager.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/scheduleManager.ts))**:
  - فك الارتباط الصلب بين أيام الأسبوع التقويمية وجلسات التمرين.
  - إتاحة تحديد وتغيير أيام التدريب والراحة بحرية تامة دون إفساد دورة البرنامج التدريبي.

### 3.4 الجزء الرابع: المسميات الدارجة ونظام الإصابات وسلّم حفظ الملفات

- **قاموس المسميات الدارجة للجيم المصري ([muscle-names.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/muscle-names.json))**:
  - توثيق أسماء العضلات كما تُنطق وتُعرف في الصالات الرياضية (مثل: "باي"، "تراي"، "ترابيس"، "سواعد"، "سحب عالي"، "ترقوي"، "لوحي") مع الاحتفاظ بالأسماء التشريحية المنهجية.
  - ربط القاموس بالأطلس التفاعلي [AnatomyMuscleMap.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/AnatomyMuscleMap.tsx) وتفعيل ميزات التعتيم المتدرج (Focus Dimming) والوهج اللوني (Glow Effect) للعضلة المحددة.
- **سلّم قدرات تصدير وحفظ الملفات ([saveFile.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/saveFile.ts))**:
  - بناء دالة ذكية متعددة المستويات:
    1. المستوى الأول: استخدام File System Access API عند توفرها لاختيار مكان الحفظ المباشر.
    2. المستوى الثاني: استخدام Web Share API لمشاركة وحفظ الملف مباشرة في تطبيقات نظام التشغيل على الهواتف.
    3. المستوى الثالث: التحميل الآمن عبر رابط مؤقت وتنزيل المتصفح التلقائي.
  - دعم وحماية عمليات تصدير النسخ الاحتياطية وتصدير مكتبة التمارين والأغذية.
- **منظومة محاذير الإصابات ([exercise-region-load.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-region-load.json) & [limitations.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/limitations.ts))**:
  - تحليل مفاصل ومناطق التحميل الرئيسية (الكتف، أسفل الظهر، الركبة، المرفق، المعصم، الرقبة) وتصنيف درجة التحميل لكل تمرين.
  - إدراج اختيار الإصابات والمحاذير في معالج البداية [OnboardingWizard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/onboarding/OnboardingWizard.tsx).
  - إظهار شارات تحذير صريحة في صفحة تفاصيل التمرين [ExerciseDetailView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseDetailView.tsx) عند وجود تعارض مع إصابات المتدرب.
  - استبعاد التمارين المتعارضة مع إصابات المتدرب واقتراح البدائل الآمنة أثناء توليد البرامج في [programGenerator.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/programGenerator.ts).
- **الشرح البصري للحركة ([MovementExplainer.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/MovementExplainer.tsx))**:
  - بناء مكون بصري خفيف الوزن يعتمد على إطاري الحركة (بداية وذروة الانقباض) لـ 88 تمريناً رئيسياً في [media-frames.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/media-frames.json).
  - دعم الإيقاف المؤقت، وتغيير السرعة (0.5x و 1x و 1.5x)، وشريط التمرير اليدوي للإطارات، وزر كشف مدى الحركة (ROM Overlay).

---

## 4. الالتزام بقواعد العمل والتشغيل (Operating Rules Compliance)

| القاعدة     | الوصف                                         | مدى الالتزام في المهمة G                                                                                                                                                                                                                               |
| :---------- | :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1 & R2** | قاعدة الأدلة الموثقة وتوثيق الفحوصات قبل وبعد | تم تشغيل كافة سكريبتات البوابات وحفظ نتائج الفحص النصية والبصرية ومطابقتها للأدلة.                                                                                                                                                                     |
| **R3**      | منع اختلاق أو افتراض بيانات رقمية             | عدم وجود أي أرقام افتراضية في السعرات أو الأوزان، واستخدام حالات فارغة نزيهة ومحرك طاقة موحد.                                                                                                                                                          |
| **R4**      | صيانة ونزاهة المعادلات العلمية                | الالتزام الصارم بمعادلة ميفلين-سانت جور (Mifflin–St Jeor 1990) وتدقيقها في اختبارات الوحدة.                                                                                                                                                            |
| **R7**      | قواعد اللغة العربية والأرقام وعزل النصوص      | وحدة الوزن هي «جم» حصراً في كافة الأطعمة، والأرقام بالرسم العربي القياسي (0-9)، وجميع المصطلحات اللاتينية معزولة داخل وسوم `<bdi dir="ltr">`، مع خلو العناوين من النقطتين الرأسيتين اللاحقة (:).                                                       |
| **R10**     | التحقق ضد بناء الإنتاج مع عامل الخدمة         | تم تشغيل كافة بوابات Playwright ضد مجلد `dist/` مع التحقق من تفعيل الـ Service Worker في التحميل الثاني (`serviceWorkers: 'allow'`).                                                                                                                   |
| **R11**     | الإصلاح على مستوى المكونات والمتغيرات         | تمت كافة الإصلاحات في ملفات الـ CSS المركزية ومكونات الـ UI المشتركة دون أي تعديل استثنائي خاص بشاشة مفردة.                                                                                                                                            |
| **R12**     | بوابات جودة غير مفرغة                         | تم تطبيق شرط الحد الأدنى للعناصر المفحوصة في كافة البوابات (النتائج تراوحت بين 55 و 1225 عنصراً مفحوصاً لكل بوابة).                                                                                                                                    |
| **R13**     | الصدق في التوثيق («تم التحقق في المحاكاة»)    | الالتزام الصارم بصيغة «تم التحقق في المحاكاة» (Verified in emulation) وعدم ادعاء الفحص على هاتف حقيقي، مع إعداد قائمة الفحص الميداني [docs/device-checklist-g.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/device-checklist-g.md). |
| **R14**     | واقعية بيئات العرض والمحاكاة                  | تنفيذ الفحوصات على مقاسات الشاشات المعتمدة: `360×720` و `360×640` و `412×892` بكثافة DPR 2، تحت مقياس الخط العادي (1.0) والمكبر (1.3)، والوضعين الفاتح والداكن.                                                                                        |

---

## 5. فهرس المخرجات والملفات المنجزة (Deliverables Matrix)

1. **وثائق التقارير والمراجعات**:
   - [docs/g-report.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/g-report.md): هذا التقرير الشامل والموثق للمهمة G.
   - [docs/media-audit.html](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/media-audit.html): صفحة المراجعة التفاعلية لتدقيق وسائط الـ 88 تمريناً وعامل الخدمة.
   - [docs/device-checklist-g.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/device-checklist-g.md): قائمة التحقق الميداني المعتمدة للمالك على الهاتف الحقيقي.
   - [docs/brand-occurrences.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/brand-occurrences.md): توثيق خلو الواجهات من تكرار العلامة التجارية.
   - [docs/owner-profile-dump.json](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/owner-profile-dump.json): تفريغ حالة ملف المستخدم للاختبارات المعيارية.
2. **قواعد البيانات المصدرة والمحدثة**:
   - [docs/library-export.json](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/library-export.json) و [docs/library-export.csv](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/library-export.csv): قاعدة التمارين (261 تمريناً).
   - [docs/foods-export.csv](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/foods-export.csv): قاعدة الأطعمة المعتمدة بوحدة «جم» ومعادلات Atwater.
   - [src/data/muscle-names.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/muscle-names.json): قاموس العضلات بدارجة الجيم المصري.
   - [src/data/exercise-region-load.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-region-load.json): خريطة أحمال المفاصل والمحاذير.
   - [src/data/media-frames.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/media-frames.json): إطارات الحركة المفتاحية للتمارين.
3. **سكريبتات بوابات الجودة (Quality Gate Scripts)**:
   - [scripts/gate-inset.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-inset.mjs) (البوابة 5.1).
   - [scripts/gate-choice.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-choice.mjs) (البوابة 5.2).
   - [scripts/gate-buttons.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-buttons.mjs) (البوابة 5.3).
   - [scripts/gate-text.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-text.mjs) (البوابة 5.4).
   - [scripts/gate-geometry.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-geometry.mjs) (البوابة 5.5).
   - [scripts/audit-sw-media.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/audit-sw-media.mjs) (البوابة 5.9).
   - [scripts/verify.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/verify.mjs): الحزام الآلي الموحد (17 خطوة فحص متتالية).
4. **المكونات والوحدات البرمجية الأساسية المطورة**:
   - [src/modules/settings/DiagnosticsSheet.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/settings/DiagnosticsSheet.tsx)
   - [src/modules/nutrition/computeEnergyPlan.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/computeEnergyPlan.ts)
   - [src/modules/workout/limitations.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/limitations.ts)
   - [src/modules/workout/scheduleManager.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/scheduleManager.ts)
   - [src/modules/workout/MovementExplainer.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/MovementExplainer.tsx)
   - [src/utils/saveFile.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/saveFile.ts)
   - [src/utils/updateManager.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/updateManager.ts)
