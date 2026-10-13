# وثيقة السياق الشامل لمشروع «مجانص» (Maganis Master Context & Architecture)

> **الغرض من هذا الملف:**  
> تقديم مرجع شامل، دقيق، وتفصيلي بنسبة 100% لكافة جوانب تطبيق **مجانص (Maganis)** — هندسته المعمارية، قواعد بياناته، نماذج بياناته (TypeScript Types)، محركاته الحسابية، مفاتيح التخزين، الميزات المنجزة، والمهام المستقبلية.  
> **يمكن وضع هذا الملف في بداية أي جلسة محادثة جديدة لتزويد الذكاء الاصطناعي بالسياق الكامل ومنع أي هلوسة أو افتراضات خاطئة.**

---

## 1. نظرة عامة وهوية التطبيق (App Identity & Vision)

- **اسم التطبيق:** مجانص — Maganis (د. مجانص: مدربك وخبير التغذية على جهازك).
- **الجمهور المستهدف واللغة:** تطبيق ناطق بالعربية مصمم بالكامل من اليمين لليسار (`dir="rtl"`) مع خط عربي عصري ومصطلحات تجمع بين الروح التحفيزية المصرية الفكاهية والأسس العلمية والطبية الصارمة.
- **الفلسفة الأساسية (Offline-First Zero-Backend):**
  - **لا يوجد خادم (Zero Backend / Serverless):** لا توجد قواعد بيانات سحابية، ولا تسجيل دخول بحسابات أو كلمات مرور، ولا أي تتبع لبيانات المستخدم.
  - **الخصوصية المطلقة:** 100% من بيانات المستخدم والتمارين والوجبات مخزنة محلياً على جهاز المستخدم حصراً (عبر `localStorage` و `IndexedDB` و `Live File Sync`).
  - **قابلية التثبيت (PWA):** التطبيق مزود بـ `manifest.webmanifest` و `sw.js` ليعمل كتطبيق هاتف مستقل بدون إنترنت.
- **الحزمة التقنية الأساسية (Tech Stack):**
  - **Frontend Framework:** React 19 + TypeScript (Strict Mode).
  - **Build Tooling:** Vite 7 (دعم فوري لـ HMR وبناء حزم الإنتاج السريعة).
  - **Styling:** Vanilla CSS متقدم مع CSS Custom Properties (Tokens) ودعم كامل للوضعين الداكن والفاتح (`data-theme="dark" | "light"`).
  - **Testing & Quality Gates:** Vitest 3 + Testing Library (jsdom) + ESLint 9 + Prettier 3 + TypeScript `tsc -b`.

---

## 2. الهيكل التنظيمي للمشروع ومسارات الملفات (Project Structure)

