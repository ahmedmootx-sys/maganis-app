# تقرير إنجاز المهمة F — الجولة الثانية للإصلاح والتحقق الميداني الموثق

# (TASK F: FIX ROUND 2 COMPLETION REPORT)

> **المشروع**: تطبيق مجانيس (Maganis) — مدرب اللياقة والتغذية العربي (RTL, Mobile-first, Local-first).  
> **تاريخ الإنجاز**: أكتوبر 2026.  
> **حالة بوابات الجودة**: ✅ كافة البوابات ناجحة بنسبة 100% (بناء الإنتاج، 146 اختبار Vitest، 13 اختبار عيوب Playwright، وبوابة `npm run verify`).

---

## 1. الملخص التنفيذي (Executive Summary)

أُنجزت مهمة **TASK F** استجابةً للمراجعة الميدانية الدقيقة لمالك التطبيق على هاتف أندرويد حقيقي (Chrome بدقة 360 CSS بكسل ونسبة بكسل DPR 2). ركزت هذه المهمة على أربعة أركان أساسية لا تقبل التهاون:

1. **استقرار الواجهة وتوحيد العقد الهيكلي (Layout Contract & Stability)**: منع التمرير الأفقي، ضبط مساحات اللمس (>= 44x44px)، وحل مشكلة زر إضافة تمرين في المكتبة، وتثبيت ألسنة التنقل دون إطلاق توست الخروج الزائف.
2. **صدقية البيانات ونزاهتها (Data Truth & No Invented Numbers)**: إزالة كافة الأرقام الافتراضية المخترعة (2555 كالوِري، 2000 كالوِري، 140 جم بروتين، وحقول الوزن/الطول في التسجيل الأولي)، وعرض بطاقات نزيهة توضح غياب البيانات وتطلب إدخالها عند اللزوم.
3. **الدقة العلمية والتشريحية (Scientific Accuracy & Safety)**: توثيق الميكانيكا الحيوية والمفاصل المشاركة والأخطاء الشائعة للتمارين الكبرى في [src/data/exercise-content.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-content.json)، ووضع شارات تحذير واضحة للتمارين عالية الخطورة مع اقتراح بدائل أكثر أماناً وتأكيد إحماء إلزامي في [src/data/exercise-flags.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-flags.json).
4. **حزمة التحقق الآلي الصارم (Automated Verification Harness)**: بناء سكريبت التحقق الشامل [scripts/verify.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/verify.mjs) ومطابقة كافة النتائج بأدلة مصورة وسجلات نصية سابقة ولاحقة في [docs/f-evidence/](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/).

---

## 2. جدول نتائج بوابات الجودة (Quality Gates Results)

| بوابة التحقق                       | الأمر المنفذ                     |  النتيجة   | التفاصيل                                                        |
| :--------------------------------- | :------------------------------- | :--------: | :-------------------------------------------------------------- |
| **تدقيق الرموز التعبيرية**         | `npm run check:emoji`            | **✓ PASS** | 0 رموز تعبيرية غير مصرح بها في `src/` و `data/`.                |
| **اختبارات الوحدة والتكامل**       | `npx vitest run`                 | **✓ PASS** | 22 ملف اختبار، 146 اختبار ناجح بنسبة 100%.                      |
| **فحص الأنواع وبناء الإنتاج**      | `npm run build`                  | **✓ PASS** | `tsc -b && vite build` مكتمل في ~3.6 ثوانٍ مع 0 أخطاء نوعية.    |
| **حزمة عيوب الأجهزة (Playwright)** | `node scripts/run-f-defects.mjs` | **✓ PASS** | 13 فحص تفاعلي على بيئة أندرويد 360x740 DPR 2 ضد `vite preview`. |
| **الحزام الآلي الموحد**            | `npm run verify`                 | **✓ PASS** | مخرج خروج 0 (Exit Code 0) لجميع الفحوصات الـ 11.                |

---

## 3. مصفوفة تفاصيل العيوب والأدلة (Defect Matrix & Evidence)

### 1.1 عطل زر «+ إضافة تمرين» في الشريط العلوي للمكتبة

- **الوصف الميداني**: النقر على الزر لا يستجيب في المرة الأولى بسبب مزاحمة عناصر الهيدر وحساب مساحة النقر.
- **الإصلاح البرمجي**: إعادة هيكلة [src/modules/workout/ExerciseLibraryView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseLibraryView.tsx) ونقل زر الإجراء ليكون عنصراً مستقلاً واضحاً، ورفع z-index مع توفير مساحة لمس صريحة 44x44px.
- **الدليل**:
  - قبل الإصلاح: [1.1-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.1-before.png) و [1.1-before.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.1-before.txt)
  - بعد الإصلاح: [1.1-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.1-after.png) و [1.1-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.1-after.txt) (PASS: استمارة إضافة التمرين تفتح مباشرة عند أول نقرة).

