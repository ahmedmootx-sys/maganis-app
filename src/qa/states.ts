/**
 * src/qa/states.ts
 * R19 State Registry: Single source of truth for all navigable and interactive states in Maganis.
 * Encompasses:
 * 1. Every route in the application
 * 2. Every sheet / modal / dialog
 * 3. Every wizard step in onboarding
 * 4. Every option state for finite choice controls (each option selected in turn)
 */

export type StateKind = 'route' | 'sheet' | 'wizard-step' | 'choice-state'

export interface AppStateDef {
  id: string
  kind: StateKind
  title: string
  category: string
  route?: string
  sheetId?: string
  stepIndex?: number
  choiceKey?: string
  optionValue?: string | number
  selector?: string
}

export const ROUTE_STATES: AppStateDef[] = [
  {
    id: 'route-home',
    kind: 'route',
    title: 'الرئيسية (لوحة التحكم)',
    category: 'routes',
    route: '/home',
  },
  {
    id: 'route-onboarding',
    kind: 'route',
    title: 'معالج الإعداد الأولي',
    category: 'routes',
    route: '/onboarding',
  },
  {
    id: 'route-training',
    kind: 'route',
    title: 'التدريب (الجدول الأسبوعي)',
    category: 'routes',
    route: '/training',
  },
  {
    id: 'route-training-day',
    kind: 'route',
    title: 'تفاصيل اليوم التدريبي',
    category: 'routes',
    route: '/training/day/0',
  },
  {
    id: 'route-exercise-detail',
    kind: 'route',
    title: 'صفحة تفاصيل التمرين والأطلس',
    category: 'routes',
    route: '/exercise/bench',
  },
  {
    id: 'route-library',
    kind: 'route',
    title: 'مكتبة التمارين',
    category: 'routes',
    route: '/library',
  },
  {
    id: 'route-nutrition',
    kind: 'route',
    title: 'التغذية والسعرات',
    category: 'routes',
    route: '/nutrition',
  },
  {
    id: 'route-progress',
    kind: 'route',
    title: 'التقدم وسجل التمارين',
    category: 'routes',
    route: '/progress',
  },
  {
    id: 'route-settings',
    kind: 'route',
    title: 'الإعدادات والبيانات',
    category: 'routes',
    route: '/settings',
  },
  {
    id: 'route-styleguide',
    kind: 'route',
    title: 'دليل الهوية والأنماط',
    category: 'routes',
    route: '/styleguide',
  },
  {
    id: 'route-gallery',
    kind: 'route',
    title: 'معرض المكونات',
    category: 'routes',
    route: '/gallery',
  },
]