```text
maganis-project/
├── public/
│   ├── branding/                  # الأصول البصرية والشعارات
│   │   ├── maganis-badge.png      # الشعار الرسمي عالي الدقة (الطبيب والبار والحديد والنار)
│   │   ├── maganis-mascot-inner.png # أيقونة الهيدر العلوي
│   │   ├── maganis-welcome-transparent.png # صورة د. مجانص لشاشة الترحيب
│   │   ├── app-icon.png           # أيقونة PWA الأساسية
│   │   └── app-icon-maskable.png  # أيقونة PWA التكيفية للهواتف
│   ├── exercises/                 # صور وأصول التمارين
│   │   └── exerciseMediaMap.json  # ربط معرفات التمارين بالصور
│   ├── manifest.webmanifest       # إعدادات تثبيت تطبيق الويب التقدمي
│   └── sw.js                      # Service Worker للعمل أوفلاين
├── src/
│   ├── App.tsx                    # المكون الجذري، الهيكل العام، التبويبات، والمودالات
│   ├── main.tsx                   # نقطة الدخول وربط React مع DOM
│   ├── config/
│   │   ├── appConfig.ts           # إعدادات البيئة المصادق عليها
│   │   └── appConfig.test.ts
│   ├── lib/
│   │   ├── storage.ts             # مغلف تخزين localStorage ذو البادئة الآمنة (Namespaced)
│   │   ├── indexedStorage.ts      # مغلف تخزين IndexedDB للبيانات الكبيرة
│   │   ├── liveFileSync.ts        # المزامنة الحية مع ملفات الجهاز (File System Access API)
│   │   ├── sanitizer.ts           # تنظيف وحماية المدخلات النصية
│   │   └── dateUtils.ts           # دوال التواريخ والأيام العربية
│   ├── utils/
│   │   ├── assetUrl.ts            # معالجة الروابط لتعمل محلياً وعلى GitHub Pages (/maganis-app/)
│   │   └── navigationHistory.ts   # إدارة سجل الرجوع بالهاتف (Hardware Back & Gestures)
│   ├── styles/
│   │   └── app.css                # نظام التصميم الشامل، التوكنز، الأنماط، وDark Mode
│   └── modules/
│       ├── shared/
│       │   └── types.ts           # الأنواع المركزية للتمارين، الأقسام، والمستخدم
│       ├── onboarding/            # استمارة البداية (5 خطوات) والملف الشخصي
│       │   ├── OnboardingWizard.tsx # معالج إعداد البيانات والحسابات الأولية
│       │   ├── profileStore.ts    # إدارة وحفظ وقراءة بيانات الملف الشخصي
│       │   ├── validate.ts        # دوال نقية للتحقق من المدخلات برسائل عربية
│       │   └── types.ts           # أنواع بيانات المستخدم والأهداف
│       ├── dashboard/             # لوحة التحكم الرئيسية
│       │   └── Dashboard.tsx      # ملخص اليوم، كارت المدرب، التمارين القادمة، واختصارات سريعة
│       ├── workout/               # نظام التدريب والجداول والتشريح العضلي
│       │   ├── WeeklyPlanView.tsx # عرض وتعديل جدول التمارين بالأقسام المنسدلة
│       │   ├── exercises.ts       # قاعدة بيانات التمارين الأساسية الشاملة
│       │   ├── exercise_muscles.json # خريطة العضلات المستهدفة لكل تمرين
│       │   ├── muscleAtlasData.ts # إحداثيات ومسارات SVG للـ 48 رأساً عضلياً
│       │   ├── AnatomyMuscleMap.tsx # الخريطة التشريحية التفاعلية للعضلات
│       │   ├── ActiveWorkoutSession.tsx # جلسة التمرين الحية مع مؤقت الراحة والعدادات
│       │   ├── ExerciseLibraryModal.tsx # مكتبة البحث في التمارين والفلترة
│       │   ├── ExercisePickerModal.tsx  # نافذة اختيار التمارين وإضافتها للأيام
│       │   ├── ExerciseDetailModal.tsx  # تفاصيل التمرين والشرح التشريحي الكامل
│       │   ├── ExerciseSwapModal.tsx    # استبدال تمرين بآخر بديل
│       │   ├── CustomExerciseBuilder.tsx # إضافة وتعديل تمرين مخصص
│       │   ├── CustomScheduleModal.tsx  # تخصيص أيام الأسبوع التدريبية
│       │   ├── ProgramVaultModal.tsx    # حافظة حفظ واسترجاع الجداول المتعددة
│       │   ├── MuscleAtlasDebug.tsx     # فاحص واختبار أطلس العضلات التشريحي
│       │   ├── programGenerator.ts      # مولد الجداول الذكي (PPL, Upper/Lower, Arnold, Bro)
│       │   ├── workoutStore.ts          # تخزين الجداول والتمارين المحذوفة والمخصصة
│       │   └── workoutUtils.ts          # استيراد وتصدير ومشاركة الجداول بتطبيقات المراسلة
│       ├── nutrition/             # محرك التغذية والحسابات العلمية
│       │   ├── NutritionModule.tsx # واجهة التغذية اليومية، الماكروز، وحاسبة السعرات
│       │   ├── nutritionEngine.ts # المحرك الفسيولوجي المعتمد على الأدلة (Mifflin/Katch/METs)
│       │   ├── calorieCalculator.ts # واجهة الحساب المبسطة والمتوافقة
│       │   ├── foodDatabase.ts    # قاعدة بيانات الأطعمة والمكونات
│       │   ├── egyptianMeals.ts   # قاعدة بيانات الوجبات المصرية الشعبية بقيمها الغذائية
│       │   ├── CustomMealModal.tsx # إضافة وجبة مركبة وحساب ماكروزها
│       │   └── QuickManualMealModal.tsx # إضافة سريعة لوجبة سعرات يدوية
│       ├── tracking/              # تتبع الأداء والوزن والملاحظات
│       │   ├── SessionLogger.tsx  # تسجيل جلسات التمرين السابقة
│       │   ├── BodyWeightTracker.tsx # تتبع ورسم بياني لوزن الجسم
│       │   ├── DayNotes.tsx       # ملاحظات يومية للتدريب والحالة الصحية
│       │   ├── TrainingCalendar.tsx # تقويم إنجاز الأيام والتمارين
│       │   └── trackingStore.ts   # إدارة تخزين جلسات التتبع
│       ├── reports/               # تقارير الالتزام والإحصائيات
│       │   ├── Reports.tsx        # تقارير السعرات والبروتين والالتزام (شهر، 3 أشهر، سنة)
│       │   └── SvgLineChart.tsx   # رسم بياني تفاعلي بدون مكتبات خارجية بـ SVG
│       └── backup/                # النسخ الاحتياطي والمزامنة التلقائية
│           ├── BackupPanel.tsx    # واجهة النسخ، الاستيراد، المزامنة، والمشاركة
│           └── backupStore.ts     # إدارة ملفات النسخ الاحتياطي والمزامنة ومشاركتها
├── scripts/
│   ├── check-env.mjs              # التحقق من متغيرات البيئة قبل التشغيل والبناء
│   ├── generateUnifiedDatabase.cjs
│   └── verify_database_integrity.cjs
└── docs/                          # وثائق المشروع
```