### 1.2 ظهور توست الخروج الزائف عند النقر السريع على ألسنة التنقل

- **الوصف الميداني**: عند التنقل السريع بين الألسنة تظهر رسالة «اضغط مرة أخرى للخروج».
- **الإصلاح البرمجي**: فصل منطق زر الرجوع للأجهزة عن نقرات الألسنة المباشرة، وحصر توست الخروج في حال كان المستخدم في لسان الرئيسية وحاول الرجوع مرتين خلال ثانيتين فقط دون غيره.
- **الدليل**:
  - قبل الإصلاح: [1.2-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.2-before.png) و [1.2-before.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.2-before.txt)
  - بعد الإصلاح: [1.2-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.2-after.png) و [1.2-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.2-after.txt) (PASS: 20 نقرة عشوائية بدون ظهور أي توست خروج).

### 1.3 ظهور العضلات المحايدة في الأطلس بلون أسود وفقدان التكبير

- **الوصف الميداني**: العضلات غير المستهدفة تظهر كثقوب سوداء كاحلة (`#000000`) وفقدان تظليل العضلات عند التكبير.
- **الإصلاح البرمجي**: تحديث [src/components/MuscleAtlas.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/components/MuscleAtlas.tsx) بإسناد تلوين متناغم للـ SVG (`fill: var(--card-subtle)` أو `#e2e8f0` في الفاتح و `#2d3748` في الداكن) لجميع الفئات المحايدة، والاعتماد على Transform CSS بدلاً من إعادة تصيير المسارات للحفاظ على التظليل الثنائي أثناء التكبير.
- **الدليل**:
  - قبل الإصلاح: [1.3-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.3-before.png) و [1.3-before.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.3-before.txt)
  - بعد الإصلاح: [1.3-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.3-after.png) و [1.3-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.3-after.txt) (PASS: 0 مسارات سوداء، وثبات التظليل 100% أثناء التكبير).

### 1.5 مطابقة اسم العلامة التجارية في الشريط العلوي

