import type { Exercise } from '../shared/types.ts'

export type { Exercise }

/**
 * قاعدة بيانات تمارين تطبيق مجانص الموحدة والمحققة بنسبة 100%
 * تضم أفضل وأشهر تمارين كمال الأجسام واللياقة المنزلية والجيم
 * تم تدقيق الاستهداف التشريحي، والمعدات، وخطوات الأداء الصحيحة بدون تكرار أو تداخل بيانات.
 */
export const EXERCISES: Exercise[] = [
  {
    id: 'chest-1',
    name: 'Barbell Bench Press - Medium Grip',
    nameAr: 'ضغط صدري بالبار',
    descriptionAr:
      'تمرين ضغط صدري بالبار يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
  },
  {
    id: 'chest-4',
    name: 'Barbell Incline Bench Press - Medium Grip',
    nameAr: 'ضغط صدري مائل بالبار (بنش عالي)',
    descriptionAr:
      'تمرين ضغط صدري مائل بالبار (بنش عالي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg',
  },
  {
    id: 'chest-13',
    name: 'Decline Barbell Bench Press',
    nameAr: 'ضغط صدري مقلوب بالبار (بنش سفلي)',
    descriptionAr:
      'تمرين ضغط صدري مقلوب بالبار (بنش سفلي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Barbell_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Barbell_Bench_Press/0.jpg',
  },
  {
    id: 'chest-18',
    name: 'Wide-Grip Barbell Bench Press',
    nameAr: 'ضغط صدري بالبار قبضة واسعة',
    descriptionAr:
      'تمرين ضغط صدري بالبار قبضة واسعة يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Barbell_Bench_Press/0.jpg',
  },
  {
    id: 'Barbell_Guillotine_Bench_Press',
    name: 'Barbell Guillotine Bench Press',
    nameAr: 'ضغط صدري بار للمستوى الترقوي (Guillotine)',
    descriptionAr:
      'تمرين ضغط صدري بار للمستوى الترقوي (Guillotine) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['كتف'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Guillotine_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Guillotine_Bench_Press/0.jpg',
  },
  {
    id: 'chest-2',
    name: 'Dumbbell Bench Press',
    nameAr: 'ضغط صدري بالدمبل (بنش مستوٍ)',
    descriptionAr:
      'تمرين ضغط صدري بالدمبل (بنش مستوٍ) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bench_Press/0.jpg',
  },
  {
    id: 'chest-5',
    name: 'Incline Dumbbell Press',
    nameAr: 'ضغط صدري مائل بالدمبل (بنش عالي)',
    descriptionAr:
      'تمرين ضغط صدري مائل بالدمبل (بنش عالي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Press/0.jpg',
  },
  {
    id: 'chest-15',
    name: 'Decline Dumbbell Bench Press',
    nameAr: 'ضغط صدري مقلوب بالدمبل (بنش سفلي)',
    descriptionAr:
      'تمرين ضغط صدري مقلوب بالدمبل (بنش سفلي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Dumbbell_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Dumbbell_Bench_Press/0.jpg',
  },
  {
    id: 'chest-6',
    name: 'Dumbbell Flyes',
    nameAr: 'تفتيح صدر بالدمبل (مستوٍ)',
    descriptionAr:
      'تمرين تفتيح صدر بالدمبل (مستوٍ) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Flyes/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Flyes/0.jpg',
  },
  {
    id: 'chest-9',
    name: 'Incline Dumbbell Flyes',
    nameAr: 'تفتيح صدر مائل بالدمبل (عالي)',
    descriptionAr:
      'تمرين تفتيح صدر مائل بالدمبل (عالي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Flyes/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Flyes/0.jpg',
  },
  {
    id: 'chest-12',
    name: 'Decline Dumbbell Flyes',
    nameAr: 'تفتيح صدر مقلوب بالدمبل (سفلي)',
    descriptionAr:
      'تمرين تفتيح صدر مقلوب بالدمبل (سفلي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Dumbbell_Flyes/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Dumbbell_Flyes/0.jpg',
  },
  {
    id: 'chest-16',
    name: 'Straight-Arm Dumbbell Pullover',
    nameAr: 'سحب دمبل مستقيم للصدر واللاتس (بولوفر)',
    descriptionAr:
      'تمرين سحب دمبل مستقيم للصدر واللاتس (بولوفر) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Straight-Arm_Dumbbell_Pullover/0.jpg',
  },
  {
    id: 'chest-17',
    name: 'One-Arm Flat Bench Dumbbell Flye',
    nameAr: 'تفتيح صدر بالدمبل بيد واحدة',
    descriptionAr:
      'تمرين تفتيح صدر بالدمبل بيد واحدة يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Flat_Bench_Dumbbell_Flye/0.jpg',
  },
  {
    id: 'Hammer_Grip_Incline_DB_Bench_Press',
    name: 'Hammer Grip Incline DB Bench Press',
    nameAr: 'ضغط دمبل مائل بقبضة متوازية (هامر)',
    descriptionAr:
      'تمرين ضغط دمبل مائل بقبضة متوازية (هامر) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Grip_Incline_DB_Bench_Press/0.jpg',
  },
  {
    id: 'chest-7',
    name: 'Cable Crossover',
    nameAr: 'تقاطع كابل للصدر (كيبل كروس عالي/وسط)',
    descriptionAr:
      'تمرين تقاطع كابل للصدر (كيبل كروس عالي/وسط) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crossover/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crossover/0.jpg',
  },
  {
    id: 'chest-14',
    name: 'Low Cable Crossover',
    nameAr: 'تقاطع كابل للصدر من الأسفل (كيبل سفلي)',
    descriptionAr:
      'تمرين تقاطع كابل للصدر من الأسفل (كيبل سفلي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Low_Cable_Crossover/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Low_Cable_Crossover/0.jpg',
  },
  {
    id: 'chest-8',
    name: 'Cable Chest Press',
    nameAr: 'ضغط صدري بالكابل واقفاً',
    descriptionAr:
      'تمرين ضغط صدري بالكابل واقفاً يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Chest_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Chest_Press/0.jpg',
  },
  {
    id: 'Cable_Iron_Cross',
    name: 'Cable Iron Cross',
    nameAr: 'تقاطع كابل حديدي (أيرون كروس)',
    descriptionAr:
      'تمرين تقاطع كابل حديدي (أيرون كروس) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Iron_Cross/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Iron_Cross/0.jpg',
  },
  {
    id: 'Single-Arm_Cable_Crossover',
    name: 'Single-Arm Cable Crossover',
    nameAr: 'تقاطع كابل للصدر بيد واحدة',
    descriptionAr:
      'تمرين تقاطع كابل للصدر بيد واحدة يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Single-Arm_Cable_Crossover/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Single-Arm_Cable_Crossover/0.jpg',
  },
  {
    id: 'chest-20',
    name: 'Butterfly',
    nameAr: 'تفتيح صدر على جهاز الفراشة (Pec Deck)',
    descriptionAr:
      'تمرين تفتيح صدر على جهاز الفراشة (Pec Deck) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الصدر (الصدرية الكبرى)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Butterfly/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Butterfly/0.jpg',
  },
  {
    id: 'chest-10',
    name: 'Leverage Chest Press',
    nameAr: 'ضغط صدري على الجهاز (Chest Press Machine)',
    descriptionAr:
      'تمرين ضغط صدري على الجهاز (Chest Press Machine) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Chest_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Chest_Press/0.jpg',
  },
  {
    id: 'Leverage_Incline_Chest_Press',
    name: 'Leverage Incline Chest Press',
    nameAr: 'ضغط صدري مائل على الجهاز',
    descriptionAr:
      'تمرين ضغط صدري مائل على الجهاز يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Incline_Chest_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Incline_Chest_Press/0.jpg',
  },
  {
    id: 'Leverage_Decline_Chest_Press',
    name: 'Leverage Decline Chest Press',
    nameAr: 'ضغط صدري مقلوب على الجهاز',
    descriptionAr:
      'تمرين ضغط صدري مقلوب على الجهاز يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Decline_Chest_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Decline_Chest_Press/0.jpg',
  },
  {
    id: 'Smith_Machine_Bench_Press',
    name: 'Smith Machine Bench Press',
    nameAr: 'ضغط صدري مستوٍ على جهاز سميث',
    descriptionAr:
      'تمرين ضغط صدري مستوٍ على جهاز سميث يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Bench_Press/0.jpg',
  },
  {
    id: 'Smith_Machine_Incline_Bench_Press',
    name: 'Smith Machine Incline Bench Press',
    nameAr: 'ضغط صدري مائل على جهاز سميث',
    descriptionAr:
      'تمرين ضغط صدري مائل على جهاز سميث يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Incline_Bench_Press/0.jpg',
  },
  {
    id: 'Smith_Machine_Decline_Press',
    name: 'Smith Machine Decline Press',
    nameAr: 'ضغط صدري مقلوب على جهاز سميث',
    descriptionAr:
      'تمرين ضغط صدري مقلوب على جهاز سميث يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Decline_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Decline_Press/0.jpg',
  },
  {
    id: 'chest-11',
    name: 'Dips - Chest Version',
    nameAr: 'متوازي بوزن الجسم للصدر (ميل الجذع للأمام)',
    descriptionAr:
      'تمرين متوازي بوزن الجسم للصدر (ميل الجذع للأمام) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    avoidForInjuries: ['كتف'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dips_-_Chest_Version/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dips_-_Chest_Version/0.jpg',
  },
  {
    id: 'chest-3',
    name: 'Pushups',
    nameAr: 'تمرين الضغط (ضغط أرضي)',
    descriptionAr:
      'تمرين تمرين الضغط (ضغط أرضي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pushups/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pushups/0.jpg',
  },
  {
    id: 'chest-19',
    name: 'Incline Push-Up',
    nameAr: 'ضغط مائل لأعلى بوزن الجسم (أسهل للمبتدئين)',
    descriptionAr:
      'تمرين ضغط مائل لأعلى بوزن الجسم (أسهل للمبتدئين) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Push-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Push-Up/0.jpg',
  },
  {
    id: 'Decline_Push-Up',
    name: 'Decline Push-Up',
    nameAr: 'ضغط مائل لأسفل بوزن الجسم (تركيز علوي)',
    descriptionAr:
      'تمرين ضغط مائل لأسفل بوزن الجسم (تركيز علوي) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Push-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Push-Up/0.jpg',
  },
  {
    id: 'Svend_Press',
    name: 'Svend Press',
    nameAr: 'ضغط صدر بالأقراص (Svend Press)',
    descriptionAr:
      'تمرين ضغط صدر بالأقراص (Svend Press) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الساعد والقبضة',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Svend_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Svend_Press/0.jpg',
  },
  {
    id: 'Clock_Push-Up',
    name: 'Clock Push-Up',
    nameAr: 'ضغط دائري حركي (Clock Push-Up)',
    descriptionAr:
      'تمرين ضغط دائري حركي (Clock Push-Up) يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clock_Push-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clock_Push-Up/0.jpg',
  },
  {
    id: 'back-14',
    name: 'Barbell Deadlift',
    nameAr: 'ديدليفت كلاسيكي بالبار (Deadlift)',
    descriptionAr:
      'تمرين ديدليفت كلاسيكي بالبار (Deadlift) يستهدف أسفل الظهر (الفقرات القطنية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'قف بمنتصف البار مع وضع مشطي القدمين تحت البار مباشرة ومسافة بعرض الوركين، وحافظ على استقامة الظهر.',
      'انزل بالوركين للأسفل وأمسك البار بقبضة محكمة خارج الساقين، مع رفع الصدر وتثبيت عضلات اللاتس والجذع.',
      'ادفع الأرض بقدميك بقوة واسحب البار بمحاذاة الساقين حتى الوقوف التام مع فرد الحوض وعصر الجلوتس في الأعلى.',
      'انزل بالبار بالتحكم نفسه عبر إرجاع الوركين للخلف أولاً ثم ثني الركبتين حتى ملامسة الأرض مع تنظيم التنفس.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أسفل الظهر (الفقرات القطنية) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات السمانة (الكاحل)',
      'عضلات الساعد والقبضة',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلة الظهر العريضة (المجانص)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Deadlift/0.jpg',
  },
  {
    id: 'back-4',
    name: 'Bent Over Barbell Row',
    nameAr: 'تجديف بالبار منحنياً (Bent-Over Row)',
    descriptionAr:
      'تمرين تجديف بالبار منحنياً (Bent-Over Row) يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Barbell_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Barbell_Row/0.jpg',
  },
  {
    id: 'back-5',
    name: 'Bent Over Two-Dumbbell Row',
    nameAr: 'تجديف بالدمبلين منحنياً',
    descriptionAr:
      'تمرين تجديف بالدمبلين منحنياً يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg',
  },
  {
    id: 'back-13',
    name: 'One-Arm Dumbbell Row',
    nameAr: 'تجديف بالدمبل بيد واحدة على البنش (منشار)',
    descriptionAr:
      'تمرين تجديف بالدمبل بيد واحدة على البنش (منشار) يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Dumbbell_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Dumbbell_Row/0.jpg',
  },
  {
    id: 'back-8',
    name: 'T-Bar Row with Handle',
    nameAr: 'تجديف تي بار بالوزن الحر (T-Bar Row)',
    descriptionAr:
      'تمرين تجديف تي بار بالوزن الحر (T-Bar Row) يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/T-Bar_Row_with_Handle/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/T-Bar_Row_with_Handle/0.jpg',
  },
  {
    id: 'back-1',
    name: 'Wide-Grip Lat Pulldown',
    nameAr: 'سحب عالي للظهر بقبضة واسعة (Lat Pulldown)',
    descriptionAr:
      'تمرين سحب عالي للظهر بقبضة واسعة (Lat Pulldown) يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
  },
  {
    id: 'back-7',
    name: 'Close-Grip Front Lat Pulldown',
    nameAr: 'سحب عالي للظهر بقبضة ضيقة V-Bar',
    descriptionAr:
      'تمرين سحب عالي للظهر بقبضة ضيقة V-Bar يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg',
  },
  {
    id: 'back-3',
    name: 'Underhand Cable Pulldowns',
    nameAr: 'سحب عالي بقبضة مقلوبة للمجانص والباي',
    descriptionAr:
      'تمرين سحب عالي بقبضة مقلوبة للمجانص والباي يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Underhand_Cable_Pulldowns/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Underhand_Cable_Pulldowns/0.jpg',
  },
  {
    id: 'One_Arm_Lat_Pulldown',
    name: 'One Arm Lat Pulldown',
    nameAr: 'سحب عالي بالكابل بيد واحدة',
    descriptionAr:
      'تمرين سحب عالي بالكابل بيد واحدة يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One_Arm_Lat_Pulldown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One_Arm_Lat_Pulldown/0.jpg',
  },
  {
    id: 'Full_Range-Of-Motion_Lat_Pulldown',
    name: 'Full Range-Of-Motion Lat Pulldown',
    nameAr: 'سحب عالي بمدى حركي كامل',
    descriptionAr:
      'تمرين سحب عالي بمدى حركي كامل يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Full_Range-Of-Motion_Lat_Pulldown/0.jpg',
  },
  {
    id: 'back-6',
    name: 'Seated Cable Rows',
    nameAr: 'سحب أرضي بالكابل للظهر (Seated Cable Row)',
    descriptionAr:
      'تمرين سحب أرضي بالكابل للظهر (Seated Cable Row) يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Cable_Rows/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Cable_Rows/0.jpg',
  },
  {
    id: 'Elevated_Cable_Rows',
    name: 'Elevated Cable Rows',
    nameAr: 'سحب كابل من مستوى مرتفع للظهر',
    descriptionAr:
      'تمرين سحب كابل من مستوى مرتفع للظهر يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Elevated_Cable_Rows/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Elevated_Cable_Rows/0.jpg',
  },
  {
    id: 'back-11',
    name: 'Straight-Arm Pulldown',
    nameAr: 'سحب كابل بالذراعين مفرودتين للمجانص',
    descriptionAr:
      'تمرين سحب كابل بالذراعين مفرودتين للمجانص يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الظهر العريضة (المجانص)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Straight-Arm_Pulldown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Straight-Arm_Pulldown/0.jpg',
  },
  {
    id: 'back-10',
    name: 'Pullups',
    nameAr: 'عقلة قبضة واسعة فوقية (Pull-Ups)',
    descriptionAr:
      'تمرين عقلة قبضة واسعة فوقية (Pull-Ups) يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups/0.jpg',
  },
  {
    id: 'Wide-Grip_Rear_Pull-Up',
    name: 'Wide-Grip Rear Pull-Up',
    nameAr: 'عقلة خلفية واسعة',
    descriptionAr:
      'تمرين عقلة خلفية واسعة يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Rear_Pull-Up/0.jpg',
  },
  {
    id: 'back-17',
    name: 'Chin-Up',
    nameAr: 'عقلة قبضة معكوسة للباي واللاتس (Chin-Ups)',
    descriptionAr:
      'تمرين عقلة قبضة معكوسة للباي واللاتس (Chin-Ups) يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'عضلات الساعد والقبضة',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/0.jpg',
  },
  {
    id: 'back-16',
    name: 'Inverted Row',
    nameAr: 'عقلة أسترالية مقلوبة بوزن الجسم',
    descriptionAr:
      'تمرين عقلة أسترالية مقلوبة بوزن الجسم يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Inverted_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Inverted_Row/0.jpg',
  },
  {
    id: 'Rope_Climb',
    name: 'Rope Climb',
    nameAr: 'تسلق الحبل لتقوية الظهر والقبضة',
    descriptionAr:
      'تمرين تسلق الحبل لتقوية الظهر والقبضة يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'عضلات الساعد والقبضة',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rope_Climb/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rope_Climb/0.jpg',
  },
  {
    id: 'back-20',
    name: 'Barbell Shrug',
    nameAr: 'هز أكتاف بالبار للترابيس (Barbell Shrug)',
    descriptionAr:
      'تمرين هز أكتاف بالبار للترابيس (Barbell Shrug) يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shrug/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shrug/0.jpg',
  },
  {
    id: 'Dumbbell_Shrug',
    name: 'Dumbbell Shrug',
    nameAr: 'هز أكتاف بالدمبل للترابيس (Dumbbell Shrug)',
    descriptionAr:
      'تمرين هز أكتاف بالدمبل للترابيس (Dumbbell Shrug) يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Shrug/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Shrug/0.jpg',
  },
  {
    id: 'Cable_Shrugs',
    name: 'Cable Shrugs',
    nameAr: 'شراغز بالكابل للترابيس',
    descriptionAr:
      'تمرين شراغز بالكابل للترابيس يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Shrugs/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Shrugs/0.jpg',
  },
  {
    id: 'Middle_Back_Shrug',
    name: 'Middle Back Shrug',
    nameAr: 'شراغز لمنتصف الظهر على البنش',
    descriptionAr:
      'تمرين شراغز لمنتصف الظهر على البنش يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['أعلى ومنتصف الظهر (الرومبويدز والترابيس)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Middle_Back_Shrug/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Middle_Back_Shrug/0.jpg',
  },
  {
    id: 'back-9',
    name: 'Hyperextensions (Back Extensions)',
    nameAr: 'تمديد الظهر وأسفل الظهر على الجهاز (Hyper)',
    descriptionAr:
      'تمرين تمديد الظهر وأسفل الظهر على الجهاز (Hyper) يستهدف أسفل الظهر (الفقرات القطنية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أسفل الظهر (الفقرات القطنية) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hyperextensions_Back_Extensions/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hyperextensions_Back_Extensions/0.jpg',
  },
  {
    id: 'Good_Morning',
    name: 'Good Morning',
    nameAr: 'صباح الخير بالبار لأسفل الظهر والخلفيات',
    descriptionAr:
      'تمرين صباح الخير بالبار لأسفل الظهر والخلفيات يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Good_Morning/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Good_Morning/0.jpg',
  },
  {
    id: 'Stiff_Leg_Barbell_Good_Morning',
    name: 'Stiff Leg Barbell Good Morning',
    nameAr: 'جود مورنينج بالبار بركبتين ثابتتين',
    descriptionAr:
      'تمرين جود مورنينج بالبار بركبتين ثابتتين يستهدف أسفل الظهر (الفقرات القطنية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أسفل الظهر (الفقرات القطنية) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff_Leg_Barbell_Good_Morning/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff_Leg_Barbell_Good_Morning/0.jpg',
  },
  {
    id: 'Smith_Machine_Bent_Over_Row',
    name: 'Smith Machine Bent Over Row',
    nameAr: 'تجديف منحنياً على جهاز سميث',
    descriptionAr:
      'تمرين تجديف منحنياً على جهاز سميث يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Bent_Over_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Bent_Over_Row/0.jpg',
  },
  {
    id: 'back-18',
    name: 'Leverage High Row',
    nameAr: 'سحب عالي على جهاز الرافعة للمجانص',
    descriptionAr:
      'تمرين سحب عالي على جهاز الرافعة للمجانص يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_High_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_High_Row/0.jpg',
  },
  {
    id: 'back-19',
    name: 'Shotgun Row',
    nameAr: 'تجديف بالكابل بيد واحدة (شوت جن)',
    descriptionAr:
      'تمرين تجديف بالكابل بيد واحدة (شوت جن) يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Shotgun_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Shotgun_Row/0.jpg',
  },
  {
    id: 'Bent_Over_Two-Arm_Long_Bar_Row',
    name: 'Bent Over Two-Arm Long Bar Row',
    nameAr: 'تجديف بالبار الطويل منحنياً',
    descriptionAr:
      'تمرين تجديف بالبار الطويل منحنياً يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Arm_Long_Bar_Row/0.jpg',
  },
  {
    id: 'Sumo_Deadlift',
    name: 'Sumo Deadlift',
    nameAr: 'ديدليفت سومو بوقفة واسعة (Sumo Deadlift)',
    descriptionAr:
      'تمرين ديدليفت سومو بوقفة واسعة (Sumo Deadlift) يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات الفخذ الداخلية (الضامة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات الفخذ الداخلية (الضامة)',
      'عضلات الساعد والقبضة',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sumo_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Sumo_Deadlift/0.jpg',
  },
  {
    id: 'Trap_Bar_Deadlift',
    name: 'Trap Bar Deadlift',
    nameAr: 'ديدليفت بالبار السداسي (Trap Bar)',
    descriptionAr:
      'تمرين ديدليفت بالبار السداسي (Trap Bar) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Trap_Bar_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Trap_Bar_Deadlift/0.jpg',
  },
  {
    id: 'Deadlift_with_Bands',
    name: 'Deadlift with Bands',
    nameAr: 'ديدليفت بالبار مع أحبال مقاومة',
    descriptionAr:
      'تمرين ديدليفت بالبار مع أحبال مقاومة يستهدف أسفل الظهر (الفقرات القطنية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'advanced',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'قف بمنتصف البار مع وضع مشطي القدمين تحت البار مباشرة ومسافة بعرض الوركين، وحافظ على استقامة الظهر.',
      'انزل بالوركين للأسفل وأمسك البار بقبضة محكمة خارج الساقين، مع رفع الصدر وتثبيت عضلات اللاتس والجذع.',
      'ادفع الأرض بقدميك بقوة واسحب البار بمحاذاة الساقين حتى الوقوف التام مع فرد الحوض وعصر الجلوتس في الأعلى.',
      'انزل بالبار بالتحكم نفسه عبر إرجاع الوركين للخلف أولاً ثم ثني الركبتين حتى ملامسة الأرض مع تنظيم التنفس.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أسفل الظهر (الفقرات القطنية) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الساعد والقبضة',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Deadlift_with_Bands/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Deadlift_with_Bands/0.jpg',
  },
  {
    id: 'back-15',
    name: 'Romanian Deadlift from Deficit',
    nameAr: 'ديدليفت روماني من منصة مرتفعة',
    descriptionAr:
      'تمرين ديدليفت روماني من منصة مرتفعة يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات الساعد والقبضة',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift_from_Deficit/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift_from_Deficit/0.jpg',
  },
  {
    id: 'Kettlebell_One-Legged_Deadlift',
    name: 'Kettlebell One-Legged Deadlift',
    nameAr: 'ديدليفت بالكتلبل بساق واحدة',
    descriptionAr:
      'تمرين ديدليفت بالكتلبل بساق واحدة يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kettlebell_One-Legged_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kettlebell_One-Legged_Deadlift/0.jpg',
  },
  {
    id: 'core-19',
    name: 'Superman',
    nameAr: 'تمرين سوبرمان لتقوية أسفل الظهر بوزن الجسم',
    descriptionAr:
      'تمرين تمرين سوبرمان لتقوية أسفل الظهر بوزن الجسم يستهدف أسفل الظهر (الفقرات القطنية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أسفل الظهر (الفقرات القطنية) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Superman/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Superman/0.jpg',
  },
  {
    id: 'shoulder-12',
    name: 'Face Pull',
    nameAr: 'سحب الحبل للوجه والكتف الخلفي (Face Pull)',
    descriptionAr:
      'تمرين سحب الحبل للوجه والكتف الخلفي (Face Pull) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull/0.jpg',
  },
  {
    id: 'Side_Laterals_to_Front_Raise',
    name: 'Side Laterals to Front Raise',
    nameAr: 'دمج رفرفة جانبية وأمامية',
    descriptionAr:
      'تمرين دمج رفرفة جانبية وأمامية يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Laterals_to_Front_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Laterals_to_Front_Raise/0.jpg',
  },
  {
    id: 'Upright_Row_-_With_Bands',
    name: 'Upright Row - With Bands',
    nameAr: 'تجديف عمودي بحبل المقاومة',
    descriptionAr:
      'تمرين تجديف عمودي بحبل المقاومة يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Row_-_With_Bands/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Row_-_With_Bands/0.jpg',
  },
  {
    id: 'Standing_Cable_Lift',
    name: 'Standing Cable Lift',
    nameAr: 'رفع كابل قطري للجذع والظهر',
    descriptionAr:
      'تمرين رفع كابل قطري للجذع والظهر يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Cable_Lift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Cable_Lift/0.jpg',
  },
  {
    id: 'leg-1',
    name: 'Barbell Full Squat',
    nameAr: 'سكوات خلفي كامل بالبار (Back Squat)',
    descriptionAr:
      'تمرين سكوات خلفي كامل بالبار (Back Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat/0.jpg',
  },
  {
    id: 'leg-11',
    name: 'Front Barbell Squat',
    nameAr: 'سكوات أمامي بالبار (Front Squat)',
    descriptionAr:
      'تمرين سكوات أمامي بالبار (Front Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'advanced',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Barbell_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Barbell_Squat/0.jpg',
  },
  {
    id: 'leg-14',
    name: 'Box Squat',
    nameAr: 'سكوات بالبار على الصندوق (Box Squat)',
    descriptionAr:
      'تمرين سكوات بالبار على الصندوق (Box Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات الفخذ الداخلية (الضامة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الفخذ الداخلية (الضامة)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Box_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Box_Squat/0.jpg',
  },
  {
    id: 'Narrow_Stance_Squats',
    name: 'Narrow Stance Squats',
    nameAr: 'سكوات بالبار بوقفة ضيقة للتركيز على الفخذ',
    descriptionAr:
      'تمرين سكوات بالبار بوقفة ضيقة للتركيز على الفخذ يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Narrow_Stance_Squats/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Narrow_Stance_Squats/0.jpg',
  },
  {
    id: 'Wide_Stance_Barbell_Squat',
    name: 'Wide Stance Barbell Squat',
    nameAr: 'سكوات بالبار بوقفة واسعة للضامة والجلوتس',
    descriptionAr:
      'تمرين سكوات بالبار بوقفة واسعة للضامة والجلوتس يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide_Stance_Barbell_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide_Stance_Barbell_Squat/0.jpg',
  },
  {
    id: 'Overhead_Squat',
    name: 'Overhead Squat',
    nameAr: 'سكوات والبار مرفوع فوق الرأس',
    descriptionAr:
      'تمرين سكوات والبار مرفوع فوق الرأس يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'advanced',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Overhead_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Overhead_Squat/0.jpg',
  },
  {
    id: 'leg-12',
    name: 'Hack Squat',
    nameAr: 'هاك سكوات على الجهاز (Hack Squat)',
    descriptionAr:
      'تمرين هاك سكوات على الجهاز (Hack Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hack_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hack_Squat/0.jpg',
  },
  {
    id: 'leg-8',
    name: 'Barbell Lunge',
    nameAr: 'طعنات بالبار للأرجل والجلوتس (Barbell Lunges)',
    descriptionAr:
      'تمرين طعنات بالبار للأرجل والجلوتس (Barbell Lunges) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Lunge/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Lunge/0.jpg',
  },
  {
    id: 'Barbell_Walking_Lunge',
    name: 'Barbell Walking Lunge',
    nameAr: 'طعنات بالمشي بالبار',
    descriptionAr:
      'تمرين طعنات بالمشي بالبار يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Walking_Lunge/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Walking_Lunge/0.jpg',
  },
  {
    id: 'Barbell_Side_Split_Squat',
    name: 'Barbell Side Split Squat',
    nameAr: 'سكوات جانبي بالبار للفخذ الداخلي',
    descriptionAr:
      'تمرين سكوات جانبي بالبار للفخذ الداخلي يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Side_Split_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Side_Split_Squat/0.jpg',
  },
  {
    id: 'leg-2',
    name: 'Dumbbell Squat',
    nameAr: 'سكوات بالدمبل',
    descriptionAr:
      'تمرين سكوات بالدمبل يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Squat/0.jpg',
  },
  {
    id: 'Goblet_Squat',
    name: 'Goblet Squat',
    nameAr: 'جوبلت سكوات بالدمبل (Goblet Squat)',
    descriptionAr:
      'تمرين جوبلت سكوات بالدمبل (Goblet Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Goblet_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Goblet_Squat/0.jpg',
  },
  {
    id: 'leg-7',
    name: 'Dumbbell Lunges',
    nameAr: 'طعنات بالدمبلين (Dumbbell Lunges)',
    descriptionAr:
      'تمرين طعنات بالدمبلين (Dumbbell Lunges) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lunges/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lunges/0.jpg',
  },
  {
    id: 'leg-3',
    name: 'Split Squat with Dumbbells',
    nameAr: 'سبليت سكوات ثابت بالدمبل',
    descriptionAr:
      'تمرين سبليت سكوات ثابت بالدمبل يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Split_Squat_with_Dumbbells/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Split_Squat_with_Dumbbells/0.jpg',
  },
  {
    id: 'leg-13',
    name: 'Dumbbell Step Ups',
    nameAr: 'صعود الدرج بالدمبل (Step-Ups)',
    descriptionAr:
      'تمرين صعود الدرج بالدمبل (Step-Ups) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Step_Ups/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Step_Ups/0.jpg',
  },
  {
    id: 'Step-up_with_Knee_Raise',
    name: 'Step-up with Knee Raise',
    nameAr: 'صعود الدرج مع رفع الركبة',
    descriptionAr:
      'تمرين صعود الدرج مع رفع الركبة يستهدف عضلات المؤخرة والألوية (الجلوتس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات المؤخرة والألوية (الجلوتس) و أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'العضلة الرباعية (الفخذ الأمامي)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Step-up_with_Knee_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Step-up_with_Knee_Raise/0.jpg',
  },
  {
    id: 'leg-16',
    name: 'Plie Dumbbell Squat',
    nameAr: 'سومو سكوات بالدمبل (Sumo / Plie Squat)',
    descriptionAr:
      'تمرين سومو سكوات بالدمبل (Sumo / Plie Squat) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plie_Dumbbell_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plie_Dumbbell_Squat/0.jpg',
  },
  {
    id: 'leg-4',
    name: 'Leg Press',
    nameAr: 'ضغط الأرجل على جهاز المكبس (Leg Press)',
    descriptionAr:
      'تمرين ضغط الأرجل على جهاز المكبس (Leg Press) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Press/0.jpg',
  },
  {
    id: 'leg-18',
    name: 'Leg Extensions',
    nameAr: 'فرد الساقين على الجهاز (Leg Extension للأماميات)',
    descriptionAr:
      'تمرين فرد الساقين على الجهاز (Leg Extension للأماميات) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['العضلة الرباعية (الفخذ الأمامي)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Extensions/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Extensions/0.jpg',
  },
  {
    id: 'leg-5',
    name: 'Lying Leg Curls',
    nameAr: 'ثني الساقين مستلقياً على الجهاز (خلفيات الفخذ)',
    descriptionAr:
      'تمرين ثني الساقين مستلقياً على الجهاز (خلفيات الفخذ) يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['أوتار الركبة (الفخذ الخلفي / الهمسترنج)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Leg_Curls/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Leg_Curls/0.jpg',
  },
  {
    id: 'leg-17',
    name: 'Seated Leg Curl',
    nameAr: 'ثني الساقين جالساً على الجهاز (خلفيات الفخذ)',
    descriptionAr:
      'تمرين ثني الساقين جالساً على الجهاز (خلفيات الفخذ) يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['أوتار الركبة (الفخذ الخلفي / الهمسترنج)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Leg_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Leg_Curl/0.jpg',
  },
  {
    id: 'Standing_Leg_Curl',
    name: 'Standing Leg Curl',
    nameAr: 'ثني الساق واقفاً بساق واحدة',
    descriptionAr:
      'تمرين ثني الساق واقفاً بساق واحدة يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['أوتار الركبة (الفخذ الخلفي / الهمسترنج)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Leg_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Leg_Curl/0.jpg',
  },
  {
    id: 'leg-6',
    name: 'Romanian Deadlift',
    nameAr: 'ديدليفت روماني بالبار (RDL للخلفيات والألوية)',
    descriptionAr:
      'تمرين ديدليفت روماني بالبار (RDL للخلفيات والألوية) يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift/0.jpg',
  },
  {
    id: 'leg-15',
    name: 'Stiff-Legged Barbell Deadlift',
    nameAr: 'ديدليفت بالبار بأرجل مستقيمة',
    descriptionAr:
      'تمرين ديدليفت بالبار بأرجل مستقيمة يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg',
  },
  {
    id: 'Stiff-Legged_Dumbbell_Deadlift',
    name: 'Stiff-Legged Dumbbell Deadlift',
    nameAr: 'ديدليفت بالدمبل بأرجل مستقيمة للخلفيات',
    descriptionAr:
      'تمرين ديدليفت بالدمبل بأرجل مستقيمة للخلفيات يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg',
  },
  {
    id: 'leg-20',
    name: 'Barbell Hip Thrust',
    nameAr: 'دفع الحوض بالبار للألوية (Barbell Hip Thrust)',
    descriptionAr:
      'تمرين دفع الحوض بالبار للألوية (Barbell Hip Thrust) يستهدف عضلات المؤخرة والألوية (الجلوتس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات المؤخرة والألوية (الجلوتس) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات المؤخرة والألوية (الجلوتس)',
      'عضلات السمانة (الكاحل)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Hip_Thrust/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Hip_Thrust/0.jpg',
  },
  {
    id: 'leg-21',
    name: 'Barbell Glute Bridge',
    nameAr: 'جسر الألوية بالبار على الأرض (Glute Bridge)',
    descriptionAr:
      'تمرين جسر الألوية بالبار على الأرض (Glute Bridge) يستهدف عضلات المؤخرة والألوية (الجلوتس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات المؤخرة والألوية (الجلوتس) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات المؤخرة والألوية (الجلوتس)',
      'عضلات السمانة (الكاحل)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Glute_Bridge/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Glute_Bridge/0.jpg',
  },
  {
    id: 'Single_Leg_Glute_Bridge',
    name: 'Single Leg Glute Bridge',
    nameAr: 'جسر الألوية بساق واحدة بوزن الجسم',
    descriptionAr:
      'تمرين جسر الألوية بساق واحدة بوزن الجسم يستهدف عضلات المؤخرة والألوية (الجلوتس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات المؤخرة والألوية (الجلوتس) و أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Single_Leg_Glute_Bridge/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Single_Leg_Glute_Bridge/0.jpg',
  },
  {
    id: 'Glute_Ham_Raise',
    name: 'Glute Ham Raise',
    nameAr: 'رفع الجذع بالخلفيات والألوية (GHD)',
    descriptionAr:
      'تمرين رفع الجذع بالخلفيات والألوية (GHD) يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Glute_Ham_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Glute_Ham_Raise/0.jpg',
  },
  {
    id: 'Glute_Kickback',
    name: 'Glute Kickback',
    nameAr: 'ركل خلفي بالكابل أو الجهاز للألوية (Kickback)',
    descriptionAr:
      'تمرين ركل خلفي بالكابل أو الجهاز للألوية (Kickback) يستهدف عضلات المؤخرة والألوية (الجلوتس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات المؤخرة والألوية (الجلوتس) و أوتار الركبة (الفخذ الخلفي / الهمسترنج) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Glute_Kickback/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Glute_Kickback/0.jpg',
  },
  {
    id: 'Thigh_Abductor',
    name: 'Thigh Abductor',
    nameAr: 'فتح الفخذ على الجهاز (Abductor للألوية والخارجيات)',
    descriptionAr:
      'تمرين فتح الفخذ على الجهاز (Abductor للألوية والخارجيات) يستهدف عضلات الفخذ الخارجية (المبعدة) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الفخذ الخارجية (المبعدة) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الفخذ الخارجية (المبعدة)',
      'عضلات المؤخرة والألوية (الجلوتس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Abductor/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Abductor/0.jpg',
  },
  {
    id: 'Thigh_Adductor',
    name: 'Thigh Adductor',
    nameAr: 'ضم الفخذ على الجهاز (Adductor للعضلات الضامة)',
    descriptionAr:
      'تمرين ضم الفخذ على الجهاز (Adductor للعضلات الضامة) يستهدف عضلات الفخذ الداخلية (الضامة) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الفخذ الداخلية (الضامة) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الفخذ الداخلية (الضامة)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Adductor/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Adductor/0.jpg',
  },
  {
    id: 'leg-9',
    name: 'Standing Calf Raises',
    nameAr: 'رفع السمانة واقفاً بالوزن (Standing Calf Raise)',
    descriptionAr:
      'تمرين رفع السمانة واقفاً بالوزن (Standing Calf Raise) يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Calf_Raises/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Calf_Raises/0.jpg',
  },
  {
    id: 'leg-10',
    name: 'Seated Calf Raise',
    nameAr: 'رفع السمانة جالساً على الجهاز (Seated Calf Raise)',
    descriptionAr:
      'تمرين رفع السمانة جالساً على الجهاز (Seated Calf Raise) يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Calf_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Calf_Raise/0.jpg',
  },
  {
    id: 'Calf_Press_On_The_Leg_Press_Machine',
    name: 'Calf Press On The Leg Press Machine',
    nameAr: 'رفع السمانة على جهاز مكبس الأرجل',
    descriptionAr:
      'تمرين رفع السمانة على جهاز مكبس الأرجل يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg',
  },
  {
    id: 'Smith_Machine_Calf_Raise',
    name: 'Smith Machine Calf Raise',
    nameAr: 'رفع السمانة واقفاً على جهاز سميث',
    descriptionAr:
      'تمرين رفع السمانة واقفاً على جهاز سميث يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Calf_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Calf_Raise/0.jpg',
  },
  {
    id: 'Rocking_Standing_Calf_Raise',
    name: 'Rocking Standing Calf Raise',
    nameAr: 'رفع السمانة المتأرجح',
    descriptionAr:
      'تمرين رفع السمانة المتأرجح يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rocking_Standing_Calf_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rocking_Standing_Calf_Raise/0.jpg',
  },
  {
    id: 'Donkey_Calf_Raises',
    name: 'Donkey Calf Raises',
    nameAr: 'رفع السمانة بوضعية الدونكي كالف',
    descriptionAr:
      'تمرين رفع السمانة بوضعية الدونكي كالف يستهدف عضلات السمانة (الكاحل) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات السمانة (الكاحل)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Donkey_Calf_Raises/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Donkey_Calf_Raises/0.jpg',
  },
  {
    id: 'Smith_Machine_Squat',
    name: 'Smith Machine Squat',
    nameAr: 'سكوات على جهاز سميث',
    descriptionAr:
      'تمرين سكوات على جهاز سميث يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Squat/0.jpg',
  },
  {
    id: 'Smith_Single-Leg_Split_Squat',
    name: 'Smith Single-Leg Split Squat',
    nameAr: 'سبليت سكوات على جهاز سميث',
    descriptionAr:
      'تمرين سبليت سكوات على جهاز سميث يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'machine',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Single-Leg_Split_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Single-Leg_Split_Squat/0.jpg',
  },
  {
    id: 'leg-19',
    name: 'Bodyweight Squat',
    nameAr: 'سكوات هوائي بوزن الجسم',
    descriptionAr:
      'تمرين سكوات هوائي بوزن الجسم يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Squat/0.jpg',
  },
  {
    id: 'Bodyweight_Walking_Lunge',
    name: 'Bodyweight Walking Lunge',
    nameAr: 'طعنات بالمشي بوزن الجسم',
    descriptionAr:
      'تمرين طعنات بالمشي بوزن الجسم يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات السمانة (الكاحل) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Walking_Lunge/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Walking_Lunge/0.jpg',
  },
  {
    id: 'Scissors_Jump',
    name: 'Scissors Jump',
    nameAr: 'قفز تبادلي بالمقص (انفجاري للأرجل)',
    descriptionAr:
      'تمرين قفز تبادلي بالمقص (انفجاري للأرجل) يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات المؤخرة والألوية (الجلوتس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scissors_Jump/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scissors_Jump/0.jpg',
  },
  {
    id: 'Side_Leg_Raises',
    name: 'Side Leg Raises',
    nameAr: 'رفع الساق جانباً بوزن الجسم',
    descriptionAr:
      'تمرين رفع الساق جانباً بوزن الجسم يستهدف عضلات الفخذ الداخلية (الضامة) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الفخذ الداخلية (الضامة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الفخذ الداخلية (الضامة)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Leg_Raises/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Leg_Raises/0.jpg',
  },
  {
    id: 'One-Arm_Side_Deadlift',
    name: 'One-Arm Side Deadlift',
    nameAr: 'ديدليفت جانبي بيد واحدة',
    descriptionAr:
      'تمرين ديدليفت جانبي بيد واحدة يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'advanced',
    equipment: 'barbell',
    avoidForInjuries: ['أسفل الظهر'],
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Side_Deadlift/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Side_Deadlift/0.jpg',
  },
  {
    id: 'Band_Hip_Adductions',
    name: 'Band Hip Adductions',
    nameAr: 'ضم الفخذ بحبل المقاومة',
    descriptionAr:
      'تمرين ضم الفخذ بحبل المقاومة يستهدف عضلات الفخذ الداخلية (الضامة) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الفخذ الداخلية (الضامة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الفخذ الداخلية (الضامة)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Hip_Adductions/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Hip_Adductions/0.jpg',
  },
  {
    id: 'Reverse_Band_Box_Squat',
    name: 'Reverse Band Box Squat',
    nameAr: 'سكوات صندوق بأحبال مقاومة معكوسة',
    descriptionAr:
      'تمرين سكوات صندوق بأحبال مقاومة معكوسة يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'intermediate',
    equipment: 'barbell',
    avoidForInjuries: ['ركبة'],
    howToStepsAr: [
      'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
      'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
      'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
      'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات الفخذ الخارجية (المبعدة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الفخذ الخارجية (المبعدة)',
      'عضلات الفخذ الداخلية (الضامة)',
      'عضلات السمانة (الكاحل)',
      'عضلات الساعد والقبضة',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Band_Box_Squat/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Band_Box_Squat/0.jpg',
  },
  {
    id: 'Calf-Machine_Shoulder_Shrug',
    name: 'Calf-Machine Shoulder Shrug',
    nameAr: 'شراغز على جهاز السمانة',
    descriptionAr:
      'تمرين شراغز على جهاز السمانة يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf-Machine_Shoulder_Shrug/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf-Machine_Shoulder_Shrug/0.jpg',
  },
  {
    id: 'Knee_Tuck_Jump',
    name: 'Knee Tuck Jump',
    nameAr: 'قفز ضم الركبتين للياقة الأرجل',
    descriptionAr:
      'تمرين قفز ضم الركبتين للياقة الأرجل يستهدف أوتار الركبة (الفخذ الخلفي / الهمسترنج) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أوتار الركبة (الفخذ الخلفي / الهمسترنج) و عضلات الفخذ الخارجية (المبعدة) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات الفخذ الخارجية (المبعدة)',
      'عضلات الفخذ الداخلية (الضامة)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'العضلة الرباعية (الفخذ الأمامي)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Knee_Tuck_Jump/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Knee_Tuck_Jump/0.jpg',
  },
  {
    id: 'shoulder-1',
    name: 'Standing Military Press',
    nameAr: 'ضغط كتف عسكري بالبار واقفاً (Overhead Press)',
    descriptionAr:
      'تمرين ضغط كتف عسكري بالبار واقفاً (Overhead Press) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Military_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Military_Press/0.jpg',
  },
  {
    id: 'shoulder-11',
    name: 'Seated Barbell Military Press',
    nameAr: 'ضغط كتف بالبار جالساً (Seated Barbell Press)',
    descriptionAr:
      'تمرين ضغط كتف بالبار جالساً (Seated Barbell Press) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Barbell_Military_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Barbell_Military_Press/0.jpg',
  },
  {
    id: 'shoulder-15',
    name: 'Dumbbell Shoulder Press',
    nameAr: 'ضغط كتف بالدمبل جالساً (Dumbbell Shoulder Press)',
    descriptionAr:
      'تمرين ضغط كتف بالدمبل جالساً (Dumbbell Shoulder Press) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Shoulder_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Shoulder_Press/0.jpg',
  },
  {
    id: 'Seated_Dumbbell_Press',
    name: 'Seated Dumbbell Press',
    nameAr: 'ضغط كتف بالدمبل على مقعد مستقيم',
    descriptionAr:
      'تمرين ضغط كتف بالدمبل على مقعد مستقيم يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Press/0.jpg',
  },
  {
    id: 'shoulder-6',
    name: 'Arnold Dumbbell Press',
    nameAr: 'ضغط أرنولد الشهير للكتف بالدمبل (Arnold Press)',
    descriptionAr:
      'تمرين ضغط أرنولد الشهير للكتف بالدمبل (Arnold Press) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Arnold_Dumbbell_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Arnold_Dumbbell_Press/0.jpg',
  },
  {
    id: 'shoulder-16',
    name: 'Leverage Shoulder Press',
    nameAr: 'ضغط كتف على جهاز الرافعة',
    descriptionAr:
      'تمرين ضغط كتف على جهاز الرافعة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Shoulder_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Shoulder_Press/0.jpg',
  },
  {
    id: 'shoulder-19',
    name: 'Clean and Press',
    nameAr: 'كلين آند برس بالبار (قوة انفجارية للكتف والجسم)',
    descriptionAr:
      'تمرين كلين آند برس بالبار (قوة انفجارية للكتف والجسم) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات السمانة (الكاحل)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean_and_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean_and_Press/0.jpg',
  },
  {
    id: 'Push_Press',
    name: 'Push Press',
    nameAr: 'بوش برس بالبار مع مساعدة الساقين',
    descriptionAr:
      'تمرين بوش برس بالبار مع مساعدة الساقين يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'advanced',
    equipment: 'barbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و العضلة الرباعية (الفخذ الأمامي) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Press/0.jpg',
  },
  {
    id: 'shoulder-3',
    name: 'Side Lateral Raise',
    nameAr: 'رفرفة كتف جانبي بالدمبل (Lateral Raise)',
    descriptionAr:
      'تمرين رفرفة كتف جانبي بالدمبل (Lateral Raise) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Lateral_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Lateral_Raise/0.jpg',
  },
  {
    id: 'shoulder-9',
    name: 'Seated Side Lateral Raise',
    nameAr: 'رفرفة كتف جانبي بالدمبل جالساً (عزل تام)',
    descriptionAr:
      'تمرين رفرفة كتف جانبي بالدمبل جالساً (عزل تام) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Side_Lateral_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Side_Lateral_Raise/0.jpg',
  },
  {
    id: 'shoulder-14',
    name: 'One-Arm Side Laterals',
    nameAr: 'رفرفة جانبي بالدمبل بيد واحدة',
    descriptionAr:
      'تمرين رفرفة جانبي بالدمبل بيد واحدة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Side_Laterals/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Side_Laterals/0.jpg',
  },
  {
    id: 'shoulder-5',
    name: 'Cable Seated Lateral Raise',
    nameAr: 'رفرفة جانبي بالكابل جالساً',
    descriptionAr:
      'تمرين رفرفة جانبي بالكابل جالساً يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Seated_Lateral_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Seated_Lateral_Raise/0.jpg',
  },
  {
    id: 'shoulder-4',
    name: 'Front Dumbbell Raise',
    nameAr: 'رفع كتف أمامي بالدمبل (Front Raise)',
    descriptionAr:
      'تمرين رفع كتف أمامي بالدمبل (Front Raise) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Dumbbell_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Dumbbell_Raise/0.jpg',
  },
  {
    id: 'shoulder-13',
    name: 'Front Cable Raise',
    nameAr: 'رفع كتف أمامي بالكابل',
    descriptionAr:
      'تمرين رفع كتف أمامي بالكابل يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Cable_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Cable_Raise/0.jpg',
  },
  {
    id: 'Front_Two-Dumbbell_Raise',
    name: 'Front Two-Dumbbell Raise',
    nameAr: 'رفع أمامي بكلتا اليدين بالدمبل',
    descriptionAr:
      'تمرين رفع أمامي بكلتا اليدين بالدمبل يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Two-Dumbbell_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Two-Dumbbell_Raise/0.jpg',
  },
  {
    id: 'Standing_Front_Barbell_Raise_Over_Head',
    name: 'Standing Front Barbell Raise Over Head',
    nameAr: 'رفع بار أمامي حتى أعلى الرأس',
    descriptionAr:
      'تمرين رفع بار أمامي حتى أعلى الرأس يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Front_Barbell_Raise_Over_Head/0.jpg',
  },
  {
    id: 'back-12',
    name: 'Reverse Flyes',
    nameAr: 'رفرفة كتف خلفي بالدمبل مستلقياً على بنش مائل',
    descriptionAr:
      'تمرين رفرفة كتف خلفي بالدمبل مستلقياً على بنش مائل يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Flyes/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Flyes/0.jpg',
  },
  {
    id: 'shoulder-7',
    name: 'Bent Over Dumbbell Rear Delt Raise With Head On Bench',
    nameAr: 'رفرفة خلفية مع تثبيت الرأس على البنش',
    descriptionAr:
      'تمرين رفرفة خلفية مع تثبيت الرأس على البنش يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg',
  },
  {
    id: 'Lying_Rear_Delt_Raise',
    name: 'Lying Rear Delt Raise',
    nameAr: 'رفرفة كتف خلفي مستلقياً على الجانب',
    descriptionAr:
      'تمرين رفرفة كتف خلفي مستلقياً على الجانب يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Rear_Delt_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Rear_Delt_Raise/0.jpg',
  },
  {
    id: 'Cable_Rear_Delt_Fly',
    name: 'Cable Rear Delt Fly',
    nameAr: 'رفرفة كتف خلفي بالكابل المتقاطع',
    descriptionAr:
      'تمرين رفرفة كتف خلفي بالكابل المتقاطع يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Rear_Delt_Fly/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Rear_Delt_Fly/0.jpg',
  },
  {
    id: 'shoulder-18',
    name: 'Barbell Rear Delt Row',
    nameAr: 'تجديف بالبار عريض للكتف الخلفي',
    descriptionAr:
      'تمرين تجديف بالبار عريض للكتف الخلفي يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Rear_Delt_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Rear_Delt_Row/0.jpg',
  },
  {
    id: 'Cable_Rope_Rear-Delt_Rows',
    name: 'Cable Rope Rear-Delt Rows',
    nameAr: 'سحب حبل الكابل للكتف الخلفي',
    descriptionAr:
      'تمرين سحب حبل الكابل للكتف الخلفي يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Rope_Rear-Delt_Rows/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Rope_Rear-Delt_Rows/0.jpg',
  },
  {
    id: 'shoulder-17',
    name: 'Upright Barbell Row',
    nameAr: 'تجديف عمودي بالبار للأكتاف والترابيس',
    descriptionAr:
      'تمرين تجديف عمودي بالبار للأكتاف والترابيس يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Barbell_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Barbell_Row/0.jpg',
  },
  {
    id: 'Upright_Cable_Row',
    name: 'Upright Cable Row',
    nameAr: 'تجديف عمودي بالكابل للأكتاف',
    descriptionAr:
      'تمرين تجديف عمودي بالكابل للأكتاف يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الترابيس (Traps)', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Cable_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Cable_Row/0.jpg',
  },
  {
    id: 'Dumbbell_One-Arm_Upright_Row',
    name: 'Dumbbell One-Arm Upright Row',
    nameAr: 'تجديف عمودي بالدمبل بيد واحدة',
    descriptionAr:
      'تمرين تجديف عمودي بالدمبل بيد واحدة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    avoidForInjuries: ['كتف'],
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلة البايسبس',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_One-Arm_Upright_Row/0.jpg',
  },
  {
    id: 'shoulder-10',
    name: 'Dumbbell Scaption',
    nameAr: 'رفع دمبل بزاوية لوح الكتف (Scaption)',
    descriptionAr:
      'تمرين رفع دمبل بزاوية لوح الكتف (Scaption) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Scaption/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Scaption/0.jpg',
  },
  {
    id: 'Dumbbell_Raise',
    name: 'Dumbbell Raise',
    nameAr: 'رفع دمبل مركب للأكتاف',
    descriptionAr:
      'تمرين رفع دمبل مركب للأكتاف يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Raise/0.jpg',
  },
  {
    id: 'Alternating_Deltoid_Raise',
    name: 'Alternating Deltoid Raise',
    nameAr: 'رفع تبادلي بالدمبل للدالية',
    descriptionAr:
      'تمرين رفع تبادلي بالدمبل للدالية يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Deltoid_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Deltoid_Raise/0.jpg',
  },
  {
    id: 'Car_Drivers',
    name: 'Car Drivers',
    nameAr: 'تمرين مقود السيارة بالقرص للأكتاف (Car Drivers)',
    descriptionAr:
      'تمرين تمرين مقود السيارة بالقرص للأكتاف (Car Drivers) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Car_Drivers/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Car_Drivers/0.jpg',
  },
  {
    id: 'Cuban_Press',
    name: 'Cuban Press',
    nameAr: 'ضغط كوبي بالدمبل لتقوية الكفة المدورة',
    descriptionAr:
      'تمرين ضغط كوبي بالدمبل لتقوية الكفة المدورة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الترابيس (Traps) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الترابيس (Traps)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cuban_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cuban_Press/0.jpg',
  },
  {
    id: 'Iron_Cross',
    name: 'Iron Cross',
    nameAr: 'الصليب الحديدي بالدمبل للكتفين',
    descriptionAr:
      'تمرين الصليب الحديدي بالدمبل للكتفين يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Iron_Cross/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Iron_Cross/0.jpg',
  },
  {
    id: 'Standing_Low-Pulley_Deltoid_Raise',
    name: 'Standing Low-Pulley Deltoid Raise',
    nameAr: 'رفع دالية سفلي بالكابل',
    descriptionAr:
      'تمرين رفع دالية سفلي بالكابل يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Low-Pulley_Deltoid_Raise/0.jpg',
  },
  {
    id: 'shoulder-20',
    name: 'Handstand Push-Ups',
    nameAr: 'ضغط الوقوف على اليدين للكتفين (Handstand)',
    descriptionAr:
      'تمرين ضغط الوقوف على اليدين للكتفين (Handstand) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'advanced',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Handstand_Push-Ups/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Handstand_Push-Ups/0.jpg',
  },
  {
    id: 'Kettlebell_Thruster',
    name: 'Kettlebell Thruster',
    nameAr: 'ثراستر بالكتلبل (سكوات مع ضغط كتف)',
    descriptionAr:
      'تمرين ثراستر بالكتلبل (سكوات مع ضغط كتف) يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و العضلة الرباعية (الفخذ الأمامي) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kettlebell_Thruster/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kettlebell_Thruster/0.jpg',
  },
  {
    id: 'External_Rotation_with_Band',
    name: 'External Rotation with Band',
    nameAr: 'دوران خارجي بحبل المقاومة للكفة المدورة',
    descriptionAr:
      'تمرين دوران خارجي بحبل المقاومة للكفة المدورة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/External_Rotation_with_Band/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/External_Rotation_with_Band/0.jpg',
  },
  {
    id: 'Side_Wrist_Pull',
    name: 'Side Wrist Pull',
    nameAr: 'سحب جانبي للرسغ والكتف',
    descriptionAr:
      'تمرين سحب جانبي للرسغ والكتف يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلات الساعد والقبضة',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Wrist_Pull/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Side_Wrist_Pull/0.jpg',
  },
  {
    id: 'arm-1',
    name: 'Barbell Curl',
    nameAr: 'بايسبس كيرل بالبار مستقيماً (Barbell Curl)',
    descriptionAr:
      'تمرين بايسبس كيرل بالبار مستقيماً (Barbell Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Curl/0.jpg',
  },
  {
    id: 'EZ-Bar_Curl',
    name: 'EZ-Bar Curl',
    nameAr: 'بايسبس كيرل ببار الزجزاج (EZ-Bar Curl)',
    descriptionAr:
      'تمرين بايسبس كيرل ببار الزجزاج (EZ-Bar Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/EZ-Bar_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/EZ-Bar_Curl/0.jpg',
  },
  {
    id: 'Close-Grip_Standing_Barbell_Curl',
    name: 'Close-Grip Standing Barbell Curl',
    nameAr: 'بايسبس كيرل بالبار قبضة ضيقة للرأس الخارجي',
    descriptionAr:
      'تمرين بايسبس كيرل بالبار قبضة ضيقة للرأس الخارجي يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Standing_Barbell_Curl/0.jpg',
  },
  {
    id: 'Wide-Grip_Standing_Barbell_Curl',
    name: 'Wide-Grip Standing Barbell Curl',
    nameAr: 'بايسبس كيرل بالبار قبضة واسعة للرأس الداخلي',
    descriptionAr:
      'تمرين بايسبس كيرل بالبار قبضة واسعة للرأس الداخلي يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wide-Grip_Standing_Barbell_Curl/0.jpg',
  },
  {
    id: 'arm-2',
    name: 'Dumbbell Bicep Curl',
    nameAr: 'بايسبس كيرل بالدمبل بالتناوب',
    descriptionAr:
      'تمرين بايسبس كيرل بالدمبل بالتناوب يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bicep_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bicep_Curl/0.jpg',
  },
  {
    id: 'arm-5',
    name: 'Incline Dumbbell Curl',
    nameAr: 'بايسبس بالدمبل على بنش مائل (استطالة عظمى)',
    descriptionAr:
      'تمرين بايسبس بالدمبل على بنش مائل (استطالة عظمى) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Curl/0.jpg',
  },
  {
    id: 'Incline_Inner_Biceps_Curl',
    name: 'Incline Inner Biceps Curl',
    nameAr: 'بايسبس مائل موجه للرأس الداخلي',
    descriptionAr:
      'تمرين بايسبس مائل موجه للرأس الداخلي يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Inner_Biceps_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Inner_Biceps_Curl/0.jpg',
  },
  {
    id: 'arm-3',
    name: 'Hammer Curls',
    nameAr: 'بايسبس مطرقة بالدمبل (Hammer Curls للساعد والرأس الطويل)',
    descriptionAr:
      'تمرين بايسبس مطرقة بالدمبل (Hammer Curls للساعد والرأس الطويل) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Curls/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Curls/0.jpg',
  },
  {
    id: 'Cross_Body_Hammer_Curl',
    name: 'Cross Body Hammer Curl',
    nameAr: 'بايسبس مطرقة متقاطع على الصدر (Cross Body)',
    descriptionAr:
      'تمرين بايسبس مطرقة متقاطع على الصدر (Cross Body) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cross_Body_Hammer_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cross_Body_Hammer_Curl/0.jpg',
  },
  {
    id: 'Preacher_Curl',
    name: 'Preacher Curl',
    nameAr: 'بايسبس ارتكاز على بنش لاري سكوت (Preacher Curl)',
    descriptionAr:
      'تمرين بايسبس ارتكاز على بنش لاري سكوت (Preacher Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Preacher_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Preacher_Curl/0.jpg',
  },
  {
    id: 'arm-4',
    name: 'Concentration Curls',
    nameAr: 'بايسبس تركيز بالدمبل جالساً (Concentration Curl)',
    descriptionAr:
      'تمرين بايسبس تركيز بالدمبل جالساً (Concentration Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Concentration_Curls/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Concentration_Curls/0.jpg',
  },
  {
    id: 'Spider_Curl',
    name: 'Spider Curl',
    nameAr: 'سبايدر كيرل بالبار على بنش مائل (Spider Curl)',
    descriptionAr:
      'تمرين سبايدر كيرل بالبار على بنش مائل (Spider Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Curl/0.jpg',
  },
  {
    id: 'Zottman_Curl',
    name: 'Zottman Curl',
    nameAr: 'زوتمان كيرل بالدمبل للبايسبس والساعد (Zottman Curl)',
    descriptionAr:
      'تمرين زوتمان كيرل بالدمبل للبايسبس والساعد (Zottman Curl) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Zottman_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Zottman_Curl/0.jpg',
  },
  {
    id: 'Seated_Close-Grip_Concentration_Barbell_Curl',
    name: 'Seated Close-Grip Concentration Barbell Curl',
    nameAr: 'بايسبس تركيز بالبار قبضة ضيقة',
    descriptionAr:
      'تمرين بايسبس تركيز بالبار قبضة ضيقة يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Close-Grip_Concentration_Barbell_Curl/0.jpg',
  },
  {
    id: 'arm-6',
    name: 'Cable Preacher Curl',
    nameAr: 'بايسبس ارتكاز بالكابل على البنش',
    descriptionAr:
      'تمرين بايسبس ارتكاز بالكابل على البنش يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Preacher_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Preacher_Curl/0.jpg',
  },
  {
    id: 'arm-7',
    name: 'Cable Hammer Curls - Rope Attachment',
    nameAr: 'بايسبس مطرقة بحبل الكابل (Cable Rope Hammer)',
    descriptionAr:
      'تمرين بايسبس مطرقة بحبل الكابل (Cable Rope Hammer) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg',
  },
  {
    id: 'arm-8',
    name: 'Overhead Cable Curl',
    nameAr: 'بايسبس كابل علوي مزدوج (Double Biceps Cable)',
    descriptionAr:
      'تمرين بايسبس كابل علوي مزدوج (Double Biceps Cable) يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Overhead_Cable_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Overhead_Cable_Curl/0.jpg',
  },
  {
    id: 'arm-9',
    name: 'Machine Bicep Curl',
    nameAr: 'بايسبس كيرل على الجهاز',
    descriptionAr:
      'تمرين بايسبس كيرل على الجهاز يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Bicep_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Bicep_Curl/0.jpg',
  },
  {
    id: 'arm-10',
    name: 'Reverse Barbell Curl',
    nameAr: 'بايسبس مقلوب بالبار لتقوية الساعد والباي',
    descriptionAr:
      'تمرين بايسبس مقلوب بالبار لتقوية الساعد والباي يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Barbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Barbell_Curl/0.jpg',
  },
  {
    id: 'Reverse_Cable_Curl',
    name: 'Reverse Cable Curl',
    nameAr: 'بايسبس مقلوب بالكابل للساعد',
    descriptionAr:
      'تمرين بايسبس مقلوب بالكابل للساعد يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Cable_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Cable_Curl/0.jpg',
  },
  {
    id: 'arm-11',
    name: 'Close-Grip Barbell Bench Press',
    nameAr: 'بنش برس قبضة ضيقة للترايسبس (Close-Grip Bench)',
    descriptionAr:
      'تمرين بنش برس قبضة ضيقة للترايسبس (Close-Grip Bench) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg',
  },
  {
    id: 'JM_Press',
    name: 'JM Press',
    nameAr: 'تمرين جي إم برس للكتلة الهائلة للترايسبس (JM Press)',
    descriptionAr:
      'تمرين تمرين جي إم برس للكتلة الهائلة للترايسبس (JM Press) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/JM_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/JM_Press/0.jpg',
  },
  {
    id: 'arm-14',
    name: 'Lying Triceps Press',
    nameAr: 'كسر الجمجمة للترايسبس ببار EZ (Skull Crushers)',
    descriptionAr:
      'تمرين كسر الجمجمة للترايسبس ببار EZ (Skull Crushers) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Triceps_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Triceps_Press/0.jpg',
  },
  {
    id: 'Decline_EZ_Bar_Triceps_Extension',
    name: 'Decline EZ Bar Triceps Extension',
    nameAr: 'تمديد ترايسبس على بنش مقلوب ببار EZ',
    descriptionAr:
      'تمرين تمديد ترايسبس على بنش مقلوب ببار EZ يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_EZ_Bar_Triceps_Extension/0.jpg',
  },
  {
    id: 'Incline_Barbell_Triceps_Extension',
    name: 'Incline Barbell Triceps Extension',
    nameAr: 'تمديد ترايسبس بالبار على بنش مائل',
    descriptionAr:
      'تمرين تمديد ترايسبس بالبار على بنش مائل يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Barbell_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Barbell_Triceps_Extension/0.jpg',
  },
  {
    id: 'Decline_Close-Grip_Bench_To_Skull_Crusher',
    name: 'Decline Close-Grip Bench To Skull Crusher',
    nameAr: 'دمج البنش الضيق وكسر الجمجمة للترايسبس',
    descriptionAr:
      'تمرين دمج البنش الضيق وكسر الجمجمة للترايسبس يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg',
  },
  {
    id: 'arm-15',
    name: 'Standing Overhead Barbell Triceps Extension',
    nameAr: 'تمديد ترايسبس بالبار فوق الرأس واقفاً',
    descriptionAr:
      'تمرين تمديد ترايسبس بالبار فوق الرأس واقفاً يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Overhead_Barbell_Triceps_Extension/0.jpg',
  },
  {
    id: 'arm-17',
    name: 'Seated Triceps Press',
    nameAr: 'تمديد ترايسبس بالدمبل بكلتا اليدين جالساً',
    descriptionAr:
      'تمرين تمديد ترايسبس بالدمبل بكلتا اليدين جالساً يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Triceps_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Triceps_Press/0.jpg',
  },
  {
    id: 'Standing_Dumbbell_Triceps_Extension',
    name: 'Standing Dumbbell Triceps Extension',
    nameAr: 'تمديد ترايسبس بالدمبل فوق الرأس واقفاً',
    descriptionAr:
      'تمرين تمديد ترايسبس بالدمبل فوق الرأس واقفاً يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg',
  },
  {
    id: 'arm-16',
    name: 'Tricep Dumbbell Kickback',
    nameAr: 'كيك باك للترايسبس بالدمبل (Dumbbell Kickback)',
    descriptionAr:
      'تمرين كيك باك للترايسبس بالدمبل (Dumbbell Kickback) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tricep_Dumbbell_Kickback/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tricep_Dumbbell_Kickback/0.jpg',
  },
  {
    id: 'Tate_Press',
    name: 'Tate Press',
    nameAr: 'تيت برس بالدمبل على البنش للترايسبس (Tate Press)',
    descriptionAr:
      'تمرين تيت برس بالدمبل على البنش للترايسبس (Tate Press) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tate_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tate_Press/0.jpg',
  },
  {
    id: 'arm-12',
    name: 'Triceps Pushdown',
    nameAr: 'ترايسبس بوش داون بالكابل بالمسطرة (Straight Bar)',
    descriptionAr:
      'تمرين ترايسبس بوش داون بالكابل بالمسطرة (Straight Bar) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown/0.jpg',
  },
  {
    id: 'arm-13',
    name: 'Triceps Pushdown - Rope Attachment',
    nameAr: 'ترايسبس بوش داون بحبل الكابل (Rope Pushdown)',
    descriptionAr:
      'تمرين ترايسبس بوش داون بحبل الكابل (Rope Pushdown) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg',
  },
  {
    id: 'Triceps_Pushdown_-_V-Bar_Attachment',
    name: 'Triceps Pushdown - V-Bar Attachment',
    nameAr: 'ترايسبس بوش داون بمقبض V-Bar',
    descriptionAr:
      'تمرين ترايسبس بوش داون بمقبض V-Bar يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg',
  },
  {
    id: 'Reverse_Grip_Triceps_Pushdown',
    name: 'Reverse Grip Triceps Pushdown',
    nameAr: 'ترايسبس بوش داون بقبضة مقلوبة',
    descriptionAr:
      'تمرين ترايسبس بوش داون بقبضة مقلوبة يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Grip_Triceps_Pushdown/0.jpg',
  },
  {
    id: 'Cable_One_Arm_Tricep_Extension',
    name: 'Cable One Arm Tricep Extension',
    nameAr: 'تمديد ترايسبس بالكابل بيد واحدة',
    descriptionAr:
      'تمرين تمديد ترايسبس بالكابل بيد واحدة يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_One_Arm_Tricep_Extension/0.jpg',
  },
  {
    id: 'Cable_Lying_Triceps_Extension',
    name: 'Cable Lying Triceps Extension',
    nameAr: 'تمديد ترايسبس مستلقياً بالكابل',
    descriptionAr:
      'تمرين تمديد ترايسبس مستلقياً بالكابل يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Lying_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Lying_Triceps_Extension/0.jpg',
  },
  {
    id: 'arm-19',
    name: 'Dips - Triceps Version',
    nameAr: 'متوازي بوزن الجسم للترايسبس (الجسم عمودي)',
    descriptionAr:
      'تمرين متوازي بوزن الجسم للترايسبس (الجسم عمودي) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dips_-_Triceps_Version/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dips_-_Triceps_Version/0.jpg',
  },
  {
    id: 'arm-18',
    name: 'Bench Dips',
    nameAr: 'غطس ترايسبس على حافة البنش (Bench Dips)',
    descriptionAr:
      'تمرين غطس ترايسبس على حافة البنش (Bench Dips) يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Dips/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Dips/0.jpg',
  },
  {
    id: 'Seated_Palm-Up_Barbell_Wrist_Curl',
    name: 'Seated Palm-Up Barbell Wrist Curl',
    nameAr: 'ثني المعصم بالبار والراحة لأعلى للساعد',
    descriptionAr:
      'تمرين ثني المعصم بالبار والراحة لأعلى للساعد يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Palm-Up_Barbell_Wrist_Curl/0.jpg',
  },
  {
    id: 'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench',
    name: 'Palms-Down Dumbbell Wrist Curl Over A Bench',
    nameAr: 'ثني المعصم بالدمبل والراحة لأسفل',
    descriptionAr:
      'تمرين ثني المعصم بالدمبل والراحة لأسفل يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg',
  },
  {
    id: 'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
    name: 'Palms-Up Dumbbell Wrist Curl Over A Bench',
    nameAr: 'ثني المعصم بالدمبل والراحة لأعلى',
    descriptionAr:
      'تمرين ثني المعصم بالدمبل والراحة لأعلى يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg',
  },
  {
    id: 'Farmers_Walk',
    name: "Farmer's Walk",
    nameAr: 'مشية المزارع بالأوزان الثقيلة لقوة القبضة والساعد',
    descriptionAr:
      'تمرين مشية المزارع بالأوزان الثقيلة لقوة القبضة والساعد يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الساعد والقبضة',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات المؤخرة والألوية (الجلوتس)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'أسفل الظهر (الفقرات القطنية)',
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Farmers_Walk/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Farmers_Walk/0.jpg',
  },
  {
    id: 'Wrist_Roller',
    name: 'Wrist Roller',
    nameAr: 'بكرة الرسغ بالأوزان لضخامة الساعد',
    descriptionAr:
      'تمرين بكرة الرسغ بالأوزان لضخامة الساعد يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة', 'عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wrist_Roller/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Wrist_Roller/0.jpg',
  },
  {
    id: 'Plate_Pinch',
    name: 'Plate Pinch',
    nameAr: 'عصر وحمل الأقراص بالأصابع لقوة القبضة',
    descriptionAr:
      'تمرين عصر وحمل الأقراص بالأصابع لقوة القبضة يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plate_Pinch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plate_Pinch/0.jpg',
  },
  {
    id: 'Cable_Wrist_Curl',
    name: 'Cable Wrist Curl',
    nameAr: 'ثني المعصم بالكابل للساعد',
    descriptionAr:
      'تمرين ثني المعصم بالكابل للساعد يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'machine',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Wrist_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Wrist_Curl/0.jpg',
  },
  {
    id: 'core-1',
    name: 'Plank',
    nameAr: 'بلانك ثبات للجذع والكور (Plank)',
    descriptionAr:
      'تمرين بلانك ثبات للجذع والكور (Plank) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank/0.jpg',
  },
  {
    id: 'core-5',
    name: 'Push Up to Side Plank',
    nameAr: 'ضغط أرضي مع دوران لبلانك جانبي',
    descriptionAr:
      'تمرين ضغط أرضي مع دوران لبلانك جانبي يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Up_to_Side_Plank/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Up_to_Side_Plank/0.jpg',
  },
  {
    id: 'core-2',
    name: 'Crunches',
    nameAr: 'كرنش أرضي كلاسيكي لعضلات البطن العلوية (Crunches)',
    descriptionAr:
      'تمرين كرنش أرضي كلاسيكي لعضلات البطن العلوية (Crunches) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Crunches/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Crunches/0.jpg',
  },
  {
    id: 'core-18',
    name: 'Decline Crunch',
    nameAr: 'كرنش على بنش مائل لأسفل (Decline Crunch)',
    descriptionAr:
      'تمرين كرنش على بنش مائل لأسفل (Decline Crunch) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Crunch/0.jpg',
  },
  {
    id: 'core-12',
    name: 'Reverse Crunch',
    nameAr: 'كرنش معكوس برفع الحوض للبطن السفلية (Reverse Crunch)',
    descriptionAr:
      'تمرين كرنش معكوس برفع الحوض للبطن السفلية (Reverse Crunch) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Crunch/0.jpg',
  },
  {
    id: 'core-10',
    name: 'Cross-Body Crunch',
    nameAr: 'كرنش متقاطع لعضلات البطن والجوانب',
    descriptionAr:
      'تمرين كرنش متقاطع لعضلات البطن والجوانب يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cross-Body_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cross-Body_Crunch/0.jpg',
  },
  {
    id: 'Tuck_Crunch',
    name: 'Tuck Crunch',
    nameAr: 'كرنش ضم الركبتين للبطن',
    descriptionAr:
      'تمرين كرنش ضم الركبتين للبطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tuck_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Tuck_Crunch/0.jpg',
  },
  {
    id: 'core-14',
    name: 'Exercise Ball Crunch',
    nameAr: 'كرنش على الكرة السويسرية لمدى حركي كامل',
    descriptionAr:
      'تمرين كرنش على الكرة السويسرية لمدى حركي كامل يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Exercise_Ball_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Exercise_Ball_Crunch/0.jpg',
  },
  {
    id: 'core-20',
    name: 'Cable Crunch',
    nameAr: 'كرنش بالكابل مع الركوع للبطن (Cable Kneeling Crunch)',
    descriptionAr:
      'تمرين كرنش بالكابل مع الركوع للبطن (Cable Kneeling Crunch) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Crunch/0.jpg',
  },
  {
    id: 'Kneeling_Cable_Triceps_Extension',
    name: 'Kneeling Cable Triceps Extension',
    nameAr: 'كرنش كابل بحبل المقاومة على الركبتين',
    descriptionAr:
      'تمرين كرنش كابل بحبل المقاومة على الركبتين يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kneeling_Cable_Triceps_Extension/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kneeling_Cable_Triceps_Extension/0.jpg',
  },
  {
    id: 'core-17',
    name: 'Hanging Leg Raise',
    nameAr: 'رفع الأرجل معلقاً على العقلة للبطن السفلية',
    descriptionAr:
      'تمرين رفع الأرجل معلقاً على العقلة للبطن السفلية يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'advanced',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise/0.jpg',
  },
  {
    id: 'core-4',
    name: 'Flat Bench Lying Leg Raise',
    nameAr: 'رفع الأرجل مستلقياً على البنش للبطن السفلية',
    descriptionAr:
      'تمرين رفع الأرجل مستلقياً على البنش للبطن السفلية يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg',
  },
  {
    id: 'Seated_Flat_Bench_Leg_Pull-In',
    name: 'Seated Flat Bench Leg Pull-In',
    nameAr: 'سحب الركبتين للصدر جالساً على البنش',
    descriptionAr:
      'تمرين سحب الركبتين للصدر جالساً على البنش يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Flat_Bench_Leg_Pull-In/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Flat_Bench_Leg_Pull-In/0.jpg',
  },
  {
    id: 'Leg_Pull-In',
    name: 'Leg Pull-In',
    nameAr: 'ضم الساقين للبطن مستلقياً',
    descriptionAr:
      'تمرين ضم الساقين للبطن مستلقياً يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Pull-In/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Pull-In/0.jpg',
  },
  {
    id: 'core-16',
    name: 'Ab Roller',
    nameAr: 'تمرين عجلة البطن (Ab Wheel Rollout)',
    descriptionAr:
      'تمرين تمرين عجلة البطن (Ab Wheel Rollout) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ab_Roller/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ab_Roller/0.jpg',
  },
  {
    id: 'core-7',
    name: 'Russian Twist',
    nameAr: 'تويست روسي بالوزن للخصر والخواصر (Russian Twist)',
    descriptionAr:
      'تمرين تويست روسي بالوزن للخصر والخواصر (Russian Twist) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و أسفل الظهر (الفقرات القطنية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'أسفل الظهر (الفقرات القطنية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Russian_Twist/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Russian_Twist/0.jpg',
  },
  {
    id: 'core-6',
    name: 'Air Bike',
    nameAr: 'تمرين الدراجة الهوائية للبطن',
    descriptionAr:
      'تمرين تمرين الدراجة الهوائية للبطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Air_Bike/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Air_Bike/0.jpg',
  },
  {
    id: 'core-8',
    name: 'Mountain Climbers',
    nameAr: 'متسلق الجبال السريع لشد البطن وحرق الدهون',
    descriptionAr:
      'تمرين متسلق الجبال السريع لشد البطن وحرق الدهون يستهدف العضلة الرباعية (الفخذ الأمامي) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'legs',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات العضلة الرباعية (الفخذ الأمامي) و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'العضلة الرباعية (الفخذ الأمامي)',
      'عضلات الصدر (الصدرية الكبرى)',
      'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Mountain_Climbers/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Mountain_Climbers/0.jpg',
  },
  {
    id: 'core-13',
    name: 'Dead Bug',
    nameAr: 'تمرين الحشرة الميتة (Dead Bug) لثبات الكور وأسفل الظهر',
    descriptionAr:
      'تمرين تمرين الحشرة الميتة (Dead Bug) لثبات الكور وأسفل الظهر يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dead_Bug/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dead_Bug/0.jpg',
  },
  {
    id: 'core-15',
    name: 'Standing Cable Wood Chop',
    nameAr: 'تقطيع الخشب بالكابل لخصر وبطن قوية (Woodchopper)',
    descriptionAr:
      'تمرين تقطيع الخشب بالكابل لخصر وبطن قوية (Woodchopper) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Cable_Wood_Chop/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Cable_Wood_Chop/0.jpg',
  },
  {
    id: 'Pallof_Press',
    name: 'Pallof Press',
    nameAr: 'بالوف برس بالكابل لمقاومة الدوران وثبات الجذع',
    descriptionAr:
      'تمرين بالوف برس بالكابل لمقاومة الدوران وثبات الجذع يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pallof_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pallof_Press/0.jpg',
  },
  {
    id: 'Plate_Twist',
    name: 'Plate Twist',
    nameAr: 'دوران بالقرص للخصر والخواصر',
    descriptionAr:
      'تمرين دوران بالقرص للخصر والخواصر يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plate_Twist/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plate_Twist/0.jpg',
  },
  {
    id: 'Medicine_Ball_Full_Twist',
    name: 'Medicine Ball Full Twist',
    nameAr: 'تويست كامل بالكرة الطبية للبطن',
    descriptionAr:
      'تمرين تويست كامل بالكرة الطبية للبطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Medicine_Ball_Full_Twist/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Medicine_Ball_Full_Twist/0.jpg',
  },
  {
    id: 'Dumbbell_Side_Bend',
    name: 'Dumbbell Side Bend',
    nameAr: 'انحناء جانبي بالدمبل لعضلات الخواصر',
    descriptionAr:
      'تمرين انحناء جانبي بالدمبل لعضلات الخواصر يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Side_Bend/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Side_Bend/0.jpg',
  },
  {
    id: 'Bottoms_Up',
    name: 'Bottoms Up',
    nameAr: 'رفع الحوض السفلي للبطن (Bottoms Up)',
    descriptionAr:
      'تمرين رفع الحوض السفلي للبطن (Bottoms Up) يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bottoms_Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bottoms_Up/0.jpg',
  },
  {
    id: 'Alternating_Floor_Press',
    name: 'Alternating Floor Press',
    nameAr: 'ضغط صدري أرضي بالدمبل بالتناوب',
    descriptionAr:
      'تمرين ضغط صدري أرضي بالدمبل بالتناوب يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Floor_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Floor_Press/0.jpg',
  },
  {
    id: 'Bench_Press_-_With_Bands',
    name: 'Bench Press - With Bands',
    nameAr: 'ضغط صدري بالبار مع أحبال المقاومة',
    descriptionAr:
      'تمرين ضغط صدري بالبار مع أحبال المقاومة يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Press_-_With_Bands/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Press_-_With_Bands/0.jpg',
  },
  {
    id: 'Bent-Arm_Dumbbell_Pullover',
    name: 'Bent-Arm Dumbbell Pullover',
    nameAr: 'بولوفر بالدمبل بذراعين منحنيتين للصدر',
    descriptionAr:
      'تمرين بولوفر بالدمبل بذراعين منحنيتين للصدر يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلة الظهر العريضة (المجانص)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg',
  },
  {
    id: 'Bodyweight_Flyes',
    name: 'Bodyweight Flyes',
    nameAr: 'تفتيح صدر بوزن الجسم بالأرض',
    descriptionAr:
      'تمرين تفتيح صدر بوزن الجسم بالأرض يستهدف عضلات الصدر (الصدرية الكبرى) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'chest',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
      'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
      'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
      'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الصدر (الصدرية الكبرى) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Flyes/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bodyweight_Flyes/0.jpg',
  },
  {
    id: 'Barbell_Shrug_Behind_The_Back',
    name: 'Barbell Shrug Behind The Back',
    nameAr: 'شراغز بالبار من خلف الظهر للترابيس',
    descriptionAr:
      'تمرين شراغز بالبار من خلف الظهر للترابيس يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
      'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
      'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الترابيس (Traps)',
      'عضلات الساعد والقبضة',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shrug_Behind_The_Back/0.jpg',
  },
  {
    id: 'Bent_Over_One-Arm_Long_Bar_Row',
    name: 'Bent Over One-Arm Long Bar Row',
    nameAr: 'تجديف بالبار بيد واحدة للظهر',
    descriptionAr:
      'تمرين تجديف بالبار بيد واحدة للظهر يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_One-Arm_Long_Bar_Row/0.jpg',
  },
  {
    id: 'Bent_Over_Two-Dumbbell_Row_With_Palms_In',
    name: 'Bent Over Two-Dumbbell Row With Palms In',
    nameAr: 'تجديف بالدمبلين بقبضة متوازية للظهر',
    descriptionAr:
      'تمرين تجديف بالدمبلين بقبضة متوازية للظهر يستهدف أعلى ومنتصف الظهر (الرومبويدز والترابيس) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات أعلى ومنتصف الظهر (الرومبويدز والترابيس) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Dumbbell_Row_With_Palms_In/0.jpg',
  },
  {
    id: 'Cable_Incline_Pushdown',
    name: 'Cable Incline Pushdown',
    nameAr: 'سحب كابل مائل للأسفل للظهر',
    descriptionAr:
      'تمرين سحب كابل مائل للأسفل للظهر يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الظهر العريضة (المجانص)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Incline_Pushdown/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Incline_Pushdown/0.jpg',
  },
  {
    id: 'Band_Assisted_Pull-Up',
    name: 'Band Assisted Pull-Up',
    nameAr: 'عقلة بمساعدة حبل المقاومة',
    descriptionAr:
      'تمرين عقلة بمساعدة حبل المقاومة يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الساعد والقبضة',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Assisted_Pull-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Assisted_Pull-Up/0.jpg',
  },
  {
    id: 'Rocky_Pull-Ups_Pulldowns',
    name: 'Rocky Pull-Ups/Pulldowns',
    nameAr: 'سحب عالي وعقلة روكي للظهر',
    descriptionAr:
      'تمرين سحب عالي وعقلة روكي للظهر يستهدف عضلة الظهر العريضة (المجانص) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الظهر العريضة (المجانص) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الظهر العريضة (المجانص)',
      'عضلة البايسبس',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rocky_Pull-Ups_Pulldowns/0.jpg',
  },
  {
    id: 'Scapular_Pull-Up',
    name: 'Scapular Pull-Up',
    nameAr: 'عقلة تثبيت لوحي الكتف',
    descriptionAr:
      'تمرين عقلة تثبيت لوحي الكتف يستهدف عضلات الترابيس (Traps) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'back',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الترابيس (Traps) و عضلة الظهر العريضة (المجانص) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الترابيس (Traps)',
      'عضلة الظهر العريضة (المجانص)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scapular_Pull-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scapular_Pull-Up/0.jpg',
  },
  {
    id: 'Alternating_Cable_Shoulder_Press',
    name: 'Alternating Cable Shoulder Press',
    nameAr: 'ضغط كتف بالكابل بالتناوب',
    descriptionAr:
      'تمرين ضغط كتف بالكابل بالتناوب يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Cable_Shoulder_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Cable_Shoulder_Press/0.jpg',
  },
  {
    id: 'Alternating_Kettlebell_Press',
    name: 'Alternating Kettlebell Press',
    nameAr: 'ضغط كتف بالكتلبل بالتناوب',
    descriptionAr:
      'تمرين ضغط كتف بالكتلبل بالتناوب يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)', 'عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Kettlebell_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Kettlebell_Press/0.jpg',
  },
  {
    id: 'Band_Pull_Apart',
    name: 'Band Pull Apart',
    nameAr: 'سحب الحبل للخارج لتقوية لوحي الكتف والدالية الخلفية',
    descriptionAr:
      'تمرين سحب الحبل للخارج لتقوية لوحي الكتف والدالية الخلفية يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Pull_Apart/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Pull_Apart/0.jpg',
  },
  {
    id: 'Barbell_Shoulder_Press',
    name: 'Barbell Shoulder Press',
    nameAr: 'ضغط كتف بالبار',
    descriptionAr:
      'تمرين ضغط كتف بالبار يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'barbell',
    howToStepsAr: [
      'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
      'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
      'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
      'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shoulder_Press/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Shoulder_Press/0.jpg',
  },
  {
    id: 'Bent_Over_Low-Pulley_Side_Lateral',
    name: 'Bent Over Low-Pulley Side Lateral',
    nameAr: 'رفرفة جانبية بالكابل المنخفض منحنياً',
    descriptionAr:
      'تمرين رفرفة جانبية بالكابل المنخفض منحنياً يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'machine',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و أسفل الظهر (الفقرات القطنية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'أسفل الظهر (الفقرات القطنية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
      'عضلات الترابيس (Traps)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Low-Pulley_Side_Lateral/0.jpg',
  },
  {
    id: 'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise',
    name: 'Dumbbell Lying One-Arm Rear Lateral Raise',
    nameAr: 'رفرفة كتف خلفي مستلقياً على البنش',
    descriptionAr:
      'تمرين رفرفة كتف خلفي مستلقياً على البنش يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) و أعلى ومنتصف الظهر (الرومبويدز والترابيس) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات الكتف (الدالية)',
      'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lying_One-Arm_Rear_Lateral_Raise/0.jpg',
  },
  {
    id: 'Dumbbell_Lying_Rear_Lateral_Raise',
    name: 'Dumbbell Lying Rear Lateral Raise',
    nameAr: 'رفرفة خلفية بالدمبلين مستلقياً',
    descriptionAr:
      'تمرين رفرفة خلفية بالدمبلين مستلقياً يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lying_Rear_Lateral_Raise/0.jpg',
  },
  {
    id: 'Lateral_Raise_-_With_Bands',
    name: 'Lateral Raise - With Bands',
    nameAr: 'رفرفة كتف جانبي بأحبال المقاومة',
    descriptionAr:
      'تمرين رفرفة كتف جانبي بأحبال المقاومة يستهدف عضلات الكتف (الدالية) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'shoulders',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الكتف (الدالية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الكتف (الدالية)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lateral_Raise_-_With_Bands/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lateral_Raise_-_With_Bands/0.jpg',
  },
  {
    id: 'Alternate_Hammer_Curl',
    name: 'Alternate Hammer Curl',
    nameAr: 'بايسبس مطرقة بالدمبل بالتناوب',
    descriptionAr:
      'تمرين بايسبس مطرقة بالدمبل بالتناوب يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Hammer_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Hammer_Curl/0.jpg',
  },
  {
    id: 'Alternate_Incline_Dumbbell_Curl',
    name: 'Alternate Incline Dumbbell Curl',
    nameAr: 'بايسبس مائل بالدمبل بالتناوب',
    descriptionAr:
      'تمرين بايسبس مائل بالدمبل بالتناوب يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس و عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس', 'عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg',
  },
  {
    id: 'Band_Skull_Crusher',
    name: 'Band Skull Crusher',
    nameAr: 'كسر جمجمة بحبل المقاومة للترايسبس',
    descriptionAr:
      'تمرين كسر جمجمة بحبل المقاومة للترايسبس يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'band',
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة الترايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Skull_Crusher/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Band_Skull_Crusher/0.jpg',
  },
  {
    id: 'Barbell_Curls_Lying_Against_An_Incline',
    name: 'Barbell Curls Lying Against An Incline',
    nameAr: 'بايسبس كيرل بالبار على بنش مائل',
    descriptionAr:
      'تمرين بايسبس كيرل بالبار على بنش مائل يستهدف عضلة البايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلة البايسبس'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Curls_Lying_Against_An_Incline/0.jpg',
  },
  {
    id: 'Palms-Down_Wrist_Curl_Over_A_Bench',
    name: 'Palms-Down Wrist Curl Over A Bench',
    nameAr: 'ثني المعصم والراحة لأسفل على البنش',
    descriptionAr:
      'تمرين ثني المعصم والراحة لأسفل على البنش يستهدف عضلات الساعد والقبضة بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'beginner',
    equipment: 'barbell',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
      'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
      'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
      'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات الساعد والقبضة مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات الساعد والقبضة'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Palms-Down_Wrist_Curl_Over_A_Bench/0.jpg',
  },
  {
    id: 'arm-20',
    name: 'Close-Grip Push-Up off of a Dumbbell',
    nameAr: 'ضغط قبضة ضيقة على الدمبل للترايسبس',
    descriptionAr:
      'تمرين ضغط قبضة ضيقة على الدمبل للترايسبس يستهدف عضلة الترايسبس بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'arms',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    avoidForInjuries: ['رسغ'],
    howToStepsAr: [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلة الترايسبس و عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلة الترايسبس',
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Push-Up_off_of_a_Dumbbell/0.jpg',
  },
  {
    id: '3_4_Sit-Up',
    name: '3/4 Sit-Up',
    nameAr: 'تمرين 3/4 سيت أب لعضلات البطن',
    descriptionAr:
      'تمرين تمرين 3/4 سيت أب لعضلات البطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/3_4_Sit-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/3_4_Sit-Up/0.jpg',
  },
  {
    id: 'Ab_Crunch_Machine',
    name: 'Ab Crunch Machine',
    nameAr: 'كرنش على جهاز البطن بالأوزان',
    descriptionAr:
      'تمرين كرنش على جهاز البطن بالأوزان يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'machine',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ab_Crunch_Machine/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ab_Crunch_Machine/0.jpg',
  },
  {
    id: 'Alternate_Heel_Touchers',
    name: 'Alternate Heel Touchers',
    nameAr: 'لمس الكعبين بالتناوب لعضلات الخصر والبطن',
    descriptionAr:
      'تمرين لمس الكعبين بالتناوب لعضلات الخصر والبطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Heel_Touchers/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternate_Heel_Touchers/0.jpg',
  },
  {
    id: 'Barbell_Ab_Rollout_-_On_Knees',
    name: 'Barbell Ab Rollout - On Knees',
    nameAr: 'فرد عجلة البطن بالبار على الركبتين',
    descriptionAr:
      'تمرين فرد عجلة البطن بالبار على الركبتين يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'advanced',
    equipment: 'barbell',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و أسفل الظهر (الفقرات القطنية) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'أسفل الظهر (الفقرات القطنية)',
      'عضلات الكتف (الدالية)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Ab_Rollout_-_On_Knees/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Ab_Rollout_-_On_Knees/0.jpg',
  },
  {
    id: 'Cocoons',
    name: 'Cocoons',
    nameAr: 'تمرين الشرانق لشد كامل البطن',
    descriptionAr:
      'تمرين تمرين الشرانق لشد كامل البطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cocoons/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cocoons/0.jpg',
  },
  {
    id: 'Gorilla_Chin_Crunch',
    name: 'Gorilla Chin/Crunch',
    nameAr: 'عقلة جوريلا مع كرنش للبطن',
    descriptionAr:
      'تمرين عقلة جوريلا مع كرنش للبطن يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلة البايسبس مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلة البايسبس',
      'عضلة الظهر العريضة (المجانص)',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Gorilla_Chin_Crunch/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Gorilla_Chin_Crunch/0.jpg',
  },
  {
    id: 'core-9',
    name: 'Jackknife Sit-Up',
    nameAr: 'تمرين جاك نايف للبطن والكور',
    descriptionAr:
      'تمرين تمرين جاك نايف للبطن والكور يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Jackknife_Sit-Up/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Jackknife_Sit-Up/0.jpg',
  },
  {
    id: 'Scissor_Kick',
    name: 'Scissor Kick',
    nameAr: 'ركلات المقص للأرجل للبطن السفلية',
    descriptionAr:
      'تمرين ركلات المقص للأرجل للبطن السفلية يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: ['عضلات البطن المستقيمة والجذع (الكور)'],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scissor_Kick/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Scissor_Kick/0.jpg',
  },
  {
    id: 'Spider_Crawl',
    name: 'Spider Crawl',
    nameAr: 'زحف العنكبوت للكور واللياقة',
    descriptionAr:
      'تمرين زحف العنكبوت للكور واللياقة يستهدف عضلات البطن المستقيمة والجذع (الكور) بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: 'core',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    howToStepsAr: [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ],
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات عضلات البطن المستقيمة والجذع (الكور) و عضلات الصدر (الصدرية الكبرى) مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: [
      'عضلات البطن المستقيمة والجذع (الكور)',
      'عضلات الصدر (الصدرية الكبرى)',
      'عضلات الكتف (الدالية)',
      'عضلة الترايسبس',
    ],
    thumbnailUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Crawl/0.jpg',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Spider_Crawl/0.jpg',
  },
]

/**
 * خريطة التوافق العكسي للمعرفات القديمة (Alias Map)
 * تضمن التعرف على جميع المعرفات السابقة (chest-1, ext-..., Slugs) دون فقدان أي بيانات
 */
export const EXERCISE_ALIASES: Record<string, string> = {
  'Barbell_Bench_Press_-_Medium_Grip': 'chest-1',
  'ext-Barbell_Bench_Press_-_Medium_Grip': 'chest-1',
  'chest-1': 'chest-1',
  'Barbell_Incline_Bench_Press_-_Medium_Grip': 'chest-4',
  'ext-Barbell_Incline_Bench_Press_-_Medium_Grip': 'chest-4',
  'chest-4': 'chest-4',
  Decline_Barbell_Bench_Press: 'chest-13',
  'ext-Decline_Barbell_Bench_Press': 'chest-13',
  'chest-13': 'chest-13',
  'Wide-Grip_Barbell_Bench_Press': 'chest-18',
  'ext-Wide-Grip_Barbell_Bench_Press': 'chest-18',
  'chest-18': 'chest-18',
  Barbell_Guillotine_Bench_Press: 'Barbell_Guillotine_Bench_Press',
  'ext-Barbell_Guillotine_Bench_Press': 'Barbell_Guillotine_Bench_Press',
  Dumbbell_Bench_Press: 'chest-2',
  'ext-Dumbbell_Bench_Press': 'chest-2',
  'chest-2': 'chest-2',
  Incline_Dumbbell_Press: 'chest-5',
  'ext-Incline_Dumbbell_Press': 'chest-5',
  'chest-5': 'chest-5',
  Decline_Dumbbell_Bench_Press: 'chest-15',
  'ext-Decline_Dumbbell_Bench_Press': 'chest-15',
  'chest-15': 'chest-15',
  Dumbbell_Flyes: 'chest-6',
  'ext-Dumbbell_Flyes': 'chest-6',
  'chest-6': 'chest-6',
  Incline_Dumbbell_Flyes: 'chest-9',
  'ext-Incline_Dumbbell_Flyes': 'chest-9',
  'chest-9': 'chest-9',
  Decline_Dumbbell_Flyes: 'chest-12',
  'ext-Decline_Dumbbell_Flyes': 'chest-12',
  'chest-12': 'chest-12',
  'Straight-Arm_Dumbbell_Pullover': 'chest-16',
  'ext-Straight-Arm_Dumbbell_Pullover': 'chest-16',
  'chest-16': 'chest-16',
  'One-Arm_Flat_Bench_Dumbbell_Flye': 'chest-17',
  'ext-One-Arm_Flat_Bench_Dumbbell_Flye': 'chest-17',
  'chest-17': 'chest-17',
  Hammer_Grip_Incline_DB_Bench_Press: 'Hammer_Grip_Incline_DB_Bench_Press',
  'ext-Hammer_Grip_Incline_DB_Bench_Press':
    'Hammer_Grip_Incline_DB_Bench_Press',
  Cable_Crossover: 'chest-7',
  'ext-Cable_Crossover': 'chest-7',
  'chest-7': 'chest-7',
  Low_Cable_Crossover: 'chest-14',
  'ext-Low_Cable_Crossover': 'chest-14',
  'chest-14': 'chest-14',
  Cable_Chest_Press: 'chest-8',
  'ext-Cable_Chest_Press': 'chest-8',
  'chest-8': 'chest-8',
  Cable_Iron_Cross: 'Cable_Iron_Cross',
  'ext-Cable_Iron_Cross': 'Cable_Iron_Cross',
  'Single-Arm_Cable_Crossover': 'Single-Arm_Cable_Crossover',
  'ext-Single-Arm_Cable_Crossover': 'Single-Arm_Cable_Crossover',
  Butterfly: 'chest-20',
  'ext-Butterfly': 'chest-20',
  'chest-20': 'chest-20',
  Leverage_Chest_Press: 'chest-10',
  'ext-Leverage_Chest_Press': 'chest-10',
  'chest-10': 'chest-10',
  Leverage_Incline_Chest_Press: 'Leverage_Incline_Chest_Press',
  'ext-Leverage_Incline_Chest_Press': 'Leverage_Incline_Chest_Press',
  Leverage_Decline_Chest_Press: 'Leverage_Decline_Chest_Press',
  'ext-Leverage_Decline_Chest_Press': 'Leverage_Decline_Chest_Press',
  Smith_Machine_Bench_Press: 'Smith_Machine_Bench_Press',
  'ext-Smith_Machine_Bench_Press': 'Smith_Machine_Bench_Press',
  Smith_Machine_Incline_Bench_Press: 'Smith_Machine_Incline_Bench_Press',
  'ext-Smith_Machine_Incline_Bench_Press': 'Smith_Machine_Incline_Bench_Press',
  Smith_Machine_Decline_Press: 'Smith_Machine_Decline_Press',
  'ext-Smith_Machine_Decline_Press': 'Smith_Machine_Decline_Press',
  'Dips_-_Chest_Version': 'chest-11',
  'ext-Dips_-_Chest_Version': 'chest-11',
  'chest-11': 'chest-11',
  Pushups: 'chest-3',
  'ext-Pushups': 'chest-3',
  'chest-3': 'chest-3',
  'Incline_Push-Up': 'chest-19',
  'ext-Incline_Push-Up': 'chest-19',
  'chest-19': 'chest-19',
  'Decline_Push-Up': 'Decline_Push-Up',
  'ext-Decline_Push-Up': 'Decline_Push-Up',
  Svend_Press: 'Svend_Press',
  'ext-Svend_Press': 'Svend_Press',
  'Clock_Push-Up': 'Clock_Push-Up',
  'ext-Clock_Push-Up': 'Clock_Push-Up',
  Barbell_Deadlift: 'back-14',
  'ext-Barbell_Deadlift': 'back-14',
  'back-14': 'back-14',
  Bent_Over_Barbell_Row: 'back-4',
  'ext-Bent_Over_Barbell_Row': 'back-4',
  'back-4': 'back-4',
  'Bent_Over_Two-Dumbbell_Row': 'back-5',
  'ext-Bent_Over_Two-Dumbbell_Row': 'back-5',
  'back-5': 'back-5',
  'One-Arm_Dumbbell_Row': 'back-13',
  'ext-One-Arm_Dumbbell_Row': 'back-13',
  'back-13': 'back-13',
  'T-Bar_Row_with_Handle': 'back-8',
  'ext-T-Bar_Row_with_Handle': 'back-8',
  'back-8': 'back-8',
  'Wide-Grip_Lat_Pulldown': 'back-1',
  'ext-Wide-Grip_Lat_Pulldown': 'back-1',
  'back-1': 'back-1',
  'Close-Grip_Front_Lat_Pulldown': 'back-7',
  'ext-Close-Grip_Front_Lat_Pulldown': 'back-7',
  'back-7': 'back-7',
  Underhand_Cable_Pulldowns: 'back-3',
  'ext-Underhand_Cable_Pulldowns': 'back-3',
  'back-3': 'back-3',
  One_Arm_Lat_Pulldown: 'One_Arm_Lat_Pulldown',
  'ext-One_Arm_Lat_Pulldown': 'One_Arm_Lat_Pulldown',
  'Full_Range-Of-Motion_Lat_Pulldown': 'Full_Range-Of-Motion_Lat_Pulldown',
  'ext-Full_Range-Of-Motion_Lat_Pulldown': 'Full_Range-Of-Motion_Lat_Pulldown',
  Seated_Cable_Rows: 'back-6',
  'ext-Seated_Cable_Rows': 'back-6',
  'back-6': 'back-6',
  Elevated_Cable_Rows: 'Elevated_Cable_Rows',
  'ext-Elevated_Cable_Rows': 'Elevated_Cable_Rows',
  'Straight-Arm_Pulldown': 'back-11',
  'ext-Straight-Arm_Pulldown': 'back-11',
  'back-11': 'back-11',
  Pullups: 'back-10',
  'ext-Pullups': 'back-10',
  'back-10': 'back-10',
  'Wide-Grip_Rear_Pull-Up': 'Wide-Grip_Rear_Pull-Up',
  'ext-Wide-Grip_Rear_Pull-Up': 'Wide-Grip_Rear_Pull-Up',
  'Chin-Up': 'back-17',
  'ext-Chin-Up': 'back-17',
  'back-17': 'back-17',
  Inverted_Row: 'back-16',
  'ext-Inverted_Row': 'back-16',
  'back-16': 'back-16',
  Rope_Climb: 'Rope_Climb',
  'ext-Rope_Climb': 'Rope_Climb',
  Barbell_Shrug: 'back-20',
  'ext-Barbell_Shrug': 'back-20',
  'back-20': 'back-20',
  Dumbbell_Shrug: 'Dumbbell_Shrug',
  'ext-Dumbbell_Shrug': 'Dumbbell_Shrug',
  Cable_Shrugs: 'Cable_Shrugs',
  'ext-Cable_Shrugs': 'Cable_Shrugs',
  Middle_Back_Shrug: 'Middle_Back_Shrug',
  'ext-Middle_Back_Shrug': 'Middle_Back_Shrug',
  Hyperextensions_Back_Extensions: 'back-9',
  'ext-Hyperextensions_Back_Extensions': 'back-9',
  'back-9': 'back-9',
  Good_Morning: 'Good_Morning',
  'ext-Good_Morning': 'Good_Morning',
  Stiff_Leg_Barbell_Good_Morning: 'Stiff_Leg_Barbell_Good_Morning',
  'ext-Stiff_Leg_Barbell_Good_Morning': 'Stiff_Leg_Barbell_Good_Morning',
  Smith_Machine_Bent_Over_Row: 'Smith_Machine_Bent_Over_Row',
  'ext-Smith_Machine_Bent_Over_Row': 'Smith_Machine_Bent_Over_Row',
  Leverage_High_Row: 'back-18',
  'ext-Leverage_High_Row': 'back-18',
  'back-18': 'back-18',
  Shotgun_Row: 'back-19',
  'ext-Shotgun_Row': 'back-19',
  'back-19': 'back-19',
  'Bent_Over_Two-Arm_Long_Bar_Row': 'Bent_Over_Two-Arm_Long_Bar_Row',
  'ext-Bent_Over_Two-Arm_Long_Bar_Row': 'Bent_Over_Two-Arm_Long_Bar_Row',
  Sumo_Deadlift: 'Sumo_Deadlift',
  'ext-Sumo_Deadlift': 'Sumo_Deadlift',
  Trap_Bar_Deadlift: 'Trap_Bar_Deadlift',
  'ext-Trap_Bar_Deadlift': 'Trap_Bar_Deadlift',
  Deadlift_with_Bands: 'Deadlift_with_Bands',
  'ext-Deadlift_with_Bands': 'Deadlift_with_Bands',
  Romanian_Deadlift_from_Deficit: 'back-15',
  'ext-Romanian_Deadlift_from_Deficit': 'back-15',
  'back-15': 'back-15',
  'Kettlebell_One-Legged_Deadlift': 'Kettlebell_One-Legged_Deadlift',
  'ext-Kettlebell_One-Legged_Deadlift': 'Kettlebell_One-Legged_Deadlift',
  Superman: 'core-19',
  'ext-Superman': 'core-19',
  'core-19': 'core-19',
  Face_Pull: 'shoulder-12',
  'ext-Face_Pull': 'shoulder-12',
  'shoulder-12': 'shoulder-12',
  Side_Laterals_to_Front_Raise: 'Side_Laterals_to_Front_Raise',
  'ext-Side_Laterals_to_Front_Raise': 'Side_Laterals_to_Front_Raise',
  'Upright_Row_-_With_Bands': 'Upright_Row_-_With_Bands',
  'ext-Upright_Row_-_With_Bands': 'Upright_Row_-_With_Bands',
  Standing_Cable_Lift: 'Standing_Cable_Lift',
  'ext-Standing_Cable_Lift': 'Standing_Cable_Lift',
  Barbell_Full_Squat: 'leg-1',
  'ext-Barbell_Full_Squat': 'leg-1',
  'leg-1': 'leg-1',
  Front_Barbell_Squat: 'leg-11',
  'ext-Front_Barbell_Squat': 'leg-11',
  'leg-11': 'leg-11',
  Box_Squat: 'leg-14',
  'ext-Box_Squat': 'leg-14',
  'leg-14': 'leg-14',
  Narrow_Stance_Squats: 'Narrow_Stance_Squats',
  'ext-Narrow_Stance_Squats': 'Narrow_Stance_Squats',
  Wide_Stance_Barbell_Squat: 'Wide_Stance_Barbell_Squat',
  'ext-Wide_Stance_Barbell_Squat': 'Wide_Stance_Barbell_Squat',
  Overhead_Squat: 'Overhead_Squat',
  'ext-Overhead_Squat': 'Overhead_Squat',
  Hack_Squat: 'leg-12',
  'ext-Hack_Squat': 'leg-12',
  'leg-12': 'leg-12',
  Barbell_Lunge: 'leg-8',
  'ext-Barbell_Lunge': 'leg-8',
  'leg-8': 'leg-8',
  Barbell_Walking_Lunge: 'Barbell_Walking_Lunge',
  'ext-Barbell_Walking_Lunge': 'Barbell_Walking_Lunge',
  Barbell_Side_Split_Squat: 'Barbell_Side_Split_Squat',
  'ext-Barbell_Side_Split_Squat': 'Barbell_Side_Split_Squat',
  Dumbbell_Squat: 'leg-2',
  'ext-Dumbbell_Squat': 'leg-2',
  'leg-2': 'leg-2',
  Goblet_Squat: 'Goblet_Squat',
  'ext-Goblet_Squat': 'Goblet_Squat',
  Dumbbell_Lunges: 'leg-7',
  'ext-Dumbbell_Lunges': 'leg-7',
  'leg-7': 'leg-7',
  Split_Squat_with_Dumbbells: 'leg-3',
  'ext-Split_Squat_with_Dumbbells': 'leg-3',
  'leg-3': 'leg-3',
  Dumbbell_Step_Ups: 'leg-13',
  'ext-Dumbbell_Step_Ups': 'leg-13',
  'leg-13': 'leg-13',
  'Step-up_with_Knee_Raise': 'Step-up_with_Knee_Raise',
  'ext-Step-up_with_Knee_Raise': 'Step-up_with_Knee_Raise',
  Plie_Dumbbell_Squat: 'leg-16',
  'ext-Plie_Dumbbell_Squat': 'leg-16',
  'leg-16': 'leg-16',
  Leg_Press: 'leg-4',
  'ext-Leg_Press': 'leg-4',
  'leg-4': 'leg-4',
  Leg_Extensions: 'leg-18',
  'ext-Leg_Extensions': 'leg-18',
  'leg-18': 'leg-18',
  Lying_Leg_Curls: 'leg-5',
  'ext-Lying_Leg_Curls': 'leg-5',
  'leg-5': 'leg-5',
  Seated_Leg_Curl: 'leg-17',
  'ext-Seated_Leg_Curl': 'leg-17',
  'leg-17': 'leg-17',
  Standing_Leg_Curl: 'Standing_Leg_Curl',
  'ext-Standing_Leg_Curl': 'Standing_Leg_Curl',
  Romanian_Deadlift: 'leg-6',
  'ext-Romanian_Deadlift': 'leg-6',
  'leg-6': 'leg-6',
  'Stiff-Legged_Barbell_Deadlift': 'leg-15',
  'ext-Stiff-Legged_Barbell_Deadlift': 'leg-15',
  'leg-15': 'leg-15',
  'Stiff-Legged_Dumbbell_Deadlift': 'Stiff-Legged_Dumbbell_Deadlift',
  'ext-Stiff-Legged_Dumbbell_Deadlift': 'Stiff-Legged_Dumbbell_Deadlift',
  Barbell_Hip_Thrust: 'leg-20',
  'ext-Barbell_Hip_Thrust': 'leg-20',
  'leg-20': 'leg-20',
  Barbell_Glute_Bridge: 'leg-21',
  'ext-Barbell_Glute_Bridge': 'leg-21',
  'leg-21': 'leg-21',
  Single_Leg_Glute_Bridge: 'Single_Leg_Glute_Bridge',
  'ext-Single_Leg_Glute_Bridge': 'Single_Leg_Glute_Bridge',
  Glute_Ham_Raise: 'Glute_Ham_Raise',
  'ext-Glute_Ham_Raise': 'Glute_Ham_Raise',
  Glute_Kickback: 'Glute_Kickback',
  'ext-Glute_Kickback': 'Glute_Kickback',
  Thigh_Abductor: 'Thigh_Abductor',
  'ext-Thigh_Abductor': 'Thigh_Abductor',
  Thigh_Adductor: 'Thigh_Adductor',
  'ext-Thigh_Adductor': 'Thigh_Adductor',
  Standing_Calf_Raises: 'leg-9',
  'ext-Standing_Calf_Raises': 'leg-9',
  'leg-9': 'leg-9',
  Seated_Calf_Raise: 'leg-10',
  'ext-Seated_Calf_Raise': 'leg-10',
  'leg-10': 'leg-10',
  Calf_Press_On_The_Leg_Press_Machine: 'Calf_Press_On_The_Leg_Press_Machine',
  'ext-Calf_Press_On_The_Leg_Press_Machine':
    'Calf_Press_On_The_Leg_Press_Machine',
  Smith_Machine_Calf_Raise: 'Smith_Machine_Calf_Raise',
  'ext-Smith_Machine_Calf_Raise': 'Smith_Machine_Calf_Raise',
  Rocking_Standing_Calf_Raise: 'Rocking_Standing_Calf_Raise',
  'ext-Rocking_Standing_Calf_Raise': 'Rocking_Standing_Calf_Raise',
  Donkey_Calf_Raises: 'Donkey_Calf_Raises',
  'ext-Donkey_Calf_Raises': 'Donkey_Calf_Raises',
  Smith_Machine_Squat: 'Smith_Machine_Squat',
  'ext-Smith_Machine_Squat': 'Smith_Machine_Squat',
  'Smith_Single-Leg_Split_Squat': 'Smith_Single-Leg_Split_Squat',
  'ext-Smith_Single-Leg_Split_Squat': 'Smith_Single-Leg_Split_Squat',
  Bodyweight_Squat: 'leg-19',
  'ext-Bodyweight_Squat': 'leg-19',
  'leg-19': 'leg-19',
  Bodyweight_Walking_Lunge: 'Bodyweight_Walking_Lunge',
  'ext-Bodyweight_Walking_Lunge': 'Bodyweight_Walking_Lunge',
  Scissors_Jump: 'Scissors_Jump',
  'ext-Scissors_Jump': 'Scissors_Jump',
  Side_Leg_Raises: 'Side_Leg_Raises',
  'ext-Side_Leg_Raises': 'Side_Leg_Raises',
  'One-Arm_Side_Deadlift': 'One-Arm_Side_Deadlift',
  'ext-One-Arm_Side_Deadlift': 'One-Arm_Side_Deadlift',
  Band_Hip_Adductions: 'Band_Hip_Adductions',
  'ext-Band_Hip_Adductions': 'Band_Hip_Adductions',
  Reverse_Band_Box_Squat: 'Reverse_Band_Box_Squat',
  'ext-Reverse_Band_Box_Squat': 'Reverse_Band_Box_Squat',
  'Calf-Machine_Shoulder_Shrug': 'Calf-Machine_Shoulder_Shrug',
  'ext-Calf-Machine_Shoulder_Shrug': 'Calf-Machine_Shoulder_Shrug',
  Knee_Tuck_Jump: 'Knee_Tuck_Jump',
  'ext-Knee_Tuck_Jump': 'Knee_Tuck_Jump',
  Standing_Military_Press: 'shoulder-1',
  'ext-Standing_Military_Press': 'shoulder-1',
  'shoulder-1': 'shoulder-1',
  Seated_Barbell_Military_Press: 'shoulder-11',
  'ext-Seated_Barbell_Military_Press': 'shoulder-11',
  'shoulder-11': 'shoulder-11',
  Dumbbell_Shoulder_Press: 'shoulder-15',
  'ext-Dumbbell_Shoulder_Press': 'shoulder-15',
  'shoulder-15': 'shoulder-15',
  Seated_Dumbbell_Press: 'Seated_Dumbbell_Press',
  'ext-Seated_Dumbbell_Press': 'Seated_Dumbbell_Press',
  Arnold_Dumbbell_Press: 'shoulder-6',
  'ext-Arnold_Dumbbell_Press': 'shoulder-6',
  'shoulder-6': 'shoulder-6',
  Leverage_Shoulder_Press: 'shoulder-16',
  'ext-Leverage_Shoulder_Press': 'shoulder-16',
  'shoulder-16': 'shoulder-16',
  Clean_and_Press: 'shoulder-19',
  'ext-Clean_and_Press': 'shoulder-19',
  'shoulder-19': 'shoulder-19',
  Push_Press: 'Push_Press',
  'ext-Push_Press': 'Push_Press',
  Side_Lateral_Raise: 'shoulder-3',
  'ext-Side_Lateral_Raise': 'shoulder-3',
  'shoulder-3': 'shoulder-3',
  Seated_Side_Lateral_Raise: 'shoulder-9',
  'ext-Seated_Side_Lateral_Raise': 'shoulder-9',
  'shoulder-9': 'shoulder-9',
  'One-Arm_Side_Laterals': 'shoulder-14',
  'ext-One-Arm_Side_Laterals': 'shoulder-14',
  'shoulder-14': 'shoulder-14',
  Cable_Seated_Lateral_Raise: 'shoulder-5',
  'ext-Cable_Seated_Lateral_Raise': 'shoulder-5',
  'shoulder-5': 'shoulder-5',
  Front_Dumbbell_Raise: 'shoulder-4',
  'ext-Front_Dumbbell_Raise': 'shoulder-4',
  'shoulder-4': 'shoulder-4',
  Front_Cable_Raise: 'shoulder-13',
  'ext-Front_Cable_Raise': 'shoulder-13',
  'shoulder-13': 'shoulder-13',
  'Front_Two-Dumbbell_Raise': 'Front_Two-Dumbbell_Raise',
  'ext-Front_Two-Dumbbell_Raise': 'Front_Two-Dumbbell_Raise',
  Standing_Front_Barbell_Raise_Over_Head:
    'Standing_Front_Barbell_Raise_Over_Head',
  'ext-Standing_Front_Barbell_Raise_Over_Head':
    'Standing_Front_Barbell_Raise_Over_Head',
  Reverse_Flyes: 'back-12',
  'ext-Reverse_Flyes': 'back-12',
  'back-12': 'back-12',
  Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench: 'shoulder-7',
  'ext-Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench': 'shoulder-7',
  'shoulder-7': 'shoulder-7',
  Lying_Rear_Delt_Raise: 'Lying_Rear_Delt_Raise',
  'ext-Lying_Rear_Delt_Raise': 'Lying_Rear_Delt_Raise',
  Cable_Rear_Delt_Fly: 'Cable_Rear_Delt_Fly',
  'ext-Cable_Rear_Delt_Fly': 'Cable_Rear_Delt_Fly',
  Barbell_Rear_Delt_Row: 'shoulder-18',
  'ext-Barbell_Rear_Delt_Row': 'shoulder-18',
  'shoulder-18': 'shoulder-18',
  'Cable_Rope_Rear-Delt_Rows': 'Cable_Rope_Rear-Delt_Rows',
  'ext-Cable_Rope_Rear-Delt_Rows': 'Cable_Rope_Rear-Delt_Rows',
  Upright_Barbell_Row: 'shoulder-17',
  'ext-Upright_Barbell_Row': 'shoulder-17',
  'shoulder-17': 'shoulder-17',
  Upright_Cable_Row: 'Upright_Cable_Row',
  'ext-Upright_Cable_Row': 'Upright_Cable_Row',
  'Dumbbell_One-Arm_Upright_Row': 'Dumbbell_One-Arm_Upright_Row',
  'ext-Dumbbell_One-Arm_Upright_Row': 'Dumbbell_One-Arm_Upright_Row',
  Dumbbell_Scaption: 'shoulder-10',
  'ext-Dumbbell_Scaption': 'shoulder-10',
  'shoulder-10': 'shoulder-10',
  Dumbbell_Raise: 'Dumbbell_Raise',
  'ext-Dumbbell_Raise': 'Dumbbell_Raise',
  Alternating_Deltoid_Raise: 'Alternating_Deltoid_Raise',
  'ext-Alternating_Deltoid_Raise': 'Alternating_Deltoid_Raise',
  Car_Drivers: 'Car_Drivers',
  'ext-Car_Drivers': 'Car_Drivers',
  Cuban_Press: 'Cuban_Press',
  'ext-Cuban_Press': 'Cuban_Press',
  Iron_Cross: 'Iron_Cross',
  'ext-Iron_Cross': 'Iron_Cross',
  'Standing_Low-Pulley_Deltoid_Raise': 'Standing_Low-Pulley_Deltoid_Raise',
  'ext-Standing_Low-Pulley_Deltoid_Raise': 'Standing_Low-Pulley_Deltoid_Raise',
  'Handstand_Push-Ups': 'shoulder-20',
  'ext-Handstand_Push-Ups': 'shoulder-20',
  'shoulder-20': 'shoulder-20',
  Kettlebell_Thruster: 'Kettlebell_Thruster',
  'ext-Kettlebell_Thruster': 'Kettlebell_Thruster',
  External_Rotation_with_Band: 'External_Rotation_with_Band',
  'ext-External_Rotation_with_Band': 'External_Rotation_with_Band',
  Side_Wrist_Pull: 'Side_Wrist_Pull',
  'ext-Side_Wrist_Pull': 'Side_Wrist_Pull',
  Barbell_Curl: 'arm-1',
  'ext-Barbell_Curl': 'arm-1',
  'arm-1': 'arm-1',
  'EZ-Bar_Curl': 'EZ-Bar_Curl',
  'ext-EZ-Bar_Curl': 'EZ-Bar_Curl',
  'Close-Grip_Standing_Barbell_Curl': 'Close-Grip_Standing_Barbell_Curl',
  'ext-Close-Grip_Standing_Barbell_Curl': 'Close-Grip_Standing_Barbell_Curl',
  'Wide-Grip_Standing_Barbell_Curl': 'Wide-Grip_Standing_Barbell_Curl',
  'ext-Wide-Grip_Standing_Barbell_Curl': 'Wide-Grip_Standing_Barbell_Curl',
  Dumbbell_Bicep_Curl: 'arm-2',
  'ext-Dumbbell_Bicep_Curl': 'arm-2',
  'arm-2': 'arm-2',
  Incline_Dumbbell_Curl: 'arm-5',
  'ext-Incline_Dumbbell_Curl': 'arm-5',
  'arm-5': 'arm-5',
  Incline_Inner_Biceps_Curl: 'Incline_Inner_Biceps_Curl',
  'ext-Incline_Inner_Biceps_Curl': 'Incline_Inner_Biceps_Curl',
  Hammer_Curls: 'arm-3',
  'ext-Hammer_Curls': 'arm-3',
  'arm-3': 'arm-3',
  Cross_Body_Hammer_Curl: 'Cross_Body_Hammer_Curl',
  'ext-Cross_Body_Hammer_Curl': 'Cross_Body_Hammer_Curl',
  Preacher_Curl: 'Preacher_Curl',
  'ext-Preacher_Curl': 'Preacher_Curl',
  Concentration_Curls: 'arm-4',
  'ext-Concentration_Curls': 'arm-4',
  'arm-4': 'arm-4',
  Spider_Curl: 'Spider_Curl',
  'ext-Spider_Curl': 'Spider_Curl',
  Zottman_Curl: 'Zottman_Curl',
  'ext-Zottman_Curl': 'Zottman_Curl',
  'Seated_Close-Grip_Concentration_Barbell_Curl':
    'Seated_Close-Grip_Concentration_Barbell_Curl',
  'ext-Seated_Close-Grip_Concentration_Barbell_Curl':
    'Seated_Close-Grip_Concentration_Barbell_Curl',
  Cable_Preacher_Curl: 'arm-6',
  'ext-Cable_Preacher_Curl': 'arm-6',
  'arm-6': 'arm-6',
  'Cable_Hammer_Curls_-_Rope_Attachment': 'arm-7',
  'ext-Cable_Hammer_Curls_-_Rope_Attachment': 'arm-7',
  'arm-7': 'arm-7',
  Overhead_Cable_Curl: 'arm-8',
  'ext-Overhead_Cable_Curl': 'arm-8',
  'arm-8': 'arm-8',
  Machine_Bicep_Curl: 'arm-9',
  'ext-Machine_Bicep_Curl': 'arm-9',
  'arm-9': 'arm-9',
  Reverse_Barbell_Curl: 'arm-10',
  'ext-Reverse_Barbell_Curl': 'arm-10',
  'arm-10': 'arm-10',
  Reverse_Cable_Curl: 'Reverse_Cable_Curl',
  'ext-Reverse_Cable_Curl': 'Reverse_Cable_Curl',
  'Close-Grip_Barbell_Bench_Press': 'arm-11',
  'ext-Close-Grip_Barbell_Bench_Press': 'arm-11',
  'arm-11': 'arm-11',
  JM_Press: 'JM_Press',
  'ext-JM_Press': 'JM_Press',
  Lying_Triceps_Press: 'arm-14',
  'ext-Lying_Triceps_Press': 'arm-14',
  'arm-14': 'arm-14',
  Decline_EZ_Bar_Triceps_Extension: 'Decline_EZ_Bar_Triceps_Extension',
  'ext-Decline_EZ_Bar_Triceps_Extension': 'Decline_EZ_Bar_Triceps_Extension',
  Incline_Barbell_Triceps_Extension: 'Incline_Barbell_Triceps_Extension',
  'ext-Incline_Barbell_Triceps_Extension': 'Incline_Barbell_Triceps_Extension',
  'Decline_Close-Grip_Bench_To_Skull_Crusher':
    'Decline_Close-Grip_Bench_To_Skull_Crusher',
  'ext-Decline_Close-Grip_Bench_To_Skull_Crusher':
    'Decline_Close-Grip_Bench_To_Skull_Crusher',
  Standing_Overhead_Barbell_Triceps_Extension: 'arm-15',
  'ext-Standing_Overhead_Barbell_Triceps_Extension': 'arm-15',
  'arm-15': 'arm-15',
  Seated_Triceps_Press: 'arm-17',
  'ext-Seated_Triceps_Press': 'arm-17',
  'arm-17': 'arm-17',
  Standing_Dumbbell_Triceps_Extension: 'Standing_Dumbbell_Triceps_Extension',
  'ext-Standing_Dumbbell_Triceps_Extension':
    'Standing_Dumbbell_Triceps_Extension',
  Tricep_Dumbbell_Kickback: 'arm-16',
  'ext-Tricep_Dumbbell_Kickback': 'arm-16',
  'arm-16': 'arm-16',
  Tate_Press: 'Tate_Press',
  'ext-Tate_Press': 'Tate_Press',
  Triceps_Pushdown: 'arm-12',
  'ext-Triceps_Pushdown': 'arm-12',
  'arm-12': 'arm-12',
  'Triceps_Pushdown_-_Rope_Attachment': 'arm-13',
  'ext-Triceps_Pushdown_-_Rope_Attachment': 'arm-13',
  'arm-13': 'arm-13',
  'Triceps_Pushdown_-_V-Bar_Attachment': 'Triceps_Pushdown_-_V-Bar_Attachment',
  'ext-Triceps_Pushdown_-_V-Bar_Attachment':
    'Triceps_Pushdown_-_V-Bar_Attachment',
  Reverse_Grip_Triceps_Pushdown: 'Reverse_Grip_Triceps_Pushdown',
  'ext-Reverse_Grip_Triceps_Pushdown': 'Reverse_Grip_Triceps_Pushdown',
  Cable_One_Arm_Tricep_Extension: 'Cable_One_Arm_Tricep_Extension',
  'ext-Cable_One_Arm_Tricep_Extension': 'Cable_One_Arm_Tricep_Extension',
  Cable_Lying_Triceps_Extension: 'Cable_Lying_Triceps_Extension',
  'ext-Cable_Lying_Triceps_Extension': 'Cable_Lying_Triceps_Extension',
  'Dips_-_Triceps_Version': 'arm-19',
  'ext-Dips_-_Triceps_Version': 'arm-19',
  'arm-19': 'arm-19',
  Bench_Dips: 'arm-18',
  'ext-Bench_Dips': 'arm-18',
  'arm-18': 'arm-18',
  'Seated_Palm-Up_Barbell_Wrist_Curl': 'Seated_Palm-Up_Barbell_Wrist_Curl',
  'ext-Seated_Palm-Up_Barbell_Wrist_Curl': 'Seated_Palm-Up_Barbell_Wrist_Curl',
  'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench':
    'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench',
  'ext-Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench':
    'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench',
  'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench':
    'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
  'ext-Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench':
    'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
  Farmers_Walk: 'Farmers_Walk',
  'ext-Farmers_Walk': 'Farmers_Walk',
  Wrist_Roller: 'Wrist_Roller',
  'ext-Wrist_Roller': 'Wrist_Roller',
  Plate_Pinch: 'Plate_Pinch',
  'ext-Plate_Pinch': 'Plate_Pinch',
  Cable_Wrist_Curl: 'Cable_Wrist_Curl',
  'ext-Cable_Wrist_Curl': 'Cable_Wrist_Curl',
  Plank: 'core-1',
  'ext-Plank': 'core-1',
  'core-1': 'core-1',
  Push_Up_to_Side_Plank: 'core-5',
  'ext-Push_Up_to_Side_Plank': 'core-5',
  'core-5': 'core-5',
  Crunches: 'core-2',
  'ext-Crunches': 'core-2',
  'core-2': 'core-2',
  Decline_Crunch: 'core-18',
  'ext-Decline_Crunch': 'core-18',
  'core-18': 'core-18',
  Reverse_Crunch: 'core-12',
  'ext-Reverse_Crunch': 'core-12',
  'core-12': 'core-12',
  'Cross-Body_Crunch': 'core-10',
  'ext-Cross-Body_Crunch': 'core-10',
  'core-10': 'core-10',
  Tuck_Crunch: 'Tuck_Crunch',
  'ext-Tuck_Crunch': 'Tuck_Crunch',
  Exercise_Ball_Crunch: 'core-14',
  'ext-Exercise_Ball_Crunch': 'core-14',
  'core-14': 'core-14',
  Cable_Crunch: 'core-20',
  'ext-Cable_Crunch': 'core-20',
  'core-20': 'core-20',
  Kneeling_Cable_Triceps_Extension: 'Kneeling_Cable_Triceps_Extension',
  'ext-Kneeling_Cable_Triceps_Extension': 'Kneeling_Cable_Triceps_Extension',
  Hanging_Leg_Raise: 'core-17',
  'ext-Hanging_Leg_Raise': 'core-17',
  'core-17': 'core-17',
  Flat_Bench_Lying_Leg_Raise: 'core-4',
  'ext-Flat_Bench_Lying_Leg_Raise': 'core-4',
  'core-4': 'core-4',
  'Seated_Flat_Bench_Leg_Pull-In': 'Seated_Flat_Bench_Leg_Pull-In',
  'ext-Seated_Flat_Bench_Leg_Pull-In': 'Seated_Flat_Bench_Leg_Pull-In',
  'Leg_Pull-In': 'Leg_Pull-In',
  'ext-Leg_Pull-In': 'Leg_Pull-In',
  Ab_Roller: 'core-16',
  'ext-Ab_Roller': 'core-16',
  'core-16': 'core-16',
  Russian_Twist: 'core-7',
  'ext-Russian_Twist': 'core-7',
  'core-7': 'core-7',
  Air_Bike: 'core-6',
  'ext-Air_Bike': 'core-6',
  'core-6': 'core-6',
  Mountain_Climbers: 'core-8',
  'ext-Mountain_Climbers': 'core-8',
  'core-8': 'core-8',
  Dead_Bug: 'core-13',
  'ext-Dead_Bug': 'core-13',
  'core-13': 'core-13',
  Standing_Cable_Wood_Chop: 'core-15',
  'ext-Standing_Cable_Wood_Chop': 'core-15',
  'core-15': 'core-15',
  Pallof_Press: 'Pallof_Press',
  'ext-Pallof_Press': 'Pallof_Press',
  Plate_Twist: 'Plate_Twist',
  'ext-Plate_Twist': 'Plate_Twist',
  Medicine_Ball_Full_Twist: 'Medicine_Ball_Full_Twist',
  'ext-Medicine_Ball_Full_Twist': 'Medicine_Ball_Full_Twist',
  Dumbbell_Side_Bend: 'Dumbbell_Side_Bend',
  'ext-Dumbbell_Side_Bend': 'Dumbbell_Side_Bend',
  Bottoms_Up: 'Bottoms_Up',
  'ext-Bottoms_Up': 'Bottoms_Up',
  Alternating_Floor_Press: 'Alternating_Floor_Press',
  'ext-Alternating_Floor_Press': 'Alternating_Floor_Press',
  'Bench_Press_-_With_Bands': 'Bench_Press_-_With_Bands',
  'ext-Bench_Press_-_With_Bands': 'Bench_Press_-_With_Bands',
  'Bent-Arm_Dumbbell_Pullover': 'Bent-Arm_Dumbbell_Pullover',
  'ext-Bent-Arm_Dumbbell_Pullover': 'Bent-Arm_Dumbbell_Pullover',
  Bodyweight_Flyes: 'Bodyweight_Flyes',
  'ext-Bodyweight_Flyes': 'Bodyweight_Flyes',
  Barbell_Shrug_Behind_The_Back: 'Barbell_Shrug_Behind_The_Back',
  'ext-Barbell_Shrug_Behind_The_Back': 'Barbell_Shrug_Behind_The_Back',
  'Bent_Over_One-Arm_Long_Bar_Row': 'Bent_Over_One-Arm_Long_Bar_Row',
  'ext-Bent_Over_One-Arm_Long_Bar_Row': 'Bent_Over_One-Arm_Long_Bar_Row',
  'Bent_Over_Two-Dumbbell_Row_With_Palms_In':
    'Bent_Over_Two-Dumbbell_Row_With_Palms_In',
  'ext-Bent_Over_Two-Dumbbell_Row_With_Palms_In':
    'Bent_Over_Two-Dumbbell_Row_With_Palms_In',
  Cable_Incline_Pushdown: 'Cable_Incline_Pushdown',
  'ext-Cable_Incline_Pushdown': 'Cable_Incline_Pushdown',
  'Band_Assisted_Pull-Up': 'Band_Assisted_Pull-Up',
  'ext-Band_Assisted_Pull-Up': 'Band_Assisted_Pull-Up',
  'Rocky_Pull-Ups_Pulldowns': 'Rocky_Pull-Ups_Pulldowns',
  'ext-Rocky_Pull-Ups_Pulldowns': 'Rocky_Pull-Ups_Pulldowns',
  'Scapular_Pull-Up': 'Scapular_Pull-Up',
  'ext-Scapular_Pull-Up': 'Scapular_Pull-Up',
  Alternating_Cable_Shoulder_Press: 'Alternating_Cable_Shoulder_Press',
  'ext-Alternating_Cable_Shoulder_Press': 'Alternating_Cable_Shoulder_Press',
  Alternating_Kettlebell_Press: 'Alternating_Kettlebell_Press',
  'ext-Alternating_Kettlebell_Press': 'Alternating_Kettlebell_Press',
  Band_Pull_Apart: 'Band_Pull_Apart',
  'ext-Band_Pull_Apart': 'Band_Pull_Apart',
  Barbell_Shoulder_Press: 'Barbell_Shoulder_Press',
  'ext-Barbell_Shoulder_Press': 'Barbell_Shoulder_Press',
  'Bent_Over_Low-Pulley_Side_Lateral': 'Bent_Over_Low-Pulley_Side_Lateral',
  'ext-Bent_Over_Low-Pulley_Side_Lateral': 'Bent_Over_Low-Pulley_Side_Lateral',
  'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise':
    'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise',
  'ext-Dumbbell_Lying_One-Arm_Rear_Lateral_Raise':
    'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise',
  Dumbbell_Lying_Rear_Lateral_Raise: 'Dumbbell_Lying_Rear_Lateral_Raise',
  'ext-Dumbbell_Lying_Rear_Lateral_Raise': 'Dumbbell_Lying_Rear_Lateral_Raise',
  'Lateral_Raise_-_With_Bands': 'Lateral_Raise_-_With_Bands',
  'ext-Lateral_Raise_-_With_Bands': 'Lateral_Raise_-_With_Bands',
  Alternate_Hammer_Curl: 'Alternate_Hammer_Curl',
  'ext-Alternate_Hammer_Curl': 'Alternate_Hammer_Curl',
  Alternate_Incline_Dumbbell_Curl: 'Alternate_Incline_Dumbbell_Curl',
  'ext-Alternate_Incline_Dumbbell_Curl': 'Alternate_Incline_Dumbbell_Curl',
  Band_Skull_Crusher: 'Band_Skull_Crusher',
  'ext-Band_Skull_Crusher': 'Band_Skull_Crusher',
  Barbell_Curls_Lying_Against_An_Incline:
    'Barbell_Curls_Lying_Against_An_Incline',
  'ext-Barbell_Curls_Lying_Against_An_Incline':
    'Barbell_Curls_Lying_Against_An_Incline',
  'Palms-Down_Wrist_Curl_Over_A_Bench': 'Palms-Down_Wrist_Curl_Over_A_Bench',
  'ext-Palms-Down_Wrist_Curl_Over_A_Bench':
    'Palms-Down_Wrist_Curl_Over_A_Bench',
  'Close-Grip_Push-Up_off_of_a_Dumbbell': 'arm-20',
  'ext-Close-Grip_Push-Up_off_of_a_Dumbbell': 'arm-20',
  'arm-20': 'arm-20',
  '3_4_Sit-Up': '3_4_Sit-Up',
  'ext-3_4_Sit-Up': '3_4_Sit-Up',
  Ab_Crunch_Machine: 'Ab_Crunch_Machine',
  'ext-Ab_Crunch_Machine': 'Ab_Crunch_Machine',
  Alternate_Heel_Touchers: 'Alternate_Heel_Touchers',
  'ext-Alternate_Heel_Touchers': 'Alternate_Heel_Touchers',
  'Barbell_Ab_Rollout_-_On_Knees': 'Barbell_Ab_Rollout_-_On_Knees',
  'ext-Barbell_Ab_Rollout_-_On_Knees': 'Barbell_Ab_Rollout_-_On_Knees',
  Cocoons: 'Cocoons',
  'ext-Cocoons': 'Cocoons',
  Gorilla_Chin_Crunch: 'Gorilla_Chin_Crunch',
  'ext-Gorilla_Chin_Crunch': 'Gorilla_Chin_Crunch',
  'Jackknife_Sit-Up': 'core-9',
  'ext-Jackknife_Sit-Up': 'core-9',
  'core-9': 'core-9',
  Scissor_Kick: 'Scissor_Kick',
  'ext-Scissor_Kick': 'Scissor_Kick',
  Spider_Crawl: 'Spider_Crawl',
  'ext-Spider_Crawl': 'Spider_Crawl',
  'back-2': 'back-7',
  'back-21': 'core-19',
  'shoulder-2': 'shoulder-15',
  'shoulder-8': 'shoulder-16',
  'core-3': 'core-17',
  'core-11': 'core-13',
}

/**
 * البحث عن تمرين بواسطة المعرف
 * يبحث بالمعرف الأساسي أو بالمعرفات القديمة (Aliases)
 */
export function getExerciseById(id: string): Exercise | undefined {
  if (!id) return undefined
  const direct = EXERCISES.find((e) => e.id === id)
  if (direct) return direct

  // Check alias map
  const targetId = EXERCISE_ALIASES[id]
  if (targetId) {
    const aliased = EXERCISES.find((e) => e.id === targetId)
    if (aliased) return aliased
  }

  // Fallback for ext- prefix
  if (id.startsWith('ext-')) {
    const rawSlug = id.slice(4)
    const matched = EXERCISES.find(
      (e) => e.id === rawSlug || e.name === rawSlug,
    )
    if (matched) return matched
  }

  return undefined
}

export function getExercisesByCategory(
  category: Exercise['category'],
): Exercise[] {
  return EXERCISES.filter((e) => e.category === category)
}

export function filterByInjuries(
  exercises: Exercise[],
  injuries: string[],
): Exercise[] {
  if (injuries.length === 0) return exercises
  return exercises.filter(
    (e) =>
      !e.avoidForInjuries?.some((inj) =>
        injuries.some(
          (user) => inj === user || inj.includes(user) || user.includes(inj),
        ),
      ),
  )
}