export const SHEET_STATES: AppStateDef[] = [
  {
    id: 'sheet-edit-profile',
    kind: 'sheet',
    title: 'تعديل الملف الشخصي',
    category: 'sheets',
    sheetId: 'edit-profile',
  },
  {
    id: 'sheet-limitations-editor',
    kind: 'sheet',
    title: 'محرر الإصابات والمحددات',
    category: 'sheets',
    sheetId: 'limitations-editor',
  },
  {
    id: 'sheet-diagnostics',
    kind: 'sheet',
    title: 'تشخيص النظام والبيئة',
    category: 'sheets',
    sheetId: 'diagnostics',
  },
  {
    id: 'sheet-macro-guide',
    kind: 'sheet',
    title: 'دليل حساب السعرات والماكروز',
    category: 'sheets',
    sheetId: 'macro-guide',
  },
  {
    id: 'sheet-quick-meal',
    kind: 'sheet',
    title: 'تسجيل وجبة سريعة',
    category: 'sheets',
    sheetId: 'quick-meal',
  },
  {
    id: 'sheet-custom-meal',
    kind: 'sheet',
    title: 'إضافة وجبة مخصصة',
    category: 'sheets',
    sheetId: 'custom-meal',
  },
  {
    id: 'sheet-day-overflow',
    kind: 'sheet',
    title: 'خيارات اليوم التدريبي',
    category: 'sheets',
    sheetId: 'day-overflow',
  },
  {
    id: 'sheet-rename-day',
    kind: 'sheet',
    title: 'تعديل اسم اليوم التدريبي',
    category: 'sheets',
    sheetId: 'rename-day',
  },
  {
    id: 'sheet-manage-program',
    kind: 'sheet',
    title: 'إدارة الجدول التدريبي',
    category: 'sheets',
    sheetId: 'manage-program',
  },
  {
    id: 'sheet-export-program',
    kind: 'sheet',
    title: 'تصدير البرنامج التدريبي',
    category: 'sheets',
    sheetId: 'export-program',
  },
  {
    id: 'sheet-days-adjust',
    kind: 'sheet',
    title: 'تعديل أيام الجدول التدريبي',
    category: 'sheets',
    sheetId: 'days-adjust',
  },
  {
    id: 'sheet-add-day',
    kind: 'sheet',
    title: 'إضافة يوم جديد',
    category: 'sheets',
    sheetId: 'add-day',
  },
  {
    id: 'sheet-program-vault',
    kind: 'sheet',
    title: 'حافظة البرامج المحفوظة',
    category: 'sheets',
    sheetId: 'program-vault',
  },
  {
    id: 'sheet-ai-designer',
    kind: 'sheet',
    title: 'صمم لي جدولي الخاص (مرشد الذكاء الاصطناعي)',
    category: 'sheets',
    sheetId: 'ai-designer',
  },
  {
    id: 'sheet-import-preview',
    kind: 'sheet',
    title: 'معاينة الجدول المستورد كمسودة',
    category: 'sheets',
    sheetId: 'import-preview',
  },
  {
    id: 'sheet-custom-exercise',
    kind: 'sheet',
    title: 'إضافة تمرين جديد للكتالوج',
    category: 'sheets',
    sheetId: 'custom-exercise',
  },
  {
    id: 'sheet-replace-exercise',
    kind: 'sheet',
    title: 'استبدال تمرين أرشيفي',
    category: 'sheets',
    sheetId: 'replace-exercise',
  },
  {
    id: 'sheet-exercise-picker',
    kind: 'sheet',
    title: 'منتقي التمارين لإضافتها لليوم',
    category: 'sheets',
    sheetId: 'exercise-picker',
  },
  {
    id: 'sheet-session-finish',
    kind: 'sheet',
    title: 'ملخص إنهاء جلسة التمرين',
    category: 'sheets',
    sheetId: 'session-finish',
  },
  {
    id: 'sheet-body-log',
    kind: 'sheet',
    title: 'تسجيل وزن وقياسات الجسم',
    category: 'sheets',
    sheetId: 'body-log',
  },
  {
    id: 'sheet-day-note',
    kind: 'sheet',
    title: 'تدوين ملاحظات اليوم',
    category: 'sheets',
    sheetId: 'day-note',
  },
  {
    id: 'sheet-atlas-muscle-detail',
    kind: 'sheet',
    title: 'بطاقة تفاصيل العضلة في الأطلس',
    category: 'sheets',
    sheetId: 'atlas-muscle-detail',
  },
  {
    id: 'sheet-atlas-unpainted',
    kind: 'sheet',
    title: 'قائمة عضلات التمرين غير المرسومة',
    category: 'sheets',
    sheetId: 'atlas-unpainted',
  },
]

export const WIZARD_STEP_STATES: AppStateDef[] = [
  {
    id: 'wizard-step-1',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 1 (الهدف والأسلوب)',
    category: 'wizard',
    stepIndex: 1,
  },
  {
    id: 'wizard-step-2',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 2 (التدريب والأيام)',
    category: 'wizard',
    stepIndex: 2,
  },
  {
    id: 'wizard-step-3',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 3 (الصحة والمحددات)',
    category: 'wizard',
    stepIndex: 3,
  },
  {
    id: 'wizard-step-4',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 4 (البيانات الجسدية)',
    category: 'wizard',
    stepIndex: 4,
  },
  {
    id: 'wizard-step-5',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 5 (النشاط ونمط الحياة)',
    category: 'wizard',
    stepIndex: 5,
  },
  {
    id: 'wizard-step-6',
    kind: 'wizard-step',
    title: 'معالج الإعداد: الخطوة 6 (ملخص الخطة)',
    category: 'wizard',
    stepIndex: 6,
  },
]