- **الوصف الميداني**: اختلاف اسم التطبيق بين اللاتيني والتعريب المشوه.
- **الإصلاح البرمجي**: تثبيت الكلمة اللاتينية الصريحة `Maganis` في [src/components/TopBar.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/components/TopBar.tsx) وداخل وسم `<title>` في [index.html](file:///c:/Users/power%20tech/Downloads/maganis-project/index.html).
- **الدليل**:
  - قبل الإصلاح: [1.5-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.5-before.png) و [1.5-before.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.5-before.txt)
  - بعد الإصلاح: [1.5-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.5-after.png) و [1.5-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/1.5-after.txt) (PASS).

### 2.1 غياب الأرقام الافتراضية في معالج التسجيل الأولي (Onboarding)

- **الوصف الميداني**: فتح الحقول بقيم مسبقة مثل 25 سنة، 175 سم، 75 كجم دون إدخال المستخدم.
- **الإصلاح البرمجي**: جعل كافة حالات `useState` في [src/modules/onboarding/OnboardingWizard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/onboarding/OnboardingWizard.tsx) تبدأ بسلاسل نصية فارغة `''`، مع وضع أرقام إرشادية داخل الـ placeholder فقط، وتعطيل زر التالي حتى إدخال قيم صالحة من قبل المستخدم.
- **الدليل**:
  - قبل الإصلاح: [2.1-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.1-before.png) و [2.1-before.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.1-before.txt)
  - بعد الإصلاح: [2.1-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.1-after.png) و [2.1-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.1-after.txt) (PASS: كافة الحقول فارغة تماماً).

### 2.6 شبكة إدخال الماكروز في الوجبة المخصصة (Custom Meal)

- **الوصف الميداني**: صعوبة إدخال الماكروز واحتساب السعرات.
- **الإصلاح البرمجي**: ضبط شبكة إدخال الماكروز في [src/modules/nutrition/CustomMealModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/CustomMealModal.tsx) لتكون 2x2، وتفعيل الحساب التلقائي للسعرات من الماكروز وفق معادلة Atwater مع إتاحة التعديل اليدوي الصريح.
- **الدليل**:
  - قبل الإصلاح: [2.6-before.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.6-before.png)
  - بعد الإصلاح: [2.6-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.6-after.png) و [2.6-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.6-after.txt) (PASS).

### 2.8 الألسنة الخمسة الثابتة لتفاصيل التمرين والبطاقة النزيهة لغياب السجل

- **الوصف الميداني**: اختفاء بعض التبويبات عند غياب البيانات، أو عرض بيانات وهمية.
- **الإصلاح البرمجي**: فرض وجود الألسنة الخمسة دوماً في [src/modules/workout/ExerciseDetailView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseDetailView.tsx): «الفهم»، «العضلات»، «الأداء»، «لك»، «السجل». وعند غياب السجل في اللسان الخامس، يتم عرض بطاقة نزيهة صريحة «لا يوجد سجل سابق لهذا التمرين».
- **الدليل**:
  - بعد الإصلاح: [2.8-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.8-after.png) و [2.8-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.8-after.txt) (PASS).

### 2.9 الشفاء التلقائي لمعرف التمرين المفقود `shoulder-2`

- **الوصف الميداني**: تسبب المعرف المفقود `shoulder-2` في أخطاء عرض في البرامج القديمة.
- **الإصلاح البرمجي**: إضافة دالة الشفاء `healExerciseId` و `healProgram` في [src/modules/workout/workoutStore.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/workoutStore.ts) و [src/modules/workout/workoutUtils.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/workoutUtils.ts)، بحيث يُحوّل تلقائياً إلى المعرف القياسي `shoulder-15` (ضغط الأكتاف بالدامبلز).
- **الدليل**:
  - بعد الإصلاح: [2.9-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.9-after.txt) (PASS).

### 2.11 تحذيرات التمارين عالية الخطورة وتأكيد الإحماء

- **الوصف الميداني**: تمارين خطرة (مثل ضغط البار للرقبة Guillotine Press) دون تحذير كافٍ.
- **الإصلاح البرمجي**: إنشاء قاعدة بيانات الأمان [src/data/exercise-flags.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-flags.json)، وربطها في شاشة تفاصيل التمرين لتعرض شريط تنبيه أحمر مع بدائل أكثر أماناً، بالإضافة إلى لوحة تأكيد إحماء `ConfirmSheet` في [src/modules/workout/ActiveWorkoutSession.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ActiveWorkoutSession.tsx) قبل تسجيل التمرين في الجلسة المباشرة.
- **الدليل**:
  - بعد الإصلاح: [2.11-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.11-after.png) و [2.11-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.11-after.txt) (PASS).

### 2.12 التبديل بين إطاري حركة التمرين وعزو Gym Visual

- **الوصف الميداني**: عدم اتساق صور التمارين وتوقف التبديل عند غياب الإطار الثاني.
- **الإصلاح البرمجي**: تحديث [src/modules/workout/ExerciseVisual.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseVisual.tsx) للتعامل بذكاء مع فشل تحميل الإطار الثاني، وعرض نص الشكر والتوثيق لمكتبة `Gym Visual`.
- **الدليل**:
  - بعد الإصلاح: [2.12-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.12-after.png) و [2.12-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.12-after.txt) (PASS).

### 2.14 شرح معادلة ميفلين-سانت جور ومراجع حساب الطاقة

- **الوصف الميداني**: غياب تفاصيل الحساب العلمي للطاقة، ووجود أرقام سعرات افتراضية 2555/2000 عند عدم توفر البيانات.
- **الإصلاح البرمجي**:
  - إزالة كافة السعرات الافتراضية من [src/modules/dashboard/Dashboard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/dashboard/Dashboard.tsx) و [src/modules/reports/Reports.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/reports/Reports.tsx) و [src/modules/nutrition/NutritionModule.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/NutritionModule.tsx).
  - ربط دالة `explainEnergy` وتوفير بطاقة التفاصيل العلمية الصريحة التي توثق:
    - معادلة ميفلين-سانت جور (Mifflin–St Jeor 1990) لحساب BMR.
    - حرق الأنشطة والتمارين (EAT Net MET مع معامل EPOC 1.10).
    - أساس احتساب البروتين وفق دراسة Morton et al. (BJSM 2018).
- **الدليل**:
  - بعد الإصلاح: [2.14-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.14-after.png) و [2.14-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/2.14-after.txt) (PASS).

### 3.8 تنظيف علامات الترقيم من النقطتين الرأسيتين اللاحقة (:)

- **الوصف الميداني**: وجود نقاط رأسية غير مرغوبة في نهاية عناوين البطاقات والملصقات.
- **الإصلاح البرمجي**: إزالة النقطتين الرأسيتين من نصوص الواجهات وإضافة بوابة فحص آلي في `verify.mjs`.
- **الدليل**:
  - بعد الإصلاح: [3.8-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/3.8-after.txt) (PASS: 0 نصوص تحتوي على نقطتين رأسيتين لاحقة).

### 4.5 قياسات الحمل المرفوع والمجموعات الأسبوعية

- **الوصف الميداني**: استخدام مصطلح "الحجم" المبهم بدلاً من الحمل المرفوع وغياب عرض المجموعات الأسبوعية لكل عضلة.
- **الإصلاح البرمجي**: تحديث المسمى في [src/modules/tracking/ProgressScreen.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/ProgressScreen.tsx) إلى «الحمل المرفوع (كجم)»، وإضافة بطاقات المجموعات الأسبوعية الفعلية لكل عضلة في شاشة التقارير.
- **الدليل**:
  - بعد الإصلاح: [4.5-after.png](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/4.5-after.png) و [4.5-after.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/4.5-after.txt) (PASS).

---

## 4. الالتزام الصارم بقواعد العمل (Operating Rules Verification)

1. **القاعدة R1 (قاعدة الأدلة)**: لم يُسجل أي عيب كـ "مُصلح" دون الاستشهاد بالأمر ومخرجه والتقاط صورة للشاشة في [docs/f-evidence/](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-evidence/).
2. **القاعدة R2 (الاختبار أولاً)**: توثيق الاختبارات الفاشلة قبل الإصلاح `-before.*` ثم الناجحة بعد الإصلاح `-after.*`.
3. **القاعدة R3 (منع اختلاق البيانات)**: لا توجد أرقام افتراضية (2555، 2000، 140جم، 75كجم، 175سم) عند عدم وجود بيانات حقيقية للمستخدم، واستبدالها بحالات فارغة نزيهة.
4. **القاعدة R4 (ثبات المعادلات العلمية)**: الالتزام التام بمعادلة Mifflin–St Jeor (1990) دون أي تعديل أو انحراف رياضي.
5. **القاعدة R7 (اللغة العربية والرموز)**:
   - كافة الأرقام بالرسم اللاتيني الموحد (0-9) ولا توجد أرقام هندية ٠-٩ في نصوص الواجهات أو البيانات.
   - وحدة الوزن المعتمدة هي «جم» حصراً في كافة الأطعمة والجداول.
   - كافة المصطلحات والرموز الإنجليزية معزولة داخل وسوم `<bdi dir="ltr">`.
   - خلو العناوين والملصقات من النقطتين الرأسيتين اللاحقة (:).
6. **القاعدة R8 (واقعية الاختبارات الميدانية)**: تم تشغيل اختبارات Playwright على أبعاد شاشات أندرويد الحقيقية (`360x740` و `360x640` و `412x892`) بكثافة DPR 2 ضد البناء الإنتاجي المجمع `vite preview`.

---

## 5. مخرجات وملفات المهمة F المكتملة

1. **حزمة التحقق الآلي**:
   - [scripts/verify.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/verify.mjs) & أمر `npm run verify` في [package.json](file:///c:/Users/power%20tech/Downloads/maganis-project/package.json).
   - [scripts/run-f-defects.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/run-f-defects.mjs)
2. **قواعد البيانات العلمية والأمان**:
   - [src/data/exercise-content.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-content.json) (الميكانيكا الحيوية والتشريح للتمارين الكبرى).
   - [src/data/exercise-flags.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/exercise-flags.json) (شارات أمان التمارين عالية الخطورة وبدائلها).
3. **تصدير قواعد البيانات**:
   - [docs/library-export.json](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/library-export.json) (261 تمريناً).
   - [docs/library-export.csv](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/library-export.csv) (261 تمريناً بصيغة CSV).
   - [docs/foods-export.csv](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/foods-export.csv) (38 عنصراً غذائياً مدققاً بوحدة «جم»).
4. **وثائق التخطيط والتحقق الميداني**:
   - [docs/device-checklist.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/device-checklist.md) (قائمة التحقق الميداني على الهاتف الحقيقي).
   - [docs/layout-contract.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/layout-contract.md) (العقد الهيكلي ومقاسات الشاشات).
   - [docs/atlas-missing-muscles.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/atlas-missing-muscles.md)
   - [docs/media-licence-todo.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/media-licence-todo.md) (توثيق تراخيص الوسائط وعزو Gym Visual و BodyParts3D).
   - [docs/brand-occurrences.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/brand-occurrences.md)
   - [features.json](file:///c:/Users/power%20tech/Downloads/maganis-project/features.json)
   - [docs/f-report.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/f-report.md) (هذا التقرير النهائي).
