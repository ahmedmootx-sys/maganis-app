/**
 * src/content/claims.ts
 * R23 Claims Registry: Single source of truth for all educational and factual statements
 * (training, nutrition, physiology, and safety).
 */

export type ClaimStatus = 'sourced' | 'coach_authored' | 'unverified'

export interface ClaimDef {
  id: string
  text_ar: string
  source_id: string | null
  source_text?: string
  status: ClaimStatus
}

export const CLAIMS: Record<string, ClaimDef> = {
  // Appendix C — Calculation Guide Claims
  guide_energy_density: {
    id: 'guide_energy_density',
    text_ar:
      'الطاقة في الجرام: البروتين 4 سعرات، الكربوهيدرات 4 سعرات، الدهون 9 سعرات.',
    source_id: 'atwater_factors',
    source_text: 'معاملات أتواتر العامة (Atwater general factors)',
    status: 'sourced',
  },
  guide_bmr_formula: {
    id: 'guide_bmr_formula',
    text_ar:
      'معدل الحرق الأساسي يُحسب بمعادلة Mifflin–St Jeor من العمر والجنس والطول والوزن.',
    source_id: 'mifflin_1990',
    source_text: 'Mifflin وآخرون، 1990، American Journal of Clinical Nutrition',
    status: 'sourced',
  },
  guide_tdee_calculation: {
    id: 'guide_tdee_calculation',
    text_ar:
      'احتياجك اليومي = معدل الحرق الأساسي × معامل النشاط، ثم تُضاف سعرات التمرين المسجّلة. معامل نشاطك: {activity_factor}.',
    source_id: null,
    status: 'coach_authored',
  },
  guide_daily_target: {
    id: 'guide_daily_target',
    text_ar:
      'هدفك اليومي = احتياجك اليومي {adjustment_sign} {percent}% لهدف «{goal}». هذه النسبة اختيار التطبيق وليست رقمًا طبيًا ثابتًا.',
    source_id: null,
    status: 'coach_authored',
  },
  guide_protein_intake: {
    id: 'guide_protein_intake',
    text_ar:
      'البروتين: المدى الشائع لمن يتدرب بالأثقال حوالي 1.6 إلى 2.2 جم لكل كجم من وزن الجسم الكلي يوميًا. التطبيق يستخدم {protein_factor} جم/كجم لوزنك {weight} كجم = {protein_g} جم بروتين = {protein_kcal} سعرة.',
    source_id: 'morton_2018',
    source_text: 'Morton وآخرون، 2018، British Journal of Sports Medicine',
    status: 'sourced',
  },
  guide_fat_intake: {
    id: 'guide_fat_intake',
    text_ar:
      'الدهون: المدى الغذائي المقبول للبالغين من 20% إلى 35% من إجمالي السعرات. التطبيق يستخدم {fat_percent}% = {fat_g} جم.',
    source_id: 'iom_2005',
    source_text: 'Institute of Medicine، 2005، Dietary Reference Intakes',
    status: 'sourced',
  },
  guide_carb_intake: {
    id: 'guide_carb_intake',
    text_ar:
      'الكربوهيدرات: ما يتبقى من السعرات بعد البروتين والدهون، مقسومًا على 4. أي: (هدفك اليومي − سعرات البروتين − سعرات الدهون) ÷ 4 = {carb_g} جم.',
    source_id: null,
    status: 'coach_authored',
  },
  guide_fat_not_minimum: {
    id: 'guide_fat_not_minimum',
    text_ar:
      'لا تُسمّى نسبة الدهون التي يختارها التطبيق «حدًا أدنى»؛ هي اختيار داخل المدى المذكور.',
    source_id: null,
    status: 'coach_authored',
  },

  // Cardio Screen Claims (B5.b — Unsourced text marked unverified so production hides them)
  cardio_heart_health: {
    id: 'cardio_heart_health',
    text_ar:
      'الكارديو المعتدل يدعم صحة القلب ويساعد على تسريع الاستشفاء العضلي دون التأثير سلبًا على مكاسب القوة.',
    source_id: null,
    status: 'unverified',
  },
  cardio_zone2_fatloss: {
    id: 'cardio_zone2_fatloss',
    text_ar: 'تمارين المنطقة 2 تهدف لبناء قاعدة هوائية وحرق الدهون بكفاءة.',
    source_id: null,
    status: 'unverified',
  },
  cardio_hydration_advice: {
    id: 'cardio_hydration_advice',
    text_ar:
      'اشرب 250-500 مل ماء قبل وأثناء جلسة الكارديو للحفاظ على توازن السوائل.',
    source_id: null,
    status: 'unverified',
  },
  cardio_timing_advice: {
    id: 'cardio_timing_advice',
    text_ar:
      'يفضل أداء الكارديو بعد تمارين المقاومة أو في أوقات منفصلة لتجنب إجهاد العضلات.',
    source_id: null,
    status: 'unverified',
  },

  // Onboarding Referral Callout (Appendix B1)
  injury_referral_redflag: {
    id: 'injury_referral_redflag',
    text_ar:
      'إذا كان عندك تنميل أو ضعف مفاجئ أو ألم شديد بعد إصابة قوية، استشر طبيبًا قبل أي تمرين. يمكنك المتابعة، لكن لا تبدأ أي تمرين يحمّل هذه المنطقة قبل الفحص.',
    source_id: 'coach_appendix_b1',
    source_text: 'توجيهات المدرب المعتمدة (الملحق B1)',
    status: 'coach_authored',
  },
}