export const CHOICE_OPTION_STATES: AppStateDef[] = [
  // Training Days (Step 2 & Settings)
  {
    id: 'choice-days-2',
    kind: 'choice-state',
    title: 'أيام التمرين: 2 أيام',
    category: 'choices',
    choiceKey: 'trainingDays',
    optionValue: 2,
  },
  {
    id: 'choice-days-3',
    kind: 'choice-state',
    title: 'أيام التمرين: 3 أيام',
    category: 'choices',
    choiceKey: 'trainingDays',
    optionValue: 3,
  },
  {
    id: 'choice-days-4',
    kind: 'choice-state',
    title: 'أيام التمرين: 4 أيام',
    category: 'choices',
    choiceKey: 'trainingDays',
    optionValue: 4,
  },
  {
    id: 'choice-days-5',
    kind: 'choice-state',
    title: 'أيام التمرين: 5 أيام',
    category: 'choices',
    choiceKey: 'trainingDays',
    optionValue: 5,
  },
  {
    id: 'choice-days-6',
    kind: 'choice-state',
    title: 'أيام التمرين: 6 أيام',
    category: 'choices',
    choiceKey: 'trainingDays',
    optionValue: 6,
  },

  // Session Duration (Step 2)
  {
    id: 'choice-dur-45',
    kind: 'choice-state',
    title: 'مدة الجلسة: 45 دقيقة',
    category: 'choices',
    choiceKey: 'sessionDuration',
    optionValue: 45,
  },
  {
    id: 'choice-dur-60',
    kind: 'choice-state',
    title: 'مدة الجلسة: 60 دقيقة',
    category: 'choices',
    choiceKey: 'sessionDuration',
    optionValue: 60,
  },
  {
    id: 'choice-dur-75',
    kind: 'choice-state',
    title: 'مدة الجلسة: 75 دقيقة',
    category: 'choices',
    choiceKey: 'sessionDuration',
    optionValue: 75,
  },
  {
    id: 'choice-dur-90',
    kind: 'choice-state',
    title: 'مدة الجلسة: 90 دقيقة',
    category: 'choices',
    choiceKey: 'sessionDuration',
    optionValue: 90,
  },

  // Session Intensity
  {
    id: 'choice-intensity-light',
    kind: 'choice-state',
    title: 'شدة التدريب: خفيف',
    category: 'choices',
    choiceKey: 'sessionIntensity',
    optionValue: 'light',
  },
  {
    id: 'choice-intensity-moderate',
    kind: 'choice-state',
    title: 'شدة التدريب: متوسط',
    category: 'choices',
    choiceKey: 'sessionIntensity',
    optionValue: 'moderate',
  },
  {
    id: 'choice-intensity-hard',
    kind: 'choice-state',
    title: 'شدة التدريب: شاق',
    category: 'choices',
    choiceKey: 'sessionIntensity',
    optionValue: 'hard',
  },

  // Experience Level
  {
    id: 'choice-exp-beginner',
    kind: 'choice-state',
    title: 'خبرة التدريب: مبتدئ',
    category: 'choices',
    choiceKey: 'experienceLevel',
    optionValue: 'beginner',
  },
  {
    id: 'choice-exp-intermediate',
    kind: 'choice-state',
    title: 'خبرة التدريب: متوسط',
    category: 'choices',
    choiceKey: 'experienceLevel',
    optionValue: 'intermediate',
  },
  {
    id: 'choice-exp-advanced',
    kind: 'choice-state',
    title: 'خبرة التدريب: متقدم',
    category: 'choices',
    choiceKey: 'experienceLevel',
    optionValue: 'advanced',
  },

  // Training Location
  {
    id: 'choice-loc-gym',
    kind: 'choice-state',
    title: 'مكان التدريب: جيم',
    category: 'choices',
    choiceKey: 'trainingLocation',
    optionValue: 'gym',
  },
  {
    id: 'choice-loc-home',
    kind: 'choice-state',
    title: 'مكان التدريب: منزل',
    category: 'choices',
    choiceKey: 'trainingLocation',
    optionValue: 'home',
  },
  {
    id: 'choice-loc-both',
    kind: 'choice-state',
    title: 'مكان التدريب: جيم ومنزل',
    category: 'choices',
    choiceKey: 'trainingLocation',
    optionValue: 'both',
  },

  // Sex
  {
    id: 'choice-sex-male',
    kind: 'choice-state',
    title: 'الجنس: ذكر',
    category: 'choices',
    choiceKey: 'sex',
    optionValue: 'male',
  },
  {
    id: 'choice-sex-female',
    kind: 'choice-state',
    title: 'الجنس: أنثى',
    category: 'choices',
    choiceKey: 'sex',
    optionValue: 'female',
  },

  // Condition Status: 3 regions x 3 statuses (9 combinations)
  {
    id: 'choice-status-shoulder-current',
    kind: 'choice-state',
    title: 'حالة الكتف: ألم حالي',
    category: 'choices',
    choiceKey: 'status_shoulder',
    optionValue: 'current_pain',
  },
  {
    id: 'choice-status-shoulder-recovered',
    kind: 'choice-state',
    title: 'حالة الكتف: إصابة قديمة وتعافيت',
    category: 'choices',
    choiceKey: 'status_shoulder',
    optionValue: 'old_recovered',
  },
  {
    id: 'choice-status-shoulder-treatment',
    kind: 'choice-state',
    title: 'حالة الكتف: تحت علاج طبيب',
    category: 'choices',
    choiceKey: 'status_shoulder',
    optionValue: 'under_treatment',
  },

  {
    id: 'choice-status-elbow-current',
    kind: 'choice-state',
    title: 'حالة الكوع: ألم حالي',
    category: 'choices',
    choiceKey: 'status_elbow',
    optionValue: 'current_pain',
  },
  {
    id: 'choice-status-elbow-recovered',
    kind: 'choice-state',
    title: 'حالة الكوع: إصابة قديمة وتعافيت',
    category: 'choices',
    choiceKey: 'status_elbow',
    optionValue: 'old_recovered',
  },
  {
    id: 'choice-status-elbow-treatment',
    kind: 'choice-state',
    title: 'حالة الكوع: تحت علاج طبيب',
    category: 'choices',
    choiceKey: 'status_elbow',
    optionValue: 'under_treatment',
  },

  {
    id: 'choice-status-lowerback-current',
    kind: 'choice-state',
    title: 'حالة أسفل الظهر: ألم حالي',
    category: 'choices',
    choiceKey: 'status_lower_back',
    optionValue: 'current_pain',
  },
  {
    id: 'choice-status-lowerback-recovered',
    kind: 'choice-state',
    title: 'حالة أسفل الظهر: إصابة قديمة وتعافيت',
    category: 'choices',
    choiceKey: 'status_lower_back',
    optionValue: 'old_recovered',
  },
  {
    id: 'choice-status-lowerback-treatment',
    kind: 'choice-state',
    title: 'حالة أسفل الظهر: تحت علاج طبيب',
    category: 'choices',
    choiceKey: 'status_lower_back',
    optionValue: 'under_treatment',
  },

  // Quick Meal Category
  {
    id: 'choice-meal-breakfast',
    kind: 'choice-state',
    title: 'وجبة: إفطار',
    category: 'choices',
    choiceKey: 'mealCategory',
    optionValue: 'breakfast',
  },
  {
    id: 'choice-meal-lunch',
    kind: 'choice-state',
    title: 'وجبة: غداء',
    category: 'choices',
    choiceKey: 'mealCategory',
    optionValue: 'lunch',
  },
  {
    id: 'choice-meal-dinner',
    kind: 'choice-state',
    title: 'وجبة: عشاء',
    category: 'choices',
    choiceKey: 'mealCategory',
    optionValue: 'dinner',
  },
  {
    id: 'choice-meal-snack',
    kind: 'choice-state',
    title: 'وجبة: سناك',
    category: 'choices',
    choiceKey: 'mealCategory',
    optionValue: 'snack',
  },

  // Training Styles
  {
    id: 'choice-style-weights',
    kind: 'choice-state',
    title: 'أسلوب: أوزان وحديد',
    category: 'choices',
    choiceKey: 'trainingStyle',
    optionValue: 'weights',
  },
  {
    id: 'choice-style-calisthenics',
    kind: 'choice-state',
    title: 'أسلوب: وزن الجسم (كاليستنكس)',
    category: 'choices',
    choiceKey: 'trainingStyle',
    optionValue: 'calisthenics',
  },
  {
    id: 'choice-style-cardio',
    kind: 'choice-state',
    title: 'أسلوب: كارديو ولياقة',
    category: 'choices',
    choiceKey: 'trainingStyle',
    optionValue: 'cardio',
  },
]

export const ALL_STATES: AppStateDef[] = [
  ...ROUTE_STATES,
  ...SHEET_STATES,
  ...WIZARD_STEP_STATES,
  ...CHOICE_OPTION_STATES,
]

export const REGISTRY_SIZE = ALL_STATES.length