---

## 3. نماذج البيانات المركزية (Core TypeScript Domain Models)

### أ. ملف المستخدم (`src/modules/onboarding/types.ts`)

```typescript
export type Goal = 'hypertrophy' | 'cut' | 'flexibility' | 'calisthenics'

export interface BodyMetrics {
  sex: 'male' | 'female'
  age: number // 12 - 100
  heightCm: number // 100 - 250
  weightKg: number // 30 - 300
}

export interface ActivityLevel {
  id: string // 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete'
  multiplier: number // 1.2, 1.375, 1.55, 1.725, 1.9
  labelAr: string
  descriptionAr: string
}

export interface UserProfile {
  id: string
  createdAt: number
  updatedAt: number
  primaryGoal: Goal
  trainingDaysPerWeek: number // 1 - 7
  medicalConditions: string[]
  body: BodyMetrics
  activityLevelId: string
}
```

### ب. التمارين والجداول (`src/modules/shared/types.ts`)

```typescript
export type ExerciseSection =
  'warmup' | 'primary' | 'flexibility_core' | (string & {})

export interface DaySectionConfig {
  id: string
  labelAr: string
  icon: string
}

export const DEFAULT_DAY_SECTIONS: DaySectionConfig[] = [
  { id: 'warmup', labelAr: 'تمارين الإحماء والتسخين', icon: '🔥' },
  { id: 'primary', labelAr: 'التمارين الأساسية', icon: '🏋️' },
  { id: 'flexibility_core', labelAr: 'المرونة، الثبات والتهدئة', icon: '🧘' },
]

export const PRESET_DAY_SECTIONS: DaySectionConfig[] = [
  { id: 'warmup', labelAr: 'تمارين الإحماء والتسخين', icon: '🔥' },
  { id: 'primary', labelAr: 'التمارين الأساسية', icon: '🏋️' },
  { id: 'cardio', labelAr: 'تمارين الكارديو واللياقة', icon: '🏃' },
  { id: 'flexibility_core', labelAr: 'المرونة، الثبات والتهدئة', icon: '🧘' },
  { id: 'core_abs', labelAr: 'تمارين البطن والكور', icon: '🍫' },
  { id: 'arms_grip', labelAr: 'تمارين الساعد والقبضة', icon: '🦾' },
]

export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  notes?: string
  section?: ExerciseSection
}

export interface ProgramDay {
  dayIndex: number
  labelAr: string
  focus: string
  exercises: ProgramExercise[]
  sections?: DaySectionConfig[]
}

export type WorkoutSplitType =
  'ppl' | 'upper_lower' | 'arnold' | 'bro_split' | 'full_body'

export interface WorkoutProgram {
  id: string
  createdAt: number
  primaryGoal: Goal
  trainingDaysPerWeek: number
  splitType?: WorkoutSplitType
  days: ProgramDay[]
  isCustom?: boolean
  isLocked?: boolean
}
```

