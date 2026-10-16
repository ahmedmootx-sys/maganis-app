# تقرير المستويات التشريحية للتمارين (Muscle Tier Report)

- **تاريخ التقرير**: 2026-10-16T12:18:09.049Z
- **عدد تمارين المكتبة الكاملة**: 261 تمريناً
- **عدد تمارين البرنامج المفحوصة**: 44 تمريناً
- **عدد التمارين المنسقة يدوياً (Curated)**: 46 تمريناً

---

## 1. تحليل وتصحيح تمرين البنش برس ("Barbell Bench Press - Medium Grip")

### 1.1 سبب سقوط التمرين سابقاً إلى المستوى الثالث (Tier 3)
1. **ترتيب المطابقة الناقص**: كان كائن التمرين في المكتبة يحمل المعرّف `chest-1` ومعرّف الصورة `Barbell_Bench_Press_-_Medium_Grip`، بينما كان ملف `exercise_muscles.json` يحتوي فقط على المفتاحين العامين `barbell_bench_press` و `flat_bench_press`. عند المطابقة، تم فحص `barbell_bench_press_medium_grip` دون تطابق مباشر، فسقط التمرين مباشرة إلى المستوى الثالث.
2. **غياب عضلات المساعدة (مساعدة 0)**: في المستوى الثالث، كان محرك التوسيع يبحث فقط عن `primary_muscles` ولم تكن حقول `secondary_muscles.db` أو مصفوفة `targetMusclesAr` مفعلة لإسناد الأدوار الثانوية، مما أدى لتعيين عضلات الصدر فقط كعضلات رئيسية مع 0 عضلات مساعدة بالرغم من ظهور الترايسبس والكتف في تبويب الفهم.
3. **سبب ظهور "في الخلفي: 1 عضلات"**:
   - العضلة التي تسببت في هذا العدد هي: **`pec_costal` (الرأس القصي/الضلعي لعضلة الصدر الكبرى)**.
   - في ملف الميتا التشريحي `public/atlas/atlas-meta.json`، تملك عضلة `pec_costal` قيمة `visible_pixels = 250` في المنظر الخلفي (`views.P`) مع نسبة `visible_ratio = 0.025` (تسرب بكسلات طفيف جداً بسبب التقاطع الهندسي ثلاثي الأبعاد).
   - النظام القديم كان يفحص فقط `visible_pixels > 0` بدون حد أدنى، فقام باحتساب `pec_costal` كعضلة متواجدة بالخلف!
   - **الحل الجذري المطبق**:
     1. إضافة عتبة وضوح معتمدة تشريحياً (`visible_pixels > 500 && visible_ratio >= 0.10`) لمنع تسرب البكسلات العرضية.
     2. ترقية تمرين البنش برس إلى **Tier 1** بتطابق معرّف `Barbell_Bench_Press_-_Medium_Grip` المباشر، لترتبط به عضلات الصدر (رئيسي) والكتف الأمامي والترايسبس (مساعد). ونظراً لأن رؤوس الترايسبس تقع في المنظر الخلفي، يظهر الآن بشكل سليم ومطابق للواقع "في الخلفي: 2 عضلات" (الترايسبس) في المنظر الأمامي.

---

## 2. مصفوفة التحقق من التمارين المنسقة (Curated Entries -> Tier 1)

جميع الإدخالات الـ 46 المنسقة يدوياً تطابقت بنجاح 100% ووصلت إلى **Tier 1**:

| # | معرّف قاعدة البيانات (db_id) | كود التمرين في المكتبة | اسم التمرين | المستوى المحقق | الحالة |
|:---|:---|:---:|:---|:---:|:---:|
| 1 | `Barbell_Bench_Press_-_Medium_Grip` | `chest-1` | Barbell Bench Press - Medium Grip | **Tier 1** | PASS (Tier 1) |
| 2 | `Barbell_Incline_Bench_Press_-_Medium_Grip` | `chest-4` | Barbell Incline Bench Press - Medium Grip | **Tier 1** | PASS (Tier 1) |
| 3 | `Decline_Barbell_Bench_Press` | `chest-13` | Decline Barbell Bench Press | **Tier 1** | PASS (Tier 1) |
| 4 | `Dumbbell_Bench_Press` | `chest-2` | Dumbbell Bench Press | **Tier 1** | PASS (Tier 1) |
| 5 | `Incline_Dumbbell_Press` | `chest-5` | Incline Dumbbell Press | **Tier 1** | PASS (Tier 1) |
| 6 | `Decline_Dumbbell_Bench_Press` | `chest-15` | Decline Dumbbell Bench Press | **Tier 1** | PASS (Tier 1) |
| 7 | `Dumbbell_Flyes` | `chest-6` | Dumbbell Flyes | **Tier 1** | PASS (Tier 1) |
| 8 | `Cable_Crossover` | `chest-7` | Cable Crossover | **Tier 1** | PASS (Tier 1) |
| 9 | `Dips_-_Chest_Version` | `chest-11` | Dips - Chest Version | **Tier 1** | PASS (Tier 1) |
| 10 | `Pushups` | `chest-3` | Pushups | **Tier 1** | PASS (Tier 1) |
| 11 | `Barbell_Deadlift` | `back-14` | Barbell Deadlift | **Tier 1** | PASS (Tier 1) |
| 12 | `Romanian_Deadlift` | `leg-6` | Romanian Deadlift | **Tier 1** | PASS (Tier 1) |
| 13 | `Bent_Over_Barbell_Row` | `back-4` | Bent Over Barbell Row | **Tier 1** | PASS (Tier 1) |
| 14 | `One-Arm_Dumbbell_Row` | `back-13` | One-Arm Dumbbell Row | **Tier 1** | PASS (Tier 1) |
| 15 | `Pullups` | `back-10` | Pullups | **Tier 1** | PASS (Tier 1) |
| 16 | `Chin-Up` | `back-17` | Chin-Up | **Tier 1** | PASS (Tier 1) |
| 17 | `Wide-Grip_Lat_Pulldown` | `back-1` | Wide-Grip Lat Pulldown | **Tier 1** | PASS (Tier 1) |
| 18 | `Seated_Cable_Rows` | `back-6` | Seated Cable Rows | **Tier 1** | PASS (Tier 1) |
| 19 | `T-Bar_Row_with_Handle` | `back-8` | T-Bar Row with Handle | **Tier 1** | PASS (Tier 1) |
| 20 | `Face_Pull` | `shoulder-12` | Face Pull | **Tier 1** | PASS (Tier 1) |
| 21 | `Barbell_Shrug` | `back-20` | Barbell Shrug | **Tier 1** | PASS (Tier 1) |
| 22 | `Hyperextensions_Back_Extensions` | `back-9` | Hyperextensions (Back Extensions) | **Tier 1** | PASS (Tier 1) |
| 23 | `Standing_Military_Press` | `shoulder-1` | Standing Military Press | **Tier 1** | PASS (Tier 1) |
| 24 | `Dumbbell_Shoulder_Press` | `shoulder-15` | Dumbbell Shoulder Press | **Tier 1** | PASS (Tier 1) |
| 25 | `Side_Lateral_Raise` | `shoulder-3` | Side Lateral Raise | **Tier 1** | PASS (Tier 1) |
| 26 | `Front_Dumbbell_Raise` | `shoulder-4` | Front Dumbbell Raise | **Tier 1** | PASS (Tier 1) |
| 27 | `Cable_Rear_Delt_Fly` | `Cable_Rear_Delt_Fly` | Cable Rear Delt Fly | **Tier 1** | PASS (Tier 1) |
| 28 | `Upright_Barbell_Row` | `shoulder-17` | Upright Barbell Row | **Tier 1** | PASS (Tier 1) |
| 29 | `Barbell_Curl` | `arm-1` | Barbell Curl | **Tier 1** | PASS (Tier 1) |
| 30 | `Dumbbell_Bicep_Curl` | `arm-2` | Dumbbell Bicep Curl | **Tier 1** | PASS (Tier 1) |
| 31 | `Hammer_Curls` | `arm-3` | Hammer Curls | **Tier 1** | PASS (Tier 1) |
| 32 | `Preacher_Curl` | `Preacher_Curl` | Preacher Curl | **Tier 1** | PASS (Tier 1) |
| 33 | `Triceps_Pushdown` | `arm-12` | Triceps Pushdown | **Tier 1** | PASS (Tier 1) |
| 34 | `Standing_Dumbbell_Triceps_Extension` | `Standing_Dumbbell_Triceps_Extension` | Standing Dumbbell Triceps Extension | **Tier 1** | PASS (Tier 1) |
| 35 | `Standing_Overhead_Barbell_Triceps_Extension` | `arm-15` | Standing Overhead Barbell Triceps Extension | **Tier 1** | PASS (Tier 1) |
| 36 | `Lying_Triceps_Press` | `arm-14` | Lying Triceps Press | **Tier 1** | PASS (Tier 1) |
| 37 | `Barbell_Full_Squat` | `leg-1` | Barbell Full Squat | **Tier 1** | PASS (Tier 1) |
| 38 | `Front_Barbell_Squat` | `leg-11` | Front Barbell Squat | **Tier 1** | PASS (Tier 1) |
| 39 | `Leg_Press` | `leg-4` | Leg Press | **Tier 1** | PASS (Tier 1) |
| 40 | `Leg_Extensions` | `leg-18` | Leg Extensions | **Tier 1** | PASS (Tier 1) |
| 41 | `Lying_Leg_Curls` | `leg-5` | Lying Leg Curls | **Tier 1** | PASS (Tier 1) |
| 42 | `Barbell_Hip_Thrust` | `leg-20` | Barbell Hip Thrust | **Tier 1** | PASS (Tier 1) |
| 43 | `Standing_Calf_Raises` | `leg-9` | Standing Calf Raises | **Tier 1** | PASS (Tier 1) |
| 44 | `Seated_Calf_Raise` | `leg-10` | Seated Calf Raise | **Tier 1** | PASS (Tier 1) |
| 45 | `Hanging_Leg_Raise` | `core-17` | Hanging Leg Raise | **Tier 1** | PASS (Tier 1) |
| 46 | `Plank` | `core-1` | Plank | **Tier 1** | PASS (Tier 1) |

