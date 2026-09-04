/**
 * Muscle terminology simplification and bilingual helper.
 * Replaces academic/complex Latin-Arabic anatomical terms with everyday,
 * friendly gym terms understood across Egypt and the Arab world.
 */

const MUSCLE_SIMPLIFICATIONS: [RegExp, string][] = [
  [
    /عضلة شبه المنحرفة|العضلة شبه المنحرفة|شبه المنحرفة|المنحرفة/gi,
    'الترابيس (Traps)',
  ],
  [
    /العضلة الظهرية الواسعة|العضلة الظهرية العريضة|الظهرية الواسعة|الظهرية العريضة/gi,
    'المجانص / اللاتس (Lats)',
  ],
  [
    /العضلة الألوية الكبرى|عضلات الألوية الكبرى|العضلة الألوية|العضلة الالية|عضلات الألوية|الألوية/gi,
    'المقعدة / الجلوتس (Glutes)',
  ],
  [
    /العضلة المربعة القطنية|المربعة القطنية|القطنية|أسفل الظهر والقطنية/gi,
    'أسفل الظهر / القطنية (Lower Back)',
  ],
  [
    /العضلة الدائرية الكبرى|العضلة الدائرية الصغرى|العضلة الدائرية/gi,
    'أعلى الظهر الخارجي (Teres)',
  ],
  [/أوتار الركبة|العضلة ذات الرأسين الفخذية/gi, 'العضلة الخلفية (Hamstrings)'],
  [
    /العضلة الرباعية|الفخذ الرباعية|عضلة الفخذ الرباعية/gi,
    'العضلة الأمامية للفخذ (Quads)',
  ],
  [/العضلة ذات الرأسين العضدية|العضلة ذات الرأسين/gi, 'البايسبس (Biceps)'],
  [
    /العضلة ثلاثية الرؤوس العضدية|العضلة ثلاثية الرؤوس|ثلاثية الرؤوس/gi,
    'الترايسبس (Triceps)',
  ],
  [/العضلة الصدرية الكبرى|العضلة الصدرية/gi, 'عضلات الصدر (Chest)'],
  [/العضلة الدالية الأمامية|الدالية الأمامية/gi, 'الكتف الأمامي'],
  [/العضلة الدالية الجانبية|الدالية الجانبية/gi, 'الكتف الجانبي'],
  [/العضلة الدالية الخلفية|الدالية الخلفية/gi, 'الكتف الخلفي'],
  [/العضلة المستقيمة البطنية/gi, 'عضلات البطن (Abs)'],
  [/العضلات المائلة|العضلة المائلة الخارجية/gi, 'عضلات الجوانب (Obliques)'],
  [/العضلة الساقية|عضلات الساق/gi, 'السمانة (Calves)'],
  [/عضلات الساعد والقبضة|عضلات الساعد/gi, 'الساعد والقبضة (Forearms)'],
]

export function simplifyMuscleName(name: string): string {
  if (!name) return ''
  const cleaned = name.trim()
  for (const [pattern, replacement] of MUSCLE_SIMPLIFICATIONS) {
    if (pattern.test(cleaned)) {
      return replacement
    }
  }
  return cleaned
}

export function simplifyMuscleList(muscles: string[]): string[] {
  if (!Array.isArray(muscles)) return []
  return muscles.map((m) => simplifyMuscleName(m))
}

/**
 * Translates or simplifies English exercise steps into friendly Arabic instructions.
 */
export function formatHowToStep(
  step: string,
  index: number,
  _category = 'general',
): string {
  if (!step) return ''
  const trimmed = step.trim()

  // If already Arabic (contains Arabic unicode characters)
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed
  }

  // Common fitness instruction translations
  const lower = trimmed.toLowerCase()

  if (
    lower.includes('power rack') ||
    lower.includes('attach bands') ||
    lower.includes('reverse band')
  ) {
    if (lower.includes('attach bands') || lower.includes('set the bar')) {
      return 'ثبّت البار وأشرطة المقاومة في القفص الرياضي بإحكام على الارتفاع المناسب'
    }
    if (lower.includes('feet') || lower.includes('approach')) {
      return 'قف أمام البار مع مباعدة القدمين بعرض الكتفين والظهر مستقيم'
    }
    if (lower.includes('grip') || lower.includes('bend')) {
      return 'انحنِ من مفصل الحوض مع ثني الركبتين قليلاً وامسك البار بقبضة محكمة'
    }
    if (lower.includes('breath') || lower.includes('drive')) {
      return 'خذ نفساً عميقاً وادفع بقوة بكعبيك مع رفع الوزن للأعلى مع بقاء ظهرك مستقيماً'
    }
    if (lower.includes('lower') || lower.includes('return')) {
      return 'أنزل الوزن بتحكم كامل وهدوء حتى وضع البداية مع الحفاظ على استقامة ظهرك'
    }
  }

  if (lower.includes('lie') || lower.includes('lying')) {
    if (lower.includes('stomach') || lower.includes('face down')) {
      return 'استلقِ على بطنك مع مد ذراعيك وساقيك بالكامل'
    }
    if (lower.includes('back') || lower.includes('bench')) {
      return 'استلقِ على ظهرك على البنش مع تثبيت قدميك بإحكام على الأرض'
    }
  }

  if (lower.includes('raise') || lower.includes('lift')) {
    return 'ارفع الوزن ببطء وتحكم نحو الأعلى مع التركيز على عصر العضلة المستهدفة'
  }

  if (lower.includes('lower') || lower.includes('descend')) {
    return 'أنزل الوزن بهدوء وتحكم (2-3 ثوانٍ) حتى تشعر باستطالة العضلة دون اندفاع'
  }

  if (
    lower.includes('squeeze') ||
    lower.includes('hold') ||
    lower.includes('contract')
  ) {
    return 'اثبت في قمة الحركة لثانية واحدة مع عصر العضلة جيداً قبل النزول'
  }

  if (lower.includes('exhale') || lower.includes('breath')) {
    return 'تنفس بانتظام (شهيق أثناء النزول بالوزن، وزفير أثناء رفعه)'
  }

  // Fallback for any other English instruction step
  const fallbackTranslations: Record<number, string> = {
    0: 'اضبط وضعية البداية مع الحفاظ على استقامة الظهر وثبات القدمين والجذع',
    1: 'امسك الأوزان أو المقابض بقبضة قوية ومريحة مع الحفاظ على مسار الحركة السليم',
    2: 'تحرك بمدى حركي كامل وبتحكم كامل في الوزن دون أرجحة الجذع',
    3: 'اعصر العضلة المستهدفة في نقطة الانقباض لمدة ثانية واحدة',
    4: 'ارجع ببطء وتحكم لوضعية البداية مع التنفس المنتظم وكرر للتكرارات المطلوبة',
  }

  return (
    fallbackTranslations[index] ||
    `أكمل الحركة بتركيز وتحكم كامل مع الحفاظ على استقامة الظهر`
  )
}