### ج. أطلس العضلات التشريحي (`src/modules/shared/types.ts` & `src/modules/workout/muscleAtlasData.ts`)

```typescript
export type MuscleRole = 'primary' | 'secondary'

export interface ExerciseMuscleTarget {
  id: string // مثل: 'pec_clavicular', 'delt_anterior', 'triceps_long'
  role: MuscleRole // 'primary' (أحمر) | 'secondary' (أصفر مع إطار داش)
}

export interface AtlasMuscleHead {
  id: string
  nameAr: string // "الصدرية الكبرى — الرأس الترقوي"
  nameEn: string // "Pectoralis Major (Clavicular Head)"
  group: MuscleGroup // 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core'
  views: ('anterior' | 'posterior')[]
  isDeep?: boolean // للعضلات العميقة مثل vastus intermedius, rhomboids
  svgPaths: {
    anterior?: string[]
    posterior?: string[]
  }
}
```

---

## 4. مفاتيح التخزين المحلي (LocalStorage Key Directory)

تخضع جميع المفاتيح لمغلف `createStorage('maganis')` وتخزن في المتصفح بالتنسيق التالي:

| المفتاح البرمجي             | المفتاح المخزن في المتصفح           | نوع البيانات            | الوظيفة                                       |
| :-------------------------- | :---------------------------------- | :---------------------- | :-------------------------------------------- |
| `profile.active`            | `maganis:profile.active`            | `UserProfile`           | الملف الشخصي للمستخدم النشط                   |
| `onboarding.draft`          | `maganis:onboarding.draft`          | مسودة مؤقتة             | حفظ تقدم المستخدم أثناء ملء الاستمارة         |
| `workout.active-program`    | `maganis:workout.active-program`    | `WorkoutProgram`        | جدول التدريب الأسبوعي المعتمد حالياً          |
| `workout.saved-programs`    | `maganis:workout.saved-programs`    | `SavedWorkoutProgram[]` | حافظة الجداول التدريبية المحفوظة              |
| `workout.custom-exercises`  | `maganis:workout.custom-exercises`  | `CustomExercise[]`      | التمارين المخصصة المضافة من المستخدم          |
| `workout.deleted-exercises` | `maganis:workout.deleted-exercises` | `string[]`              | معرفات التمارين المحذوفة من المكتبة           |
| `tracking.sessions`         | `maganis:tracking.sessions`         | `TrackingSession[]`     | سجل جلسات التدريب المكتملة                    |
| `tracking.body-log`         | `maganis:tracking.body-log`         | `BodyLogEntry[]`        | سجل قياسات الوزن ونسبة الدهون                 |
| `tracking.notes`            | `maganis:tracking.notes`            | `DayNote[]`             | ملاحظات الأيام التدريبية                      |
| `nutrition.day-logs`        | `maganis:nutrition.day-logs`        | سجل يوميات التغذية      | الوجبات والأطعمة المسجلة لكل تاريخ            |
| `nutrition.custom-foods`    | `maganis:nutrition.custom-foods`    | أطعمة مخصصة             | أطعمة أضافها المستخدم بقيمها الغذائية         |
| `nutrition.custom-meals`    | `maganis:nutrition.custom-meals`    | وجبات مركبة             | وجبات مكونة من عدة أطعمة                      |
| `maganis:active_session`    | `maganis:active_session`            | جلسة تمرين حية          | حفظ حالة التمرين النشط عند إعادة تحميل الصفحة |
| `maganis:theme`             | `maganis:theme`                     | `'dark' \| 'light'`     | مظهر التطبيق الليلي أو المضيء                 |
| `backup.last-export`        | `backup.last-export`                | `number` (timestamp)    | تاريخ آخر تصدير يدوي للبيانات                 |

---