---

## 3. توزيع مستويات تمارين المكتبة الكاملة (261 exercises)

| المستوى (Tier) | عدد التمارين | النسبة | الوصف |
|:---|:---:|:---:|:---|
| **Tier 1 (منسق يدوياً بدقة الرؤوس)** | 47 | 18.0% | تطابق دقيق مع قاعدة التمارين المنسقة `exercise_muscles.json` |
| **Tier 2 (محدد مخصصاً)** | 0 | 0.0% | مخصص للتمارين التي ينشئها المستخدم من منتقي العضلات |
| **Tier 3 (توسيع المجموعة مع العضلات الثانوية)** | 214 | 82.0% | توسيع المجموعة العضلية (`group-to-heads.json`) وإسناد `secondary_muscles` |
| **Tier 4 (أسماء فقط)** | 0 | 0.0% | تمارين عامة بدون خريطة تشريحية |

---

## 4. قائمة تمارين البرنامج التدريبي (44 Program Exercises)

| # | كود التمرين | اسم التمرين | المستوى المحقق | رئيسية | مساعدة | سبب الوصول للمستوى |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| 1 | `chest-1` | Barbell Bench Press - Medium Grip | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Bench_Press_-_Medium_Grip) |
| 2 | `chest-4` | Barbell Incline Bench Press - Medium Grip | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Incline_Bench_Press_-_Medium_Grip) |
| 3 | `shoulder-1` | Standing Military Press | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Standing_Military_Press) |
| 4 | `shoulder-3` | Side Lateral Raise | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Side_Lateral_Raise) |
| 5 | `arm-12` | Triceps Pushdown | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Triceps_Pushdown) |
| 6 | `arm-15` | Standing Overhead Barbell Triceps Extension | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Standing_Overhead_Barbell_Triceps_Extension) |
| 7 | `back-1` | Wide-Grip Lat Pulldown | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Wide-Grip_Lat_Pulldown) |
| 8 | `back-8` | T-Bar Row with Handle | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: T-Bar_Row_with_Handle) |
| 9 | `back-13` | One-Arm Dumbbell Row | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: One-Arm_Dumbbell_Row) |
| 10 | `back-10` | Pullups | **Tier 1** | 2 | 5 | تطابق معرّف قاعدة البيانات (db_id: Pullups) |
| 11 | `arm-1` | Barbell Curl | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Curl) |
| 12 | `shoulder-5` | Cable Seated Lateral Raise | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + traps) |
| 13 | `leg-1` | Barbell Full Squat | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Full_Squat) |
| 14 | `leg-4` | Leg Press | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Leg_Press) |
| 15 | `leg-5` | Lying Leg Curls | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Lying_Leg_Curls) |
| 16 | `leg-6` | Romanian Deadlift | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Romanian_Deadlift) |
| 17 | `leg-9` | Standing Calf Raises | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Standing_Calf_Raises) |
| 18 | `core-1` | Plank | **Tier 1** | 3 | 2 | تطابق معرّف قاعدة البيانات (db_id: Plank) |
| 19 | `chest-2` | Dumbbell Bench Press | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Bench_Press) |
| 20 | `chest-5` | Incline Dumbbell Press | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Incline_Dumbbell_Press) |
| 21 | `back-1` | Wide-Grip Lat Pulldown | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Wide-Grip_Lat_Pulldown) |
| 22 | `shoulder-2` | shoulder-2 | **Tier 4** | 0 | 0 | لا تتوفر مجموعة عضلية أو استهداف تشريحي مطابق (أسماء فقط) |
| 23 | `arm-2` | Dumbbell Bicep Curl | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Bicep_Curl) |
| 24 | `arm-14` | Lying Triceps Press | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Lying_Triceps_Press) |
| 25 | `leg-1` | Barbell Full Squat | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Full_Squat) |
| 26 | `leg-11` | Front Barbell Squat | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: Front_Barbell_Squat) |
| 27 | `leg-6` | Romanian Deadlift | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Romanian_Deadlift) |
| 28 | `leg-13` | Dumbbell Step Ups | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| 29 | `leg-10` | Seated Calf Raise | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Seated_Calf_Raise) |
| 30 | `core-5` | Push Up to Side Plank | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + shoulders + triceps) |
| 31 | `chest-7` | Cable Crossover | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Cable_Crossover) |
| 32 | `shoulder-4` | Front Dumbbell Raise | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Front_Dumbbell_Raise) |
| 33 | `arm-13` | Triceps Pushdown - Rope Attachment | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| 34 | `arm-3` | Hammer Curls | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Hammer_Curls) |
| 35 | `arm-4` | Concentration Curls | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| 36 | `core-2` | Crunches | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| 37 | `chest-3` | Pushups | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Pushups) |
| 38 | `back-17` | Chin-Up | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: Chin-Up) |
| 39 | `leg-19` | Bodyweight Squat | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| 40 | `core-7` | Russian Twist | **Tier 3** | 3 | 1 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (lats) |
| 41 | `shoulder-14` | One-Arm Side Laterals | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| 42 | `arm-16` | Tricep Dumbbell Kickback | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| 43 | `chest-11` | Dips - Chest Version | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Dips_-_Chest_Version) |
| 44 | `leg-14` | Box Squat | **Tier 3** | 4 | 12 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (adductors + calves + glutes + hamstrings + lats) |

