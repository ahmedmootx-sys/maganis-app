# تقرير اتساق البيانات وازدواجية القيم (Data Consistency Report)

> **قيد صارم:** هذا التقرير يوثق الواقع الفعلي للبيانات ومسارات القراءة في المحركات الحسابية دون تغيير أي منطق حسابي أو كسر لتوافق الإصدارات السابقة.

---

## 1. حصر القيم المزدوجة ومصادر تخزينها (Duplicated Values Inventory)

| القيمة (Metric)                  | أماكن تواجدها في النماذج (Storage Locations)                                                                                                                                                         | النوع الافتراضي / النطاق      |
| :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| **أيام التدريب (Training Days)** | 1. `profile.trainingDaysPerWeek` في نموذج `UserProfile`<br>2. `program.days.length` في كائن `WorkoutProgram`<br>3. `workoutBlocks[].sessionsPerWeek` (جلسات EAT) في `UserProfile.body.workoutBlocks` | 1 - 7 أيام (الافتراضي 3 أو 4) |
| **الوزن (Body Weight)**          | 1. `profile.body.weightKg` في `UserProfile`<br>2. `bodyLog[].weightKg` في سجل قياسات الوزن المستمر (`trackingStore`)<br>3. `editWeight` في حاسبة السعرات وإعدادات التغذية (`NutritionModule`)        | كجم (30 - 300)                |
| **الطول (Height)**               | 1. `profile.body.heightCm` في `UserProfile`<br>2. `editHeight` في حاسبة السعرات وإعدادات التغذية                                                                                                     | سم (100 - 250)                |
| **الهدف الرياضي (Goal)**         | 1. `profile.primaryGoal` (hypertrophy, cut, flexibility, calisthenics)<br>2. `editGoal` في حاسبة السعرات (hypertrophy, cut, maintenance, recomposition, endurance)                                   | أهداف تضخيم / تنشيف / لياقة   |

---

## 2. ما تقرأه كل عملية حسابية ومصدرها المحدد (What Each Calculation Reads)

### أ. محرك توليد الجداول التدريبية (`programGenerator.ts`)

- **أيام التدريب:** يقرأ حصراً `profile.trainingDaysPerWeek`. يقوم بإنشاء مصفوفة `days` بعدد أيام مطابق.
- **الهدف:** يقرأ حصراً `profile.primaryGoal`.
- **الوزن والطول:** لا يدخلان في منطق توليد التمارين.

### ب. محرك التغذية والسعرات الدقيق (`nutritionEngine.ts` & `NutritionModule.tsx`)

- **أيام التدريب (حرق التمرين EAT):** يقرأ حصراً `profile.body.workoutBlocks[].sessionsPerWeek` (الافتراضي 4 جلسات مقاومة لمدة 60 دقيقة). **لا يقرأ** `profile.trainingDaysPerWeek` ولا طول مصفوفة `program.days`.
- **الوزن:** يقرأ `profile.body.weightKg` لحساب معدل الأيض الأساسي (BMR) ومعادلة ميفلين-سانت جور وكتلة الجسم النحيلة (LBM). **لا يقرأ** آخر وزن مسجل في `bodyLog`.
- **الطول:** يقرأ `profile.body.heightCm`.
- **الهدف:** يقرأ `profile.primaryGoal` ويقوم بمطابقته مع استراتيجية العجز أو الفائض الحراري.

### ج. لوحة التحكم الرئيسية (`Dashboard.tsx`)

- **الوزن الحالي:** كانت الدالة تقرأ حصراً `getLatestWeight(bodyLog)`. في حال عدم تسجيل أي وزن في سجل المتابعة اليومي `bodyLog`، كانت النتيجة تظهر كـ `"—"` بالرغم من وجود وزن أساسي محدد في `profile.body.weightKg`.
- **أيام الأسبوع:** تعرض جدول الأسبوع بالاعتماد على `program.days` الفعلي.
- **الجلسات المنجزة:** تحسب الجلسات الفعلية المسجلة في `recentSessions` للأسبوع الحالي.

### د. شاشة التقارير وتتبع الوزن (`Reports.tsx` & `BodyWeightTracker.tsx`)

- **رسم بياني للوزن:** يعتمد 100% على مدخلات `bodyLog` المتسلسلة زمنياً.
- **حجم التدريب:** يعتمد على `TrackingSession` الفعلية المسجلة.

---

## 3. حالات عدم التطابق في الملف التجريبي والواقع العملي (Demo / Profile Mismatches)

1. **انفصال أيام تدريب EAT عن أيام جدول التمارين:**
   - **السيناريو:** المستخدم يختار في استمارة البداية 3 أيام تدريب أسبوعياً (`trainingDaysPerWeek = 3`). يتم إنشاء جدول تمارين من 3 أيام (`program.days.length = 3`).
   - **الخلل في الاتساق:** محرك السعرات الحسابي يعتمد افتراضياً على `workoutBlocks` المحتوية على 4 جلسات أسبوعياً (`sessionsPerWeek = 4`)، مما يجعل حرق السعرات (EAT) محسوباً على أساس 4 أيام بدلاً من 3 أيام ما لم يقم المستخدم بتعديل إعدادات الحاسبة يدوياً.

2. **عرض الوزن في لوحة التحكم (Dashboard Weight Display):**
   - **السيناريو:** مستخدم أكمل استمارة البداية وأدخل وزنه 75 كجم (`profile.body.weightKg = 75`)، ولكنه لم يضف بعد أي إدخال جديد في قسم تتبع الوزن اليومي (`bodyLog = []`).
   - **الخلل في الاتساق:** الشاشة كانت تعرض `"—"` بدلاً من 75 كجم، مما يعطي انطباعاً بأن بيانات المستخدم فُقدت.
   - **الحل المعتمد في نظام التصميم الجديد (Task B):** قراءة أحدث إدخال في `bodyLog`، وإذا لم يوجد، الرجوع تلقائياً إلى وزن الملف الشخصي (`profile.body.weightKg`) مع توضيح المصدر في السطر الفرعي (مثال: "من الملف الشخصي" أو "آخر تسجيل: 14 أكتوبر").

3. **تعدد مسميات الأهداف (Goal Vocabulary Divergence):**
   - `UserProfile.primaryGoal` يستخدم: `'hypertrophy' | 'cut' | 'flexibility' | 'calisthenics'`
   - `nutritionEngine` يتعامل مع: `'hypertrophy' | 'cut' | 'maintenance' | 'recomposition' | 'endurance'`
   - يتم عمل تحويل تلقائي (Fallback) للأهداف غير المطابقة، حيث يُعامل `flexibility` و `calisthenics` في التغذية كـ `maintenance` (ثبات).