## 5. المحركات العلمية الأساسية (Core Algorithmic Engines)

### أ. محرك حساب السعرات والماكروز (`src/modules/nutrition/nutritionEngine.ts`)

- **حساب معدل الأيض الأساسي (BMR):**
  - معادلة **Mifflin-St Jeor** الدقيقة (تعتمد على الجنس، الوزن، الطول، والعمر).
  - معادلة **Katch-McArdle** كبديل تلقائي عند توفر نسبة الدهون في الجسم (تعتمد على الكتلة اللحمية الخالية من الدهون $LBM$).
- **حساب استهلاك الطاقة الإجمالي (TDEE):**
  - لا يعتمد على مضاعفات عشوائية؛ بل يجمع بين الأيض الأساسي + النشاط غير التدريبي (NEAT) + النشاط التدريبي الفعلي (EAT) استناداً إلى مكافئات الأيض الفسيولوجية (METs) وشدة التمارين.
- **تحديد أهداف السعرات حسب الهدف (Goal Targets):**
  - **التضخيم (Hypertrophy):** فائض مدروس (Surplus) بنسبة محسوبة لمنع اكتساب الدهون العشوائي.
  - **التنشيف (Cut):** عجز تدريجي آمن مع الحفاظ على سقف لا يقل عن معدل الأيض الأساسي لحماية الغدة الدرقية وصحة الجسم.
- **توزيع المغذيات الكبرى (Macro Split Reconciliation):**
  - **البروتين:** يُحسب لكل كجم من وزن الجسم أو الكتلة اللحمية ($1.8 - 2.4\text{ g/kg}$).
  - **الدهون:** تضمن أرضية فسيولوجية لا تقل عن $20-25\%$ من إجمالي السعرات لحماية توازن الهرمونات.
  - **الكربوهيدرات:** تملأ باقي السعرات المتبقية لضمان مخازن الجليكوجين والطاقة أثناء التدريب.
- **حلقة المعايرة الذاتية (14-Day Calibration Loop):**
  - مقارنة الوزن المستهدف بالوزن الفعلي المسجل في سجل التتبع على مدار 14 يوماً وتعديل السعرات بدقة علمية.

### ب. محرك توليد الجداول التدريبية (`src/modules/workout/programGenerator.ts`)

- دعم أنظمة التقسيم العالمية:
  - **PPL:** دفع (صدر، كتف أمامي وجانبي، تراي) / سحب (ظهر، كتف خلفي، باي) / أرجل (أماميات، خلفيات، بطات، كور).
  - **Upper / Lower:** يوم للجزء العلوي / يوم للجزء السفلي.
  - **Arnold Split:** صدر وظهر / أكتاف وذراعين / أرجل.
  - **Bro Split:** عضلة واحدة رئيسية لكل يوم.
  - **Full Body:** تمارين مركبة للجسم كاملاً.
- مراعاة الإصابات الطبية المسجلة واستبعاد التمارين المجهدة لها تلقائياً واستبدالها بتمارين آمنة.

---

## 6. الميزات الحديثة المنجزة (Latest Completed Features)

1. **إدارة وتخصيص القوائم المنسدلة في جدول التمارين (Customizable Day Accordions):**
   - تنظيم تمارين اليوم داخل قوائم منسدلة أنيقة وقابلة للطي (`WeeklyPlanView.tsx`).
   - إمكانية **حذف أي قسم** (مثلاً: يوم مخصص للكارديو فقط بدون تمارين أساسية)، مع نافذة تأكيد ذكية تتيح حذف القسم بتمارينه أو نقل التمارين لقسم آخر متاح.
   - إمكانية **تعديل اسم القسم والأيقونة التعبيرية** (`✏️`).
   - إمكانية **إضافة أقسام جديدة** (`➕ إضافة قائمة منسدلة`) سواء من قوالب جاهزة (كارديو، بطن، قبضة) أو تسمية مخصصة.
2. **المشاركة المباشرة عبر تطبيقات الهاتف (Native Web Share API):**
   - إضافة زر **`📲 مشاركة`** في هيدر جدول التمارين وفي قسم النسخ الاحتياطي.
   - يفتح قائمة المشاركة الرسمية للهاتف لإرسال الملف مباشرة عبر **واتساب، تليجرام، ماسنجر**، إلخ، مع بقاء زر **`💾 تنزيل`** كخيار للحفظ المحلي.