---

## 5. تقرير تمارين المكتبة الكاملة (All 261 Library Exercises)

| كود التمرين | اسم التمرين بالإنجليزية | الاسم بالعربية | التصنيف | المستوى | رئيسية | مساعدة | السبب والآلية |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| `chest-1` | Barbell Bench Press - Medium Grip | ضغط صدري بالبار | chest | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Bench_Press_-_Medium_Grip) |
| `chest-4` | Barbell Incline Bench Press - Medium Grip | ضغط صدري مائل بالبار (بنش عالي) | chest | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Incline_Bench_Press_-_Medium_Grip) |
| `chest-13` | Decline Barbell Bench Press | ضغط صدري مقلوب بالبار (بنش سفلي) | chest | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Decline_Barbell_Bench_Press) |
| `chest-18` | Wide-Grip Barbell Bench Press | ضغط صدري بالبار قبضة واسعة | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Barbell_Guillotine_Bench_Press` | Barbell Guillotine Bench Press | ضغط صدري بار للمستوى الترقوي (Guillotine) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `chest-2` | Dumbbell Bench Press | ضغط صدري بالدمبل (بنش مستوٍ) | chest | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Bench_Press) |
| `chest-5` | Incline Dumbbell Press | ضغط صدري مائل بالدمبل (بنش عالي) | chest | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Incline_Dumbbell_Press) |
| `chest-15` | Decline Dumbbell Bench Press | ضغط صدري مقلوب بالدمبل (بنش سفلي) | chest | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Decline_Dumbbell_Bench_Press) |
| `chest-6` | Dumbbell Flyes | تفتيح صدر بالدمبل (مستوٍ) | chest | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Flyes) |
| `chest-9` | Incline Dumbbell Flyes | تفتيح صدر مائل بالدمبل (عالي) | chest | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `chest-12` | Decline Dumbbell Flyes | تفتيح صدر مقلوب بالدمبل (سفلي) | chest | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `chest-16` | Straight-Arm Dumbbell Pullover | سحب دمبل مستقيم للصدر واللاتس (بولوفر) | chest | **Tier 3** | 3 | 7 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + shoulders + triceps) |
| `chest-17` | One-Arm Flat Bench Dumbbell Flye | تفتيح صدر بالدمبل بيد واحدة | chest | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Hammer_Grip_Incline_DB_Bench_Press` | Hammer Grip Incline DB Bench Press | ضغط دمبل مائل بقبضة متوازية (هامر) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `chest-7` | Cable Crossover | تقاطع كابل للصدر (كيبل كروس عالي/وسط) | chest | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Cable_Crossover) |
| `chest-14` | Low Cable Crossover | تقاطع كابل للصدر من الأسفل (كيبل سفلي) | chest | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `chest-8` | Cable Chest Press | ضغط صدري بالكابل واقفاً | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Cable_Iron_Cross` | Cable Iron Cross | تقاطع كابل حديدي (أيرون كروس) | chest | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Single-Arm_Cable_Crossover` | Single-Arm Cable Crossover | تقاطع كابل للصدر بيد واحدة | chest | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `chest-20` | Butterfly | تفتيح صدر على جهاز الفراشة (Pec Deck) | chest | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `chest-10` | Leverage Chest Press | ضغط صدري على الجهاز (Chest Press Machine) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Leverage_Incline_Chest_Press` | Leverage Incline Chest Press | ضغط صدري مائل على الجهاز | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Leverage_Decline_Chest_Press` | Leverage Decline Chest Press | ضغط صدري مقلوب على الجهاز | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Smith_Machine_Bench_Press` | Smith Machine Bench Press | ضغط صدري مستوٍ على جهاز سميث | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Smith_Machine_Incline_Bench_Press` | Smith Machine Incline Bench Press | ضغط صدري مائل على جهاز سميث | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Smith_Machine_Decline_Press` | Smith Machine Decline Press | ضغط صدري مقلوب على جهاز سميث | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `chest-11` | Dips - Chest Version | متوازي بوزن الجسم للصدر (ميل الجذع للأمام) | chest | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Dips_-_Chest_Version) |
| `chest-3` | Pushups | تمرين الضغط (ضغط أرضي) | chest | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Pushups) |
| `chest-19` | Incline Push-Up | ضغط مائل لأعلى بوزن الجسم (أسهل للمبتدئين) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Decline_Push-Up` | Decline Push-Up | ضغط مائل لأسفل بوزن الجسم (تركيز علوي) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Svend_Press` | Svend Press | ضغط صدر بالأقراص (Svend Press) | chest | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms + shoulders + triceps) |
| `Clock_Push-Up` | Clock Push-Up | ضغط دائري حركي (Clock Push-Up) | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `back-14` | Barbell Deadlift | ديدليفت كلاسيكي بالبار (Deadlift) | back | **Tier 1** | 4 | 4 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Deadlift) |
| `back-4` | Bent Over Barbell Row | تجديف بالبار منحنياً (Bent-Over Row) | back | **Tier 1** | 3 | 4 | تطابق معرّف قاعدة البيانات (db_id: Bent_Over_Barbell_Row) |
| `back-5` | Bent Over Two-Dumbbell Row | تجديف بالدمبلين منحنياً | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `back-13` | One-Arm Dumbbell Row | تجديف بالدمبل بيد واحدة على البنش (منشار) | back | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: One-Arm_Dumbbell_Row) |
| `back-8` | T-Bar Row with Handle | تجديف تي بار بالوزن الحر (T-Bar Row) | back | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: T-Bar_Row_with_Handle) |
| `back-1` | Wide-Grip Lat Pulldown | سحب عالي للظهر بقبضة واسعة (Lat Pulldown) | back | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Wide-Grip_Lat_Pulldown) |
| `back-7` | Close-Grip Front Lat Pulldown | سحب عالي للظهر بقبضة ضيقة V-Bar | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `back-3` | Underhand Cable Pulldowns | سحب عالي بقبضة مقلوبة للمجانص والباي | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `One_Arm_Lat_Pulldown` | One Arm Lat Pulldown | سحب عالي بالكابل بيد واحدة | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `Full_Range-Of-Motion_Lat_Pulldown` | Full Range-Of-Motion Lat Pulldown | سحب عالي بمدى حركي كامل | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `back-6` | Seated Cable Rows | سحب أرضي بالكابل للظهر (Seated Cable Row) | back | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: Seated_Cable_Rows) |
| `Elevated_Cable_Rows` | Elevated Cable Rows | سحب كابل من مستوى مرتفع للظهر | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + traps) |
| `back-11` | Straight-Arm Pulldown | سحب كابل بالذراعين مفرودتين للمجانص | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `back-10` | Pullups | عقلة قبضة واسعة فوقية (Pull-Ups) | back | **Tier 1** | 2 | 5 | تطابق معرّف قاعدة البيانات (db_id: Pullups) |
| `Wide-Grip_Rear_Pull-Up` | Wide-Grip Rear Pull-Up | عقلة خلفية واسعة | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `back-17` | Chin-Up | عقلة قبضة معكوسة للباي واللاتس (Chin-Ups) | back | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: Chin-Up) |
| `back-16` | Inverted Row | عقلة أسترالية مقلوبة بوزن الجسم | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (lats) |
| `Rope_Climb` | Rope Climb | تسلق الحبل لتقوية الظهر والقبضة | back | **Tier 3** | 1 | 9 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + forearms + lats + shoulders) |
| `back-20` | Barbell Shrug | هز أكتاف بالبار للترابيس (Barbell Shrug) | back | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Shrug) |
| `Dumbbell_Shrug` | Dumbbell Shrug | هز أكتاف بالدمبل للترابيس (Dumbbell Shrug) | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Cable_Shrugs` | Cable Shrugs | شراغز بالكابل للترابيس | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Middle_Back_Shrug` | Middle Back Shrug | شراغز لمنتصف الظهر على البنش | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `back-9` | Hyperextensions (Back Extensions) | تمديد الظهر وأسفل الظهر على الجهاز (Hyper) | back | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Hyperextensions_Back_Extensions) |
| `Good_Morning` | Good Morning | صباح الخير بالبار لأسفل الظهر والخلفيات | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + glutes + lats) |
| `Stiff_Leg_Barbell_Good_Morning` | Stiff Leg Barbell Good Morning | جود مورنينج بالبار بركبتين ثابتتين | back | **Tier 3** | 1 | 7 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `Smith_Machine_Bent_Over_Row` | Smith Machine Bent Over Row | تجديف منحنياً على جهاز سميث | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `back-18` | Leverage High Row | سحب عالي على جهاز الرافعة للمجانص | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (lats) |
| `back-19` | Shotgun Row | تجديف بالكابل بيد واحدة (شوت جن) | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `Bent_Over_Two-Arm_Long_Bar_Row` | Bent Over Two-Arm Long Bar Row | تجديف بالبار الطويل منحنياً | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `Sumo_Deadlift` | Sumo Deadlift | ديدليفت سومو بوقفة واسعة (Sumo Deadlift) | legs | **Tier 3** | 4 | 11 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (adductors + forearms + glutes + lats + lats + quadriceps + traps) |
| `Trap_Bar_Deadlift` | Trap Bar Deadlift | ديدليفت بالبار السداسي (Trap Bar) | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `Deadlift_with_Bands` | Deadlift with Bands | ديدليفت بالبار مع أحبال مقاومة | back | **Tier 3** | 1 | 17 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms + glutes + hamstrings + lats + quadriceps + traps) |
| `back-15` | Romanian Deadlift from Deficit | ديدليفت روماني من منصة مرتفعة | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms + glutes + lats + traps) |
| `Kettlebell_One-Legged_Deadlift` | Kettlebell One-Legged Deadlift | ديدليفت بالكتلبل بساق واحدة | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + lats) |
| `core-19` | Superman | تمرين سوبرمان لتقوية أسفل الظهر بوزن الجسم | back | **Tier 3** | 1 | 7 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `shoulder-12` | Face Pull | سحب الحبل للوجه والكتف الخلفي (Face Pull) | shoulders | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Face_Pull) |
| `Side_Laterals_to_Front_Raise` | Side Laterals to Front Raise | دمج رفرفة جانبية وأمامية | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (traps) |
| `Upright_Row_-_With_Bands` | Upright Row - With Bands | تجديف عمودي بحبل المقاومة | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `Standing_Cable_Lift` | Standing Cable Lift | رفع كابل قطري للجذع والظهر | core | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `leg-1` | Barbell Full Squat | سكوات خلفي كامل بالبار (Back Squat) | legs | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Full_Squat) |
| `leg-11` | Front Barbell Squat | سكوات أمامي بالبار (Front Squat) | legs | **Tier 1** | 3 | 3 | تطابق معرّف قاعدة البيانات (db_id: Front_Barbell_Squat) |
| `leg-14` | Box Squat | سكوات بالبار على الصندوق (Box Squat) | legs | **Tier 3** | 4 | 12 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (adductors + calves + glutes + hamstrings + lats) |
| `Narrow_Stance_Squats` | Narrow Stance Squats | سكوات بالبار بوقفة ضيقة للتركيز على الفخذ | legs | **Tier 3** | 4 | 11 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings + lats) |
| `Wide_Stance_Barbell_Squat` | Wide Stance Barbell Squat | سكوات بالبار بوقفة واسعة للضامة والجلوتس | legs | **Tier 3** | 4 | 11 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings + lats) |
| `Overhead_Squat` | Overhead Squat | سكوات والبار مرفوع فوق الرأس | legs | **Tier 3** | 4 | 20 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + calves + glutes + hamstrings + lats + shoulders + triceps) |
| `leg-12` | Hack Squat | هاك سكوات على الجهاز (Hack Squat) | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `leg-8` | Barbell Lunge | طعنات بالبار للأرجل والجلوتس (Barbell Lunges) | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `Barbell_Walking_Lunge` | Barbell Walking Lunge | طعنات بالمشي بالبار | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `Barbell_Side_Split_Squat` | Barbell Side Split Squat | سكوات جانبي بالبار للفخذ الداخلي | legs | **Tier 3** | 4 | 8 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + hamstrings + lats) |
| `leg-2` | Dumbbell Squat | سكوات بالدمبل | legs | **Tier 3** | 4 | 11 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings + lats) |
| `Goblet_Squat` | Goblet Squat | جوبلت سكوات بالدمبل (Goblet Squat) | legs | **Tier 3** | 4 | 13 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings + shoulders) |
| `leg-7` | Dumbbell Lunges | طعنات بالدمبلين (Dumbbell Lunges) | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `leg-3` | Split Squat with Dumbbells | سبليت سكوات ثابت بالدمبل | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `leg-13` | Dumbbell Step Ups | صعود الدرج بالدمبل (Step-Ups) | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `Step-up_with_Knee_Raise` | Step-up with Knee Raise | صعود الدرج مع رفع الركبة | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (hamstrings + quadriceps) |
| `leg-16` | Plie Dumbbell Squat | سومو سكوات بالدمبل (Sumo / Plie Squat) | legs | **Tier 3** | 4 | 13 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + calves + glutes + hamstrings) |
| `leg-4` | Leg Press | ضغط الأرجل على جهاز المكبس (Leg Press) | legs | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Leg_Press) |
| `leg-18` | Leg Extensions | فرد الساقين على الجهاز (Leg Extension للأماميات) | legs | **Tier 1** | 4 | 0 | تطابق معرّف قاعدة البيانات (db_id: Leg_Extensions) |
| `leg-5` | Lying Leg Curls | ثني الساقين مستلقياً على الجهاز (خلفيات الفخذ) | legs | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Lying_Leg_Curls) |
| `leg-17` | Seated Leg Curl | ثني الساقين جالساً على الجهاز (خلفيات الفخذ) | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Standing_Leg_Curl` | Standing Leg Curl | ثني الساق واقفاً بساق واحدة | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `leg-6` | Romanian Deadlift | ديدليفت روماني بالبار (RDL للخلفيات والألوية) | legs | **Tier 1** | 4 | 2 | تطابق معرّف قاعدة البيانات (db_id: Romanian_Deadlift) |
| `leg-15` | Stiff-Legged Barbell Deadlift | ديدليفت بالبار بأرجل مستقيمة | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + lats) |
| `Stiff-Legged_Dumbbell_Deadlift` | Stiff-Legged Dumbbell Deadlift | ديدليفت بالدمبل بأرجل مستقيمة للخلفيات | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + lats) |
| `leg-20` | Barbell Hip Thrust | دفع الحوض بالبار للألوية (Barbell Hip Thrust) | legs | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Hip_Thrust) |
| `leg-21` | Barbell Glute Bridge | جسر الألوية بالبار على الأرض (Glute Bridge) | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + hamstrings) |
| `Single_Leg_Glute_Bridge` | Single Leg Glute Bridge | جسر الألوية بساق واحدة بوزن الجسم | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (hamstrings) |
| `Glute_Ham_Raise` | Glute Ham Raise | رفع الجذع بالخلفيات والألوية (GHD) | legs | **Tier 3** | 4 | 6 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes) |
| `Glute_Kickback` | Glute Kickback | ركل خلفي بالكابل أو الجهاز للألوية (Kickback) | legs | **Tier 3** | 4 | 4 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (hamstrings) |
| `Thigh_Abductor` | Thigh Abductor | فتح الفخذ على الجهاز (Abductor للألوية والخارجيات) | legs | **Tier 3** | 4 | 3 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes) |
| `Thigh_Adductor` | Thigh Adductor | ضم الفخذ على الجهاز (Adductor للعضلات الضامة) | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `leg-9` | Standing Calf Raises | رفع السمانة واقفاً بالوزن (Standing Calf Raise) | legs | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Standing_Calf_Raises) |
| `leg-10` | Seated Calf Raise | رفع السمانة جالساً على الجهاز (Seated Calf Raise) | legs | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Seated_Calf_Raise) |
| `Calf_Press_On_The_Leg_Press_Machine` | Calf Press On The Leg Press Machine | رفع السمانة على جهاز مكبس الأرجل | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Smith_Machine_Calf_Raise` | Smith Machine Calf Raise | رفع السمانة واقفاً على جهاز سميث | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Rocking_Standing_Calf_Raise` | Rocking Standing Calf Raise | رفع السمانة المتأرجح | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Donkey_Calf_Raises` | Donkey Calf Raises | رفع السمانة بوضعية الدونكي كالف | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Smith_Machine_Squat` | Smith Machine Squat | سكوات على جهاز سميث | legs | **Tier 3** | 4 | 11 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings + lats) |
| `Smith_Single-Leg_Split_Squat` | Smith Single-Leg Split Squat | سبليت سكوات على جهاز سميث | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `leg-19` | Bodyweight Squat | سكوات هوائي بوزن الجسم | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `Bodyweight_Walking_Lunge` | Bodyweight Walking Lunge | طعنات بالمشي بوزن الجسم | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (calves + glutes + hamstrings) |
| `Scissors_Jump` | Scissors Jump | قفز تبادلي بالمقص (انفجاري للأرجل) | legs | **Tier 3** | 4 | 7 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (glutes + hamstrings) |
| `Side_Leg_Raises` | Side Leg Raises | رفع الساق جانباً بوزن الجسم | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `One-Arm_Side_Deadlift` | One-Arm Side Deadlift | ديدليفت جانبي بيد واحدة | legs | **Tier 3** | 4 | 17 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + calves + glutes + hamstrings + lats + traps) |
| `Band_Hip_Adductions` | Band Hip Adductions | ضم الفخذ بحبل المقاومة | legs | **Tier 3** | 4 | 0 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Reverse_Band_Box_Squat` | Reverse Band Box Squat | سكوات صندوق بأحبال مقاومة معكوسة | legs | **Tier 3** | 4 | 16 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abductors + adductors + calves + forearms + glutes + hamstrings + lats) |
| `Calf-Machine_Shoulder_Shrug` | Calf-Machine Shoulder Shrug | شراغز على جهاز السمانة | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Knee_Tuck_Jump` | Knee Tuck Jump | قفز ضم الركبتين للياقة الأرجل | legs | **Tier 3** | 4 | 8 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (abductors + adductors + calves + glutes + quadriceps) |
| `shoulder-1` | Standing Military Press | ضغط كتف عسكري بالبار واقفاً (Overhead Press) | shoulders | **Tier 1** | 1 | 4 | تطابق معرّف قاعدة البيانات (db_id: Standing_Military_Press) |
| `shoulder-11` | Seated Barbell Military Press | ضغط كتف بالبار جالساً (Seated Barbell Press) | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `shoulder-15` | Dumbbell Shoulder Press | ضغط كتف بالدمبل جالساً (Dumbbell Shoulder Press) | shoulders | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Shoulder_Press) |
| `Seated_Dumbbell_Press` | Seated Dumbbell Press | ضغط كتف بالدمبل على مقعد مستقيم | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `shoulder-6` | Arnold Dumbbell Press | ضغط أرنولد الشهير للكتف بالدمبل (Arnold Press) | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `shoulder-16` | Leverage Shoulder Press | ضغط كتف على جهاز الرافعة | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `shoulder-19` | Clean and Press | كلين آند برس بالبار (قوة انفجارية للكتف والجسم) | shoulders | **Tier 3** | 3 | 24 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + calves + glutes + hamstrings + lats + lats + quadriceps + traps + triceps) |
| `Push_Press` | Push Press | بوش برس بالبار مع مساعدة الساقين | shoulders | **Tier 3** | 3 | 7 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (quadriceps + triceps) |
| `shoulder-3` | Side Lateral Raise | رفرفة كتف جانبي بالدمبل (Lateral Raise) | shoulders | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Side_Lateral_Raise) |
| `shoulder-9` | Seated Side Lateral Raise | رفرفة كتف جانبي بالدمبل جالساً (عزل تام) | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `shoulder-14` | One-Arm Side Laterals | رفرفة جانبي بالدمبل بيد واحدة | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `shoulder-5` | Cable Seated Lateral Raise | رفرفة جانبي بالكابل جالساً | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + traps) |
| `shoulder-4` | Front Dumbbell Raise | رفع كتف أمامي بالدمبل (Front Raise) | shoulders | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Front_Dumbbell_Raise) |
| `shoulder-13` | Front Cable Raise | رفع كتف أمامي بالكابل | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Front_Two-Dumbbell_Raise` | Front Two-Dumbbell Raise | رفع أمامي بكلتا اليدين بالدمبل | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Standing_Front_Barbell_Raise_Over_Head` | Standing Front Barbell Raise Over Head | رفع بار أمامي حتى أعلى الرأس | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `back-12` | Reverse Flyes | رفرفة كتف خلفي بالدمبل مستلقياً على بنش مائل | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `shoulder-7` | Bent Over Dumbbell Rear Delt Raise With Head On Bench | رفرفة خلفية مع تثبيت الرأس على البنش | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Lying_Rear_Delt_Raise` | Lying Rear Delt Raise | رفرفة كتف خلفي مستلقياً على الجانب | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Cable_Rear_Delt_Fly` | Cable Rear Delt Fly | رفرفة كتف خلفي بالكابل المتقاطع | shoulders | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Cable_Rear_Delt_Fly) |
| `shoulder-18` | Barbell Rear Delt Row | تجديف بالبار عريض للكتف الخلفي | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + lats) |
| `Cable_Rope_Rear-Delt_Rows` | Cable Rope Rear-Delt Rows | سحب حبل الكابل للكتف الخلفي | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `shoulder-17` | Upright Barbell Row | تجديف عمودي بالبار للأكتاف والترابيس | shoulders | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Upright_Barbell_Row) |
| `Upright_Cable_Row` | Upright Cable Row | تجديف عمودي بالكابل للأكتاف | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `Dumbbell_One-Arm_Upright_Row` | Dumbbell One-Arm Upright Row | تجديف عمودي بالدمبل بيد واحدة | shoulders | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + traps) |
| `shoulder-10` | Dumbbell Scaption | رفع دمبل بزاوية لوح الكتف (Scaption) | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (traps) |
| `Dumbbell_Raise` | Dumbbell Raise | رفع دمبل مركب للأكتاف | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps) |
| `Alternating_Deltoid_Raise` | Alternating Deltoid Raise | رفع تبادلي بالدمبل للدالية | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Car_Drivers` | Car Drivers | تمرين مقود السيارة بالقرص للأكتاف (Car Drivers) | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Cuban_Press` | Cuban Press | ضغط كوبي بالدمبل لتقوية الكفة المدورة | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (traps) |
| `Iron_Cross` | Iron Cross | الصليب الحديدي بالدمبل للكتفين | shoulders | **Tier 3** | 3 | 18 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + glutes + hamstrings + lats + quadriceps + traps) |
| `Standing_Low-Pulley_Deltoid_Raise` | Standing Low-Pulley Deltoid Raise | رفع دالية سفلي بالكابل | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `shoulder-20` | Handstand Push-Ups | ضغط الوقوف على اليدين للكتفين (Handstand) | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `Kettlebell_Thruster` | Kettlebell Thruster | ثراستر بالكتلبل (سكوات مع ضغط كتف) | shoulders | **Tier 3** | 3 | 7 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (quadriceps + triceps) |
| `External_Rotation_with_Band` | External Rotation with Band | دوران خارجي بحبل المقاومة للكفة المدورة | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Side_Wrist_Pull` | Side Wrist Pull | سحب جانبي للرسغ والكتف | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms + lats) |
| `arm-1` | Barbell Curl | بايسبس كيرل بالبار مستقيماً (Barbell Curl) | arms | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Barbell_Curl) |
| `EZ-Bar_Curl` | EZ-Bar Curl | بايسبس كيرل ببار الزجزاج (EZ-Bar Curl) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Close-Grip_Standing_Barbell_Curl` | Close-Grip Standing Barbell Curl | بايسبس كيرل بالبار قبضة ضيقة للرأس الخارجي | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Wide-Grip_Standing_Barbell_Curl` | Wide-Grip Standing Barbell Curl | بايسبس كيرل بالبار قبضة واسعة للرأس الداخلي | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-2` | Dumbbell Bicep Curl | بايسبس كيرل بالدمبل بالتناوب | arms | **Tier 1** | 2 | 3 | تطابق معرّف قاعدة البيانات (db_id: Dumbbell_Bicep_Curl) |
| `arm-5` | Incline Dumbbell Curl | بايسبس بالدمبل على بنش مائل (استطالة عظمى) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Incline_Inner_Biceps_Curl` | Incline Inner Biceps Curl | بايسبس مائل موجه للرأس الداخلي | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-3` | Hammer Curls | بايسبس مطرقة بالدمبل (Hammer Curls للساعد والرأس الطويل) | arms | **Tier 1** | 2 | 2 | تطابق معرّف قاعدة البيانات (db_id: Hammer_Curls) |
| `Cross_Body_Hammer_Curl` | Cross Body Hammer Curl | بايسبس مطرقة متقاطع على الصدر (Cross Body) | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Preacher_Curl` | Preacher Curl | بايسبس ارتكاز على بنش لاري سكوت (Preacher Curl) | arms | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Preacher_Curl) |
| `arm-4` | Concentration Curls | بايسبس تركيز بالدمبل جالساً (Concentration Curl) | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Spider_Curl` | Spider Curl | سبايدر كيرل بالبار على بنش مائل (Spider Curl) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Zottman_Curl` | Zottman Curl | زوتمان كيرل بالدمبل للبايسبس والساعد (Zottman Curl) | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Seated_Close-Grip_Concentration_Barbell_Curl` | Seated Close-Grip Concentration Barbell Curl | بايسبس تركيز بالبار قبضة ضيقة | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-6` | Cable Preacher Curl | بايسبس ارتكاز بالكابل على البنش | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `arm-7` | Cable Hammer Curls - Rope Attachment | بايسبس مطرقة بحبل الكابل (Cable Rope Hammer) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-8` | Overhead Cable Curl | بايسبس كابل علوي مزدوج (Double Biceps Cable) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-9` | Machine Bicep Curl | بايسبس كيرل على الجهاز | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-10` | Reverse Barbell Curl | بايسبس مقلوب بالبار لتقوية الساعد والباي | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Reverse_Cable_Curl` | Reverse Cable Curl | بايسبس مقلوب بالكابل للساعد | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `arm-11` | Close-Grip Barbell Bench Press | بنش برس قبضة ضيقة للترايسبس (Close-Grip Bench) | arms | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders) |
| `JM_Press` | JM Press | تمرين جي إم برس للكتلة الهائلة للترايسبس (JM Press) | arms | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders) |
| `arm-14` | Lying Triceps Press | كسر الجمجمة للترايسبس ببار EZ (Skull Crushers) | arms | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Lying_Triceps_Press) |
| `Decline_EZ_Bar_Triceps_Extension` | Decline EZ Bar Triceps Extension | تمديد ترايسبس على بنش مقلوب ببار EZ | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Incline_Barbell_Triceps_Extension` | Incline Barbell Triceps Extension | تمديد ترايسبس بالبار على بنش مائل | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Decline_Close-Grip_Bench_To_Skull_Crusher` | Decline Close-Grip Bench To Skull Crusher | دمج البنش الضيق وكسر الجمجمة للترايسبس | arms | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders) |
| `arm-15` | Standing Overhead Barbell Triceps Extension | تمديد ترايسبس بالبار فوق الرأس واقفاً | arms | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Standing_Overhead_Barbell_Triceps_Extension) |
| `arm-17` | Seated Triceps Press | تمديد ترايسبس بالدمبل بكلتا اليدين جالساً | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Standing_Dumbbell_Triceps_Extension` | Standing Dumbbell Triceps Extension | تمديد ترايسبس بالدمبل فوق الرأس واقفاً | arms | **Tier 1** | 1 | 2 | تطابق معرّف قاعدة البيانات (db_id: Standing_Dumbbell_Triceps_Extension) |
| `arm-16` | Tricep Dumbbell Kickback | كيك باك للترايسبس بالدمبل (Dumbbell Kickback) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Tate_Press` | Tate Press | تيت برس بالدمبل على البنش للترايسبس (Tate Press) | arms | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders) |
| `arm-12` | Triceps Pushdown | ترايسبس بوش داون بالكابل بالمسطرة (Straight Bar) | arms | **Tier 1** | 2 | 1 | تطابق معرّف قاعدة البيانات (db_id: Triceps_Pushdown) |
| `arm-13` | Triceps Pushdown - Rope Attachment | ترايسبس بوش داون بحبل الكابل (Rope Pushdown) | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Triceps_Pushdown_-_V-Bar_Attachment` | Triceps Pushdown - V-Bar Attachment | ترايسبس بوش داون بمقبض V-Bar | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Reverse_Grip_Triceps_Pushdown` | Reverse Grip Triceps Pushdown | ترايسبس بوش داون بقبضة مقلوبة | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Cable_One_Arm_Tricep_Extension` | Cable One Arm Tricep Extension | تمديد ترايسبس بالكابل بيد واحدة | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Cable_Lying_Triceps_Extension` | Cable Lying Triceps Extension | تمديد ترايسبس مستلقياً بالكابل | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-19` | Dips - Triceps Version | متوازي بوزن الجسم للترايسبس (الجسم عمودي) | arms | **Tier 1** | 2 | 2 | تطابق القاعدة القياسية بعد إزالة محدد القبضة غير المتغير (dips) |
| `arm-18` | Bench Dips | غطس ترايسبس على حافة البنش (Bench Dips) | arms | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders) |
| `Seated_Palm-Up_Barbell_Wrist_Curl` | Seated Palm-Up Barbell Wrist Curl | ثني المعصم بالبار والراحة لأعلى للساعد | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench` | Palms-Down Dumbbell Wrist Curl Over A Bench | ثني المعصم بالدمبل والراحة لأسفل | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench` | Palms-Up Dumbbell Wrist Curl Over A Bench | ثني المعصم بالدمبل والراحة لأعلى | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Farmers_Walk` | Farmer's Walk | مشية المزارع بالأوزان الثقيلة لقوة القبضة والساعد | arms | **Tier 3** | 3 | 18 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + glutes + hamstrings + lats + quadriceps + traps) |
| `Wrist_Roller` | Wrist Roller | بكرة الرسغ بالأوزان لضخامة الساعد | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `Plate_Pinch` | Plate Pinch | عصر وحمل الأقراص بالأصابع لقوة القبضة | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Cable_Wrist_Curl` | Cable Wrist Curl | ثني المعصم بالكابل للساعد | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-1` | Plank | بلانك ثبات للجذع والكور (Plank) | core | **Tier 1** | 3 | 2 | تطابق معرّف قاعدة البيانات (db_id: Plank) |
| `core-5` | Push Up to Side Plank | ضغط أرضي مع دوران لبلانك جانبي | chest | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + shoulders + triceps) |
| `core-2` | Crunches | كرنش أرضي كلاسيكي لعضلات البطن العلوية (Crunches) | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-18` | Decline Crunch | كرنش على بنش مائل لأسفل (Decline Crunch) | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-12` | Reverse Crunch | كرنش معكوس برفع الحوض للبطن السفلية (Reverse Crunch) | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-10` | Cross-Body Crunch | كرنش متقاطع لعضلات البطن والجوانب | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Tuck_Crunch` | Tuck Crunch | كرنش ضم الركبتين للبطن | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-14` | Exercise Ball Crunch | كرنش على الكرة السويسرية لمدى حركي كامل | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-20` | Cable Crunch | كرنش بالكابل مع الركوع للبطن (Cable Kneeling Crunch) | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Kneeling_Cable_Triceps_Extension` | Kneeling Cable Triceps Extension | كرنش كابل بحبل المقاومة على الركبتين | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-17` | Hanging Leg Raise | رفع الأرجل معلقاً على العقلة للبطن السفلية | core | **Tier 1** | 1 | 3 | تطابق معرّف قاعدة البيانات (db_id: Hanging_Leg_Raise) |
| `core-4` | Flat Bench Lying Leg Raise | رفع الأرجل مستلقياً على البنش للبطن السفلية | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Seated_Flat_Bench_Leg_Pull-In` | Seated Flat Bench Leg Pull-In | سحب الركبتين للصدر جالساً على البنش | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Leg_Pull-In` | Leg Pull-In | ضم الساقين للبطن مستلقياً | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-16` | Ab Roller | تمرين عجلة البطن (Ab Wheel Rollout) | core | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `core-7` | Russian Twist | تويست روسي بالوزن للخصر والخواصر (Russian Twist) | core | **Tier 3** | 3 | 1 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (lats) |
| `core-6` | Air Bike | تمرين الدراجة الهوائية للبطن | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-8` | Mountain Climbers | متسلق الجبال السريع لشد البطن وحرق الدهون | legs | **Tier 3** | 4 | 10 | توسيع استهداف المجموعة العضلية (legs) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + hamstrings + shoulders) |
| `core-13` | Dead Bug | تمرين الحشرة الميتة (Dead Bug) لثبات الكور وأسفل الظهر | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `core-15` | Standing Cable Wood Chop | تقطيع الخشب بالكابل لخصر وبطن قوية (Woodchopper) | core | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `Pallof_Press` | Pallof Press | بالوف برس بالكابل لمقاومة الدوران وثبات الجذع | core | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders + triceps) |
| `Plate_Twist` | Plate Twist | دوران بالقرص للخصر والخواصر | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Medicine_Ball_Full_Twist` | Medicine Ball Full Twist | تويست كامل بالكرة الطبية للبطن | core | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders) |
| `Dumbbell_Side_Bend` | Dumbbell Side Bend | انحناء جانبي بالدمبل لعضلات الخواصر | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Bottoms_Up` | Bottoms Up | رفع الحوض السفلي للبطن (Bottoms Up) | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Alternating_Floor_Press` | Alternating Floor Press | ضغط صدري أرضي بالدمبل بالتناوب | chest | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + shoulders + triceps) |
| `Bench_Press_-_With_Bands` | Bench Press - With Bands | ضغط صدري بالبار مع أحبال المقاومة | chest | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (shoulders + triceps) |
| `Bent-Arm_Dumbbell_Pullover` | Bent-Arm Dumbbell Pullover | بولوفر بالدمبل بذراعين منحنيتين للصدر | chest | **Tier 3** | 3 | 7 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + shoulders + triceps) |
| `Bodyweight_Flyes` | Bodyweight Flyes | تفتيح صدر بوزن الجسم بالأرض | chest | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (chest) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + shoulders + triceps) |
| `Barbell_Shrug_Behind_The_Back` | Barbell Shrug Behind The Back | شراغز بالبار من خلف الظهر للترابيس | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms + lats) |
| `Bent_Over_One-Arm_Long_Bar_Row` | Bent Over One-Arm Long Bar Row | تجديف بالبار بيد واحدة للظهر | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + lats + traps) |
| `Bent_Over_Two-Dumbbell_Row_With_Palms_In` | Bent Over Two-Dumbbell Row With Palms In | تجديف بالدمبلين بقبضة متوازية للظهر | back | **Tier 3** | 1 | 3 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `Cable_Incline_Pushdown` | Cable Incline Pushdown | سحب كابل مائل للأسفل للظهر | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Band_Assisted_Pull-Up` | Band Assisted Pull-Up | عقلة بمساعدة حبل المقاومة | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + forearms + lats) |
| `Rocky_Pull-Ups_Pulldowns` | Rocky Pull-Ups/Pulldowns | سحب عالي وعقلة روكي للظهر | back | **Tier 3** | 1 | 6 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats + shoulders) |
| `Scapular_Pull-Up` | Scapular Pull-Up | عقلة تثبيت لوحي الكتف | back | **Tier 3** | 1 | 0 | توسيع استهداف المجموعة العضلية (back) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + lats) |
| `Alternating_Cable_Shoulder_Press` | Alternating Cable Shoulder Press | ضغط كتف بالكابل بالتناوب | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `Alternating_Kettlebell_Press` | Alternating Kettlebell Press | ضغط كتف بالكتلبل بالتناوب | shoulders | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (triceps) |
| `Band_Pull_Apart` | Band Pull Apart | سحب الحبل للخارج لتقوية لوحي الكتف والدالية الخلفية | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + traps) |
| `Barbell_Shoulder_Press` | Barbell Shoulder Press | ضغط كتف بالبار | shoulders | **Tier 3** | 3 | 6 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + triceps) |
| `Bent_Over_Low-Pulley_Side_Lateral` | Bent Over Low-Pulley Side Lateral | رفرفة جانبية بالكابل المنخفض منحنياً | shoulders | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + lats + traps) |
| `Dumbbell_Lying_One-Arm_Rear_Lateral_Raise` | Dumbbell Lying One-Arm Rear Lateral Raise | رفرفة كتف خلفي مستلقياً على البنش | shoulders | **Tier 3** | 3 | 1 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (lats) |
| `Dumbbell_Lying_Rear_Lateral_Raise` | Dumbbell Lying Rear Lateral Raise | رفرفة خلفية بالدمبلين مستلقياً | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Lateral_Raise_-_With_Bands` | Lateral Raise - With Bands | رفرفة كتف جانبي بأحبال المقاومة | shoulders | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (shoulders) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Alternate_Hammer_Curl` | Alternate Hammer Curl | بايسبس مطرقة بالدمبل بالتناوب | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Alternate_Incline_Dumbbell_Curl` | Alternate Incline Dumbbell Curl | بايسبس مائل بالدمبل بالتناوب | arms | **Tier 3** | 3 | 3 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (forearms) |
| `Band_Skull_Crusher` | Band Skull Crusher | كسر جمجمة بحبل المقاومة للترايسبس | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Barbell_Curls_Lying_Against_An_Incline` | Barbell Curls Lying Against An Incline | بايسبس كيرل بالبار على بنش مائل | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Palms-Down_Wrist_Curl_Over_A_Bench` | Palms-Down Wrist Curl Over A Bench | ثني المعصم والراحة لأسفل على البنش | arms | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `arm-20` | Close-Grip Push-Up off of a Dumbbell | ضغط قبضة ضيقة على الدمبل للترايسبس | arms | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (arms) إلى الرؤوس التشريحية مع العضلات الثانوية (abdominals + chest + shoulders) |
| `3_4_Sit-Up` | 3/4 Sit-Up | تمرين 3/4 سيت أب لعضلات البطن | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Ab_Crunch_Machine` | Ab Crunch Machine | كرنش على جهاز البطن بالأوزان | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Alternate_Heel_Touchers` | Alternate Heel Touchers | لمس الكعبين بالتناوب لعضلات الخصر والبطن | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Barbell_Ab_Rollout_-_On_Knees` | Barbell Ab Rollout - On Knees | فرد عجلة البطن بالبار على الركبتين | core | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (lats + shoulders) |
| `Cocoons` | Cocoons | تمرين الشرانق لشد كامل البطن | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Gorilla_Chin_Crunch` | Gorilla Chin/Crunch | عقلة جوريلا مع كرنش للبطن | core | **Tier 3** | 3 | 4 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (biceps + lats) |
| `core-9` | Jackknife Sit-Up | تمرين جاك نايف للبطن والكور | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Scissor_Kick` | Scissor Kick | ركلات المقص للأرجل للبطن السفلية | core | **Tier 3** | 3 | 0 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (بدون) |
| `Spider_Crawl` | Spider Crawl | زحف العنكبوت للكور واللياقة | core | **Tier 3** | 3 | 9 | توسيع استهداف المجموعة العضلية (core) إلى الرؤوس التشريحية مع العضلات الثانوية (chest + shoulders + triceps) |