3. **دعم زر الرجوع وإيماءات السحب بالهاتف (Hardware Back & Gesture Navigation):**
   - مكتبة [`navigationHistory.ts`](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/navigationHistory.ts) المعتمدة على `window.history.pushState` و `popstate`.
   - عند فتح أي نافذة منبثقة أو مودال، يؤدي زر الرجوع لإغلاقها والعودة للتطبيق بدلاً من الخروج.
   - عند التواجد في تبويب فرعي، يعود للوحة التحكم الرئيسية.
   - عند التواجد في الشاشة الرئيسية بدون نوافذ، يظهر إشعار: _"اضغط مرة أخرى للخروج من التطبيق"_.
4. **تحديث هوية وشعار التطبيق (Logo Sizing & Crisp Branding):**
   - اعتماد أيقونة د. مجانص المحدثة بدقة عالية (الشعار الناري مع البار والطبيب) وتكبيرها في الهيدر بدون إطارات مزدوجة مشوهة.
5. **نظام التقارير والالتزام بالتغذية (Nutrition Adherence Reports):**
   - تقارير تفصيلية لمدة شهر، 3 أشهر، وسنة مع رسوم بيانية تفاعلية لنسبة السعرات والبروتين وقائمة الأطعمة الأكثر تكراراً.

---

## 7. خارطة الطريق والمهمة التالية (Upcoming Task: BodyParts3D Atlas Pipeline)

> **المهمة التالية المجدولة:**  
> بناء أطلس العضلات التشريحي ثلاثي الأبعاد المعتمد على بيانات **BodyParts3D** اليابانية الحقيقية (Release 4.0, CC BY 4.0):
>
> 1. تنزيل ومعالجة مجسمات IS-A OBJ (`isa_BP3D_4.0_obj_99.zip`) لـ 53 رأساً عضلياً تشريحياً.
> 2. رندرة مساقط أرثوجرافية (Orthographic) بدقة عالية (> 3000px) للواجهتين الأمامية والخلفية (Anterior / Posterior) بالطبقتين السطحية والعميقة (Superficial / Deep).
> 3. استخراج متجهات SVG نظيفة ومبسطة لكل رأس عضلي (< 400KB).
> 4. إنشاء خرائط الظلال ثلاثية الأبعاد الرمادية (`*-shade.webp`) المدمجة بنمط `mix-blend-mode: multiply`.
> 5. ربط الأصول بملف ميتاداتا تشريحي كامل (`atlas-meta.json`) وتضمين رخصة الإسناد (`LICENSE-ATLAS.txt`).
> 6. إعادة بناء قسم خريطة العضلات في نافذة شرح التمرين (`ExerciseDetailModal.tsx`) لتعمل بالمساقط الحقيقية بدون أي أشكال بيضاوية أو كبسولية مرسومة يدوياً.

---

## 8. أوامر التطوير وبوابات الجودة (Commands & Quality Gates)

جميع الأوامر مصممة للعمل في بيئة Windows (PowerShell / cmd):

```powershell
# تشغيل خادم التطوير المحلي
npm.cmd run dev

# تشغيل حزمة اختبارات Vitest (16 ملف اختبار، 106 اختبارات)
npm.cmd test

# الفحص والتنسيق التلقائي للكود
npm.cmd run lint
npm.cmd run format:check
npm.cmd run format

# فحص أنواع TypeScript
npm.cmd run typecheck

# بناء حزمة الإنتاج
npm.cmd run build

# تشغيل بوابات الجودة الشاملة دفعة واحدة (Quality Gates)
npm.cmd run gates
```

> [!IMPORTANT]
> **ملاحظة أمنية بخصوص الدفع لـ GitHub:**  
> عند دفع التعديلات باستخدام توكن المستخدم الشخصي (PAT)، يجب عدم تضمين أو تعديل ملفات سير العمل داخل `.github/workflows/` إلا إذا كان التوكن يملك صلاحية `workflow`، لتجنب رفض عملية الرفع.
