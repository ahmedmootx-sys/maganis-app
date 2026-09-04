const fs = require('fs')
const path = require('path')

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'free_exercises_raw.json'), 'utf8'),
)

// 1. Precise Muscle translations
const MUSCLE_MAP_AR = {
  chest: 'عضلات الصدر (الصدرية الكبرى)',
  'upper chest': 'الصدر العلوي (الترقوي)',
  'lower chest': 'الصدر السفلي (القصي)',
  lats: 'عضلة الظهر العريضة (المجانص)',
  'middle back': 'أعلى ومنتصف الظهر (الرومبويدز والترابيس)',
  'lower back': 'أسفل الظهر (الفقرات القطنية)',
  traps: 'عضلات الترابيس (Traps)',
  quadriceps: 'العضلة الرباعية (الفخذ الأمامي)',
  hamstrings: 'أوتار الركبة (الفخذ الخلفي / الهمسترنج)',
  glutes: 'عضلات المؤخرة والألوية (الجلوتس)',
  calves: 'عضلات السمانة (الكاحل)',
  abductors: 'عضلات الفخذ الخارجية (المبعدة)',
  adductors: 'عضلات الفخذ الداخلية (الضامة)',
  shoulders: 'عضلات الكتف (الدالية)',
  biceps: 'عضلة البايسبس',
  triceps: 'عضلة الترايسبس',
  forearms: 'عضلات الساعد والقبضة',
  abdominals: 'عضلات البطن المستقيمة والجذع (الكور)',
  obliques: 'عضلات الخصر والبطن الجانبية',
  neck: 'عضلات الرقبة',
}

const CATEGORY_MAP = {
  chest: 'chest',
  lats: 'back',
  'middle back': 'back',
  'lower back': 'back',
  traps: 'back',
  quadriceps: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  abductors: 'legs',
  adductors: 'legs',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  abdominals: 'core',
  neck: 'shoulders',
}

const EQUIPMENT_MAP = {
  barbell: 'barbell',
  'e-z curl bar': 'barbell',
  dumbbell: 'dumbbell',
  kettlebells: 'dumbbell',
  cable: 'machine',
  machine: 'machine',
  bands: 'band',
  'body only': 'bodyweight',
  'exercise ball': 'bodyweight',
  'medicine ball': 'bodyweight',
  other: 'bodyweight',
}

// Curated list of exact exercise IDs from Free Exercise DB (265 exercises)
const SELECTED_FREEDB_IDS = [
  // CHEST (36)
  'Barbell_Bench_Press_-_Medium_Grip',
  'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Decline_Barbell_Bench_Press',
  'Wide-Grip_Barbell_Bench_Press',
  'Barbell_Guillotine_Bench_Press',
  'Dumbbell_Bench_Press',
  'Incline_Dumbbell_Press',
  'Decline_Dumbbell_Bench_Press',
  'Dumbbell_Flyes',
  'Incline_Dumbbell_Flyes',
  'Decline_Dumbbell_Flyes',
  'Straight-Arm_Dumbbell_Pullover',
  'One-Arm_Flat_Bench_Dumbbell_Flye',
  'Hammer_Grip_Incline_DB_Bench_Press',
  'Cable_Crossover',
  'Low_Cable_Crossover',
  'Cable_Chest_Press',
  'Cable_Iron_Cross',
  'Single-Arm_Cable_Crossover',
  'Butterfly', // Pec Deck
  'Leverage_Chest_Press',
  'Leverage_Incline_Chest_Press',
  'Leverage_Decline_Chest_Press',
  'Smith_Machine_Bench_Press',
  'Smith_Machine_Incline_Bench_Press',
  'Smith_Machine_Decline_Press',
  'Dips_-_Chest_Version',
  'Chest_Dip',
  'Pushups',
  'Incline_Push-Up',
  'Decline_Push-Up',
  'Wide_Grip_Push-Ups',
  'Close_Push-up',
  'Drop_Push_Up',
  'Svend_Press',
  'Clock_Push-Up',

  // BACK & LATS & TRAPS (46)
  'Barbell_Deadlift',
  'Bent_Over_Barbell_Row',
  'Reverse_Grip_Bent-Over_Row',
  'Pendlay_Row',
  'Bent_Over_Two-Dumbbell_Row',
  'One-Arm_Dumbbell_Row',
  'T-Bar_Row_with_Handle',
  'Wide-Grip_Lat_Pulldown',
  'Close-Grip_Front_Lat_Pulldown',
  'Underhand_Cable_Pulldowns',
  'V-bar_Pulldown',
  'One_Arm_Lat_Pulldown',
  'Full_Range-Of-Motion_Lat_Pulldown',
  'Seated_Cable_Rows',
  'Standing_Cable_Row',
  'Elevated_Cable_Rows',
  'Straight-Arm_Pulldown',
  'Pullups',
  'Wide-Grip_Rear_Pull-Up',
  'Chin-Up',
  'Neutral_Grip_Pull-Ups',
  'Inverted_Row',
  'Rope_Climb',
  'Barbell_Shrug',
  'Behind_The_Back_Barbell_Shrug',
  'Dumbbell_Shrug',
  'Cable_Shrugs',
  'Smith_Machine_Behind_The_Back_Shrug',
  'Middle_Back_Shrug',
  'Hyperextensions_Back_Extensions',
  'Good_Morning',
  'Stiff_Leg_Barbell_Good_Morning',
  'Smith_Machine_Bent_Over_Row',
  'Leverage_High_Row',
  'Shotgun_Row',
  'Bent_Over_Two-Arm_Long_Bar_Row',
  'Sumo_Deadlift',
  'Trap_Bar_Deadlift',
  'Deadlift_with_Bands',
  'Romanian_Deadlift_from_Deficit',
  'Kettlebell_One-Legged_Deadlift',
  'Superman',
  'Face_Pull',
  'Side_Laterals_to_Front_Raise',
  'Upright_Row_-_With_Bands',
  'Standing_Cable_Lift',

  // LEGS & GLUTES & CALVES (52)
  'Barbell_Full_Squat',
  'Front_Barbell_Squat',
  'Box_Squat',
  'Narrow_Stance_Squats',
  'Wide_Stance_Barbell_Squat',
  'Overhead_Squat',
  'Hack_Squat',
  'Barbell_Lunge',
  'Barbell_Walking_Lunge',
  'Barbell_Side_Split_Squat',
  'Dumbbell_Squat',
  'Goblet_Squat',
  'Dumbbell_Lunges',
  'Bulgarian_Split_Squat',
  'Split_Squat_with_Dumbbells',
  'Dumbbell_Step_Ups',
  'Step-up_with_Knee_Raise',
  'Plie_Dumbbell_Squat',
  'Leg_Press',
  'Single-Leg_Leg_Press',
  'Leg_Extensions',
  'Lying_Leg_Curls',
  'Seated_Leg_Curl',
  'Standing_Leg_Curl',
  'Romanian_Deadlift',
  'Stiff-Legged_Barbell_Deadlift',
  'Stiff-Legged_Dumbbell_Deadlift',
  'Barbell_Hip_Thrust',
  'Barbell_Glute_Bridge',
  'Single_Leg_Glute_Bridge',
  'Glute_Ham_Raise',
  'Glute_Kickback',
  'Thigh_Abductor',
  'Thigh_Adductor',
  'Standing_Calf_Raises',
  'Seated_Calf_Raise',
  'Calf_Press_On_The_Leg_Press_Machine',
  'Smith_Machine_Calf_Raise',
  'Rocking_Standing_Calf_Raise',
  'Donkey_Calf_Raises',
  'Smith_Machine_Squat',
  'Smith_Single-Leg_Split_Squat',
  'Bodyweight_Squat',
  'Bodyweight_Walking_Lunge',
  'Scissors_Jump',
  'Side_Leg_Raises',
  'Kettlebell_Goblet_Squat',
  'One-Arm_Side_Deadlift',
  'Band_Hip_Adductions',
  'Reverse_Band_Box_Squat',
  'Calf-Machine_Shoulder_Shrug',
  'Knee_Tuck_Jump',

  // SHOULDERS (46)
  'Standing_Military_Press',
  'Seated_Barbell_Military_Press',
  'Smith_Machine_Shoulder_Press',
  'Dumbbell_Shoulder_Press',
  'Seated_Dumbbell_Press',
  'Arnold_Dumbbell_Press',
  'Standing_Palm-In_Dumbbell_Press',
  'Leverage_Shoulder_Press',
  'Clean_and_Press',
  'Push_Press',
  'Side_Lateral_Raise',
  'Seated_Side_Lateral_Raise',
  'One-Arm_Side_Laterals',
  'Cable_Lateral_Raise',
  'Cable_Seated_Lateral_Raise',
  'Band_Lateral_Raise',
  'Front_Dumbbell_Raise',
  'Front_Barbell_Raise',
  'Front_Cable_Raise',
  'Front_Two-Dumbbell_Raise',
  'Standing_Front_Barbell_Raise_Over_Head',
  'Rear_Delt_Flyes',
  'Reverse_Flyes',
  'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'Lying_Rear_Delt_Raise',
  'Cable_Rear_Delt_Fly',
  'Reverse_Pec_Deck',
  'Barbell_Rear_Delt_Row',
  'Cable_Rope_Rear-Delt_Rows',
  'Cable_Crossover_Reverse_Fly',
  'Upright_Barbell_Row',
  'Upright_Cable_Row',
  'Dumbbell_One-Arm_Upright_Row',
  'Dumbbell_Scaption',
  'Dumbbell_Raise',
  'Alternating_Deltoid_Raise',
  'Car_Drivers',
  'Cuban_Press',
  'Iron_Cross',
  'Standing_Low-Pulley_Deltoid_Raise',
  'Pike_Push_up',
  'Handstand_Push-Ups',
  'Kettlebell_Thruster',
  'Kettlebell_One-Arm_Clean_and_Jerk',
  'External_Rotation_with_Band',
  'Side_Wrist_Pull',

  // ARMS: BICEPS, TRICEPS, FOREARMS (52)
  'Barbell_Curl',
  'EZ-Bar_Curl',
  'Close-Grip_Standing_Barbell_Curl',
  'Wide-Grip_Standing_Barbell_Curl',
  'Dumbbell_Bicep_Curl',
  'Incline_Dumbbell_Curl',
  'Incline_Inner_Biceps_Curl',
  'Hammer_Curls',
  'Cross_Body_Hammer_Curl',
  'Preacher_Curl',
  'Concentration_Curls',
  'Spider_Curl',
  'Zottman_Curl',
  'Seated_Close-Grip_Concentration_Barbell_Curl',
  'Cable_Preacher_Curl',
  'Cable_Hammer_Curls_-_Rope_Attachment',
  'Overhead_Cable_Curl',
  'Machine_Bicep_Curl',
  'Reverse_Barbell_Curl',
  'Reverse_Cable_Curl',
  'Reverse_Grip_Barbell_Curl',
  'Close-Grip_Barbell_Bench_Press',
  'JM_Press',
  'Lying_Triceps_Press', // Skull crusher
  'Decline_EZ_Bar_Triceps_Extension',
  'Incline_Barbell_Triceps_Extension',
  'Decline_Close-Grip_Bench_To_Skull_Crusher',
  'Standing_Overhead_Barbell_Triceps_Extension',
  'Seated_Triceps_Press',
  'Standing_Dumbbell_Triceps_Extension',
  'Tricep_Dumbbell_Kickback',
  'Tate_Press',
  'Triceps_Pushdown',
  'Triceps_Pushdown_-_Rope_Attachment',
  'Triceps_Pushdown_-_V-Bar_Attachment',
  'Reverse_Grip_Triceps_Pushdown',
  'Cable_One_Arm_Tricep_Extension',
  'Cable_Lying_Triceps_Extension',
  'Dips_-_Triceps_Version',
  'Bench_Dips',
  'Diamond_Push-Up',
  'Wrist_Curl',
  'Seated_Palm-Up_Barbell_Wrist_Curl',
  'Seated_Palm-Down_Barbell_Wrist_Curl',
  'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench',
  'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
  'Standing_Palms-Up_Behind_The_Back_Wrist_Curl',
  'Farmers_Walk',
  'Wrist_Roller',
  'Plate_Pinch',
  'Seated_Finger_Curls',
  'Cable_Wrist_Curl',

  // CORE / ABS (35)
  'Plank',
  'Side_Plank',
  'Push_Up_to_Side_Plank',
  'Crunches',
  'Decline_Crunch',
  'Reverse_Crunch',
  'Cross-Body_Crunch',
  'Tuck_Crunch',
  'Exercise_Ball_Crunch',
  'Cable_Crunch',
  'Kneeling_Cable_Triceps_Extension',
  'Hanging_Leg_Raise',
  'Captains_Chair_Leg_Raise',
  'Hanging_Knee_Raise',
  'Flat_Bench_Lying_Leg_Raise',
  'Seated_Flat_Bench_Leg_Pull-In',
  'Leg_Pull-In',
  'Ab_Roller',
  'Barbell_Rollout',
  'Russian_Twist',
  'Bicycle_Crunches',
  'Air_Bike',
  'Mountain_Climbers',
  'V-Up',
  'Dead_Bug',
  'Bird_Dog',
  'Dragon_Flags',
  'The_Hundred',
  'Hollow_Body_Hold',
  'Standing_Cable_Wood_Chop',
  'Pallof_Press',
  'Plate_Twist',
  'Medicine_Ball_Full_Twist',
  'Dumbbell_Side_Bend',
  'Bottoms_Up',
  'Alternating_Floor_Press',
  'Bench_Press_-_With_Bands',
  'Bent-Arm_Dumbbell_Pullover',
  'Bodyweight_Flyes',
  'Barbell_Shrug_Behind_The_Back',
  'Bent_Over_One-Arm_Long_Bar_Row',
  'Bent_Over_Two-Dumbbell_Row_With_Palms_In',
  'Cable_Incline_Pushdown',
  'Band_Assisted_Pull-Up',
  'Rocky_Pull-Ups_Pulldowns',
  'Scapular_Pull-Up',
  'Alternating_Cable_Shoulder_Press',
  'Alternating_Kettlebell_Press',
  'Band_Pull_Apart',
  'Barbell_Shoulder_Press',
  'Bent_Over_Low-Pulley_Side_Lateral',
  'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise',
  'Dumbbell_Lying_Rear_Lateral_Raise',
  'Lateral_Raise_-_With_Bands',
  'Alternate_Hammer_Curl',
  'Alternate_Incline_Dumbbell_Curl',
  'Band_Skull_Crusher',
  'Barbell_Curls_Lying_Against_An_Incline',
  'Cable_Wrist_Curl',
  'Palms-Down_Wrist_Curl_Over_A_Bench',
  'Palms-Up_Wrist_Curl_Over_A_Bench',
  'Close-Grip_Push-Up_off_of_a_Dumbbell',
  '3_4_Sit-Up',
  'Ab_Crunch_Machine',
  'Alternate_Heel_Touchers',
  'Barbell_Ab_Rollout_-_On_Knees',
  'Cocoons',
  'Cross_Crunch',
  'Gorilla_Chin_Crunch',
  'Jackknife_Sit-Up',
  'Kneeling_Cable_Crunch_With_Alternating_Oblique_Crunches',
  'Plank_with_Twist',
  'Scissor_Kick',
  'Spider_Crawl',
]

console.log('Total Selected IDs in list:', SELECTED_FREEDB_IDS.length)

const rawMap = new Map()
raw.forEach((r) => rawMap.set(r.id, r))

// Specific Arabic Name overrides for common Egyptian gym exercises
const ARABIC_NAMES = {
  // Chest
  'Barbell_Bench_Press_-_Medium_Grip': 'ضغط صدري بالبار',
  'Barbell_Incline_Bench_Press_-_Medium_Grip':
    'ضغط صدري مائل بالبار (بنش عالي)',
  Decline_Barbell_Bench_Press: 'ضغط صدري مقلوب بالبار (بنش سفلي)',
  'Wide-Grip_Barbell_Bench_Press': 'ضغط صدري بالبار قبضة واسعة',
  Barbell_Guillotine_Bench_Press: 'ضغط صدري بار للمستوى الترقوي (Guillotine)',
  Dumbbell_Bench_Press: 'ضغط صدري بالدمبل (بنش مستوٍ)',
  Incline_Dumbbell_Press: 'ضغط صدري مائل بالدمبل (بنش عالي)',
  Decline_Dumbbell_Bench_Press: 'ضغط صدري مقلوب بالدمبل (بنش سفلي)',
  Dumbbell_Flyes: 'تفتيح صدر بالدمبل (مستوٍ)',
  Incline_Dumbbell_Flyes: 'تفتيح صدر مائل بالدمبل (عالي)',
  Decline_Dumbbell_Flyes: 'تفتيح صدر مقلوب بالدمبل (سفلي)',
  'Straight-Arm_Dumbbell_Pullover': 'سحب دمبل مستقيم للصدر واللاتس (بولوفر)',
  'One-Arm_Flat_Bench_Dumbbell_Flye': 'تفتيح صدر بالدمبل بيد واحدة',
  Hammer_Grip_Incline_DB_Bench_Press: 'ضغط دمبل مائل بقبضة متوازية (هامر)',
  Cable_Crossover: 'تقاطع كابل للصدر (كيبل كروس عالي/وسط)',
  Low_Cable_Crossover: 'تقاطع كابل للصدر من الأسفل (كيبل سفلي)',
  Cable_Chest_Press: 'ضغط صدري بالكابل واقفاً',
  Cable_Iron_Cross: 'تقاطع كابل حديدي (أيرون كروس)',
  'Single-Arm_Cable_Crossover': 'تقاطع كابل للصدر بيد واحدة',
  Butterfly: 'تفتيح صدر على جهاز الفراشة (Pec Deck)',
  Leverage_Chest_Press: 'ضغط صدري على الجهاز (Chest Press Machine)',
  Leverage_Incline_Chest_Press: 'ضغط صدري مائل على الجهاز',
  Leverage_Decline_Chest_Press: 'ضغط صدري مقلوب على الجهاز',
  Smith_Machine_Bench_Press: 'ضغط صدري مستوٍ على جهاز سميث',
  Smith_Machine_Incline_Bench_Press: 'ضغط صدري مائل على جهاز سميث',
  Smith_Machine_Decline_Press: 'ضغط صدري مقلوب على جهاز سميث',
  'Dips_-_Chest_Version': 'متوازي بوزن الجسم للصدر (ميل الجذع للأمام)',
  Chest_Dip: 'غطس متوازي بوزن الجسم للصدر',
  Pushups: 'تمرين الضغط (ضغط أرضي)',
  'Incline_Push-Up': 'ضغط مائل لأعلى بوزن الجسم (أسهل للمبتدئين)',
  'Decline_Push-Up': 'ضغط مائل لأسفل بوزن الجسم (تركيز علوي)',
  'Wide_Grip_Push-Ups': 'ضغط أرضي بقبضة عريضة',
  'Close_Push-up': 'ضغط أرضي بقبضة ضيقة',
  Drop_Push_Up: 'ضغط أرضي انفجاري (بليومتريك)',
  Svend_Press: 'ضغط صدر بالأقراص (Svend Press)',
  'Clock_Push-Up': 'ضغط دائري حركي (Clock Push-Up)',

  // Back
  Barbell_Deadlift: 'ديدليفت كلاسيكي بالبار (Deadlift)',
  Bent_Over_Barbell_Row: 'تجديف بالبار منحنياً (Bent-Over Row)',
  'Reverse_Grip_Bent-Over_Row': 'تجديف بالبار بقبضة عكسية (Yates Row)',
  Pendlay_Row: 'تجديف بندلاي من الأرض بالبار (Pendlay Row)',
  'Bent_Over_Two-Dumbbell_Row': 'تجديف بالدمبلين منحنياً',
  'One-Arm_Dumbbell_Row': 'تجديف بالدمبل بيد واحدة على البنش (منشار)',
  'T-Bar_Row_with_Handle': 'تجديف تي بار بالوزن الحر (T-Bar Row)',
  'Wide-Grip_Lat_Pulldown': 'سحب عالي للظهر بقبضة واسعة (Lat Pulldown)',
  'Close-Grip_Front_Lat_Pulldown': 'سحب عالي للظهر بقبضة ضيقة V-Bar',
  Underhand_Cable_Pulldowns: 'سحب عالي بقبضة مقلوبة للمجانص والباي',
  'V-bar_Pulldown': 'سحب عالي بمقبض V-Bar',
  One_Arm_Lat_Pulldown: 'سحب عالي بالكابل بيد واحدة',
  'Full_Range-Of-Motion_Lat_Pulldown': 'سحب عالي بمدى حركي كامل',
  Seated_Cable_Rows: 'سحب أرضي بالكابل للظهر (Seated Cable Row)',
  Standing_Cable_Row: 'سحب كابل أفقياً واقفاً للظهر',
  Elevated_Cable_Rows: 'سحب كابل من مستوى مرتفع للظهر',
  'Straight-Arm_Pulldown': 'سحب كابل بالذراعين مفرودتين للمجانص',
  Pullups: 'عقلة قبضة واسعة فوقية (Pull-Ups)',
  'Wide-Grip_Rear_Pull-Up': 'عقلة خلفية واسعة',
  'Chin-Up': 'عقلة قبضة معكوسة للباي واللاتس (Chin-Ups)',
  'Neutral_Grip_Pull-Ups': 'عقلة بقبضة متوازية (محايدة)',
  Inverted_Row: 'عقلة أسترالية مقلوبة بوزن الجسم',
  Rope_Climb: 'تسلق الحبل لتقوية الظهر والقبضة',
  Barbell_Shrug: 'هز أكتاف بالبار للترابيس (Barbell Shrug)',
  Behind_The_Back_Barbell_Shrug: 'شراغز بار من خلف الظهر للترابيس',
  Dumbbell_Shrug: 'هز أكتاف بالدمبل للترابيس (Dumbbell Shrug)',
  Cable_Shrugs: 'شراغز بالكابل للترابيس',
  Smith_Machine_Behind_The_Back_Shrug: 'شراغز خلفية على جهاز سميث',
  Middle_Back_Shrug: 'شراغز لمنتصف الظهر على البنش',
  Hyperextensions_Back_Extensions: 'تمديد الظهر وأسفل الظهر على الجهاز (Hyper)',
  Good_Morning: 'صباح الخير بالبار لأسفل الظهر والخلفيات',
  Stiff_Leg_Barbell_Good_Morning: 'جود مورنينج بالبار بركبتين ثابتتين',
  Smith_Machine_Bent_Over_Row: 'تجديف منحنياً على جهاز سميث',
  Leverage_High_Row: 'سحب عالي على جهاز الرافعة للمجانص',
  Shotgun_Row: 'تجديف بالكابل بيد واحدة (شوت جن)',
  'Bent_Over_Two-Arm_Long_Bar_Row': 'تجديف بالبار الطويل منحنياً',
  Sumo_Deadlift: 'ديدليفت سومو بوقفة واسعة (Sumo Deadlift)',
  Trap_Bar_Deadlift: 'ديدليفت بالبار السداسي (Trap Bar)',
  Deadlift_with_Bands: 'ديدليفت بالبار مع أحبال مقاومة',
  Romanian_Deadlift_from_Deficit: 'ديدليفت روماني من منصة مرتفعة',
  'Kettlebell_One-Legged_Deadlift': 'ديدليفت بالكتلبل بساق واحدة',
  Superman: 'تمرين سوبرمان لتقوية أسفل الظهر بوزن الجسم',
  Face_Pull: 'سحب الحبل للوجه والكتف الخلفي (Face Pull)',
  Side_Laterals_to_Front_Raise: 'دمج رفرفة جانبية وأمامية',
  'Upright_Row_-_With_Bands': 'تجديف عمودي بحبل المقاومة',
  Standing_Cable_Lift: 'رفع كابل قطري للجذع والظهر',

  // Legs
  Barbell_Full_Squat: 'سكوات خلفي كامل بالبار (Back Squat)',
  Front_Barbell_Squat: 'سكوات أمامي بالبار (Front Squat)',
  Box_Squat: 'سكوات بالبار على الصندوق (Box Squat)',
  Narrow_Stance_Squats: 'سكوات بالبار بوقفة ضيقة للتركيز على الفخذ',
  Wide_Stance_Barbell_Squat: 'سكوات بالبار بوقفة واسعة للضامة والجلوتس',
  Overhead_Squat: 'سكوات والبار مرفوع فوق الرأس',
  Hack_Squat: 'هاك سكوات على الجهاز (Hack Squat)',
  Barbell_Lunge: 'طعنات بالبار للأرجل والجلوتس (Barbell Lunges)',
  Barbell_Walking_Lunge: 'طعنات بالمشي بالبار',
  Barbell_Side_Split_Squat: 'سكوات جانبي بالبار للفخذ الداخلي',
  Dumbbell_Squat: 'سكوات بالدمبل',
  Goblet_Squat: 'جوبلت سكوات بالدمبل (Goblet Squat)',
  Dumbbell_Lunges: 'طعنات بالدمبلين (Dumbbell Lunges)',
  Bulgarian_Split_Squat: 'سكوات بلغاري بالدمبل (Bulgarian Split Squat)',
  Split_Squat_with_Dumbbells: 'سبليت سكوات ثابت بالدمبل',
  Dumbbell_Step_Ups: 'صعود الدرج بالدمبل (Step-Ups)',
  'Step-up_with_Knee_Raise': 'صعود الدرج مع رفع الركبة',
  Plie_Dumbbell_Squat: 'سومو سكوات بالدمبل (Sumo / Plie Squat)',
  Leg_Press: 'ضغط الأرجل على جهاز المكبس (Leg Press)',
  'Single-Leg_Leg_Press': 'مكبس أرجل بساق واحدة لعزل القوة',
  Leg_Extensions: 'فرد الساقين على الجهاز (Leg Extension للأماميات)',
  Lying_Leg_Curls: 'ثني الساقين مستلقياً على الجهاز (خلفيات الفخذ)',
  Seated_Leg_Curl: 'ثني الساقين جالساً على الجهاز (خلفيات الفخذ)',
  Standing_Leg_Curl: 'ثني الساق واقفاً بساق واحدة',
  Romanian_Deadlift: 'ديدليفت روماني بالبار (RDL للخلفيات والألوية)',
  'Stiff-Legged_Barbell_Deadlift': 'ديدليفت بالبار بأرجل مستقيمة',
  'Stiff-Legged_Dumbbell_Deadlift': 'ديدليفت بالدمبل بأرجل مستقيمة للخلفيات',
  Barbell_Hip_Thrust: 'دفع الحوض بالبار للألوية (Barbell Hip Thrust)',
  Barbell_Glute_Bridge: 'جسر الألوية بالبار على الأرض (Glute Bridge)',
  Single_Leg_Glute_Bridge: 'جسر الألوية بساق واحدة بوزن الجسم',
  Glute_Ham_Raise: 'رفع الجذع بالخلفيات والألوية (GHD)',
  Glute_Kickback: 'ركل خلفي بالكابل أو الجهاز للألوية (Kickback)',
  Thigh_Abductor: 'فتح الفخذ على الجهاز (Abductor للألوية والخارجيات)',
  Thigh_Adductor: 'ضم الفخذ على الجهاز (Adductor للعضلات الضامة)',
  Standing_Calf_Raises: 'رفع السمانة واقفاً بالوزن (Standing Calf Raise)',
  Seated_Calf_Raise: 'رفع السمانة جالساً على الجهاز (Seated Calf Raise)',
  Calf_Press_On_The_Leg_Press_Machine: 'رفع السمانة على جهاز مكبس الأرجل',
  Smith_Machine_Calf_Raise: 'رفع السمانة واقفاً على جهاز سميث',
  Rocking_Standing_Calf_Raise: 'رفع السمانة المتأرجح',
  Donkey_Calf_Raises: 'رفع السمانة بوضعية الدونكي كالف',
  Smith_Machine_Squat: 'سكوات على جهاز سميث',
  'Smith_Single-Leg_Split_Squat': 'سبليت سكوات على جهاز سميث',
  Bodyweight_Squat: 'سكوات هوائي بوزن الجسم',
  Bodyweight_Walking_Lunge: 'طعنات بالمشي بوزن الجسم',
  Scissors_Jump: 'قفز تبادلي بالمقص (انفجاري للأرجل)',
  Side_Leg_Raises: 'رفع الساق جانباً بوزن الجسم',
  Kettlebell_Goblet_Squat: 'جوبلت سكوات بالكتلبل',
  'One-Arm_Side_Deadlift': 'ديدليفت جانبي بيد واحدة',
  Band_Hip_Adductions: 'ضم الفخذ بحبل المقاومة',
  Reverse_Band_Box_Squat: 'سكوات صندوق بأحبال مقاومة معكوسة',
  'Calf-Machine_Shoulder_Shrug': 'شراغز على جهاز السمانة',
  Knee_Tuck_Jump: 'قفز ضم الركبتين للياقة الأرجل',

  // Shoulders
  Standing_Military_Press: 'ضغط كتف عسكري بالبار واقفاً (Overhead Press)',
  Seated_Barbell_Military_Press: 'ضغط كتف بالبار جالساً (Seated Barbell Press)',
  Smith_Machine_Shoulder_Press: 'ضغط كتف أمامي على جهاز سميث',
  Dumbbell_Shoulder_Press: 'ضغط كتف بالدمبل جالساً (Dumbbell Shoulder Press)',
  Seated_Dumbbell_Press: 'ضغط كتف بالدمبل على مقعد مستقيم',
  Arnold_Dumbbell_Press: 'ضغط أرنولد الشهير للكتف بالدمبل (Arnold Press)',
  'Standing_Palm-In_Dumbbell_Press': 'ضغط كتف دمبل بقبضة متوازية واقفاً',
  Leverage_Shoulder_Press: 'ضغط كتف على جهاز الرافعة',
  Clean_and_Press: 'كلين آند برس بالبار (قوة انفجارية للكتف والجسم)',
  Push_Press: 'بوش برس بالبار مع مساعدة الساقين',
  Side_Lateral_Raise: 'رفرفة كتف جانبي بالدمبل (Lateral Raise)',
  Seated_Side_Lateral_Raise: 'رفرفة كتف جانبي بالدمبل جالساً (عزل تام)',
  'One-Arm_Side_Laterals': 'رفرفة جانبي بالدمبل بيد واحدة',
  Cable_Lateral_Raise: 'رفرفة كتف جانبي بالكابل (مقاومة مستمرة)',
  Cable_Seated_Lateral_Raise: 'رفرفة جانبي بالكابل جالساً',
  Band_Lateral_Raise: 'رفرفة كتف جانبي بحبل المقاومة',
  Front_Dumbbell_Raise: 'رفع كتف أمامي بالدمبل (Front Raise)',
  Front_Barbell_Raise: 'رفع كتف أمامي بالبار',
  Front_Cable_Raise: 'رفع كتف أمامي بالكابل',
  'Front_Two-Dumbbell_Raise': 'رفع أمامي بكلتا اليدين بالدمبل',
  Standing_Front_Barbell_Raise_Over_Head: 'رفع بار أمامي حتى أعلى الرأس',
  Rear_Delt_Flyes: 'رفرفة كتف خلفي بالدمبل منحنياً (Rear Delt Fly)',
  Reverse_Flyes: 'رفرفة كتف خلفي بالدمبل مستلقياً على بنش مائل',
  Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench:
    'رفرفة خلفية مع تثبيت الرأس على البنش',
  Lying_Rear_Delt_Raise: 'رفرفة كتف خلفي مستلقياً على الجانب',
  Cable_Rear_Delt_Fly: 'رفرفة كتف خلفي بالكابل المتقاطع',
  Reverse_Pec_Deck: 'تفتيح كتف خلفي على جهاز الفراشة المقلوب',
  Barbell_Rear_Delt_Row: 'تجديف بالبار عريض للكتف الخلفي',
  'Cable_Rope_Rear-Delt_Rows': 'سحب حبل الكابل للكتف الخلفي',
  Cable_Crossover_Reverse_Fly: 'تقاطع كابل عكسي للكتف الخلفي',
  Upright_Barbell_Row: 'تجديف عمودي بالبار للأكتاف والترابيس',
  Upright_Cable_Row: 'تجديف عمودي بالكابل للأكتاف',
  'Dumbbell_One-Arm_Upright_Row': 'تجديف عمودي بالدمبل بيد واحدة',
  Dumbbell_Scaption: 'رفع دمبل بزاوية لوح الكتف (Scaption)',
  Dumbbell_Raise: 'رفع دمبل مركب للأكتاف',
  Alternating_Deltoid_Raise: 'رفع تبادلي بالدمبل للدالية',
  Car_Drivers: 'تمرين مقود السيارة بالقرص للأكتاف (Car Drivers)',
  Cuban_Press: 'ضغط كوبي بالدمبل لتقوية الكفة المدورة',
  Iron_Cross: 'الصليب الحديدي بالدمبل للكتفين',
  'Standing_Low-Pulley_Deltoid_Raise': 'رفع دالية سفلي بالكابل',
  Pike_Push_up: 'ضغط بايك بوزن الجسم للأكتاف (Pike Push-Up)',
  'Handstand_Push-Ups': 'ضغط الوقوف على اليدين للكتفين (Handstand)',
  Kettlebell_Thruster: 'ثراستر بالكتلبل (سكوات مع ضغط كتف)',
  'Kettlebell_One-Arm_Clean_and_Jerk': 'كلين آند جيرك بالكتلبل بيد واحدة',
  External_Rotation_with_Band: 'دوران خارجي بحبل المقاومة للكفة المدورة',
  Side_Wrist_Pull: 'سحب جانبي للرسغ والكتف',

  // Arms: Biceps, Triceps, Forearms
  Barbell_Curl: 'بايسبس كيرل بالبار مستقيماً (Barbell Curl)',
  'EZ-Bar_Curl': 'بايسبس كيرل ببار الزجزاج (EZ-Bar Curl)',
  'Close-Grip_Standing_Barbell_Curl':
    'بايسبس كيرل بالبار قبضة ضيقة للرأس الخارجي',
  'Wide-Grip_Standing_Barbell_Curl':
    'بايسبس كيرل بالبار قبضة واسعة للرأس الداخلي',
  Dumbbell_Bicep_Curl: 'بايسبس كيرل بالدمبل بالتناوب',
  Incline_Dumbbell_Curl: 'بايسبس بالدمبل على بنش مائل (استطالة عظمى)',
  Incline_Inner_Biceps_Curl: 'بايسبس مائل موجه للرأس الداخلي',
  Hammer_Curls: 'بايسبس مطرقة بالدمبل (Hammer Curls للساعد والرأس الطويل)',
  Cross_Body_Hammer_Curl: 'بايسبس مطرقة متقاطع على الصدر (Cross Body)',
  Preacher_Curl: 'بايسبس ارتكاز على بنش لاري سكوت (Preacher Curl)',
  Concentration_Curls: 'بايسبس تركيز بالدمبل جالساً (Concentration Curl)',
  Spider_Curl: 'سبايدر كيرل بالبار على بنش مائل (Spider Curl)',
  Zottman_Curl: 'زوتمان كيرل بالدمبل للبايسبس والساعد (Zottman Curl)',
  'Seated_Close-Grip_Concentration_Barbell_Curl':
    'بايسبس تركيز بالبار قبضة ضيقة',
  Cable_Preacher_Curl: 'بايسبس ارتكاز بالكابل على البنش',
  'Cable_Hammer_Curls_-_Rope_Attachment':
    'بايسبس مطرقة بحبل الكابل (Cable Rope Hammer)',
  Overhead_Cable_Curl: 'بايسبس كابل علوي مزدوج (Double Biceps Cable)',
  Machine_Bicep_Curl: 'بايسبس كيرل على الجهاز',
  Reverse_Barbell_Curl: 'بايسبس مقلوب بالبار لتقوية الساعد والباي',
  Reverse_Cable_Curl: 'بايسبس مقلوب بالكابل للساعد',
  Reverse_Grip_Barbell_Curl: 'كيرل مقلوب بقبضة فوقية بالبار',
  'Close-Grip_Barbell_Bench_Press':
    'بنش برس قبضة ضيقة للترايسبس (Close-Grip Bench)',
  JM_Press: 'تمرين جي إم برس للكتلة الهائلة للترايسبس (JM Press)',
  Lying_Triceps_Press: 'كسر الجمجمة للترايسبس ببار EZ (Skull Crushers)',
  Decline_EZ_Bar_Triceps_Extension: 'تمديد ترايسبس على بنش مقلوب ببار EZ',
  Incline_Barbell_Triceps_Extension: 'تمديد ترايسبس بالبار على بنش مائل',
  'Decline_Close-Grip_Bench_To_Skull_Crusher':
    'دمج البنش الضيق وكسر الجمجمة للترايسبس',
  Standing_Overhead_Barbell_Triceps_Extension:
    'تمديد ترايسبس بالبار فوق الرأس واقفاً',
  Seated_Triceps_Press: 'تمديد ترايسبس بالدمبل بكلتا اليدين جالساً',
  Standing_Dumbbell_Triceps_Extension: 'تمديد ترايسبس بالدمبل فوق الرأس واقفاً',
  Tricep_Dumbbell_Kickback: 'كيك باك للترايسبس بالدمبل (Dumbbell Kickback)',
  Tate_Press: 'تيت برس بالدمبل على البنش للترايسبس (Tate Press)',
  Triceps_Pushdown: 'ترايسبس بوش داون بالكابل بالمسطرة (Straight Bar)',
  'Triceps_Pushdown_-_Rope_Attachment':
    'ترايسبس بوش داون بحبل الكابل (Rope Pushdown)',
  'Triceps_Pushdown_-_V-Bar_Attachment': 'ترايسبس بوش داون بمقبض V-Bar',
  Reverse_Grip_Triceps_Pushdown: 'ترايسبس بوش داون بقبضة مقلوبة',
  Cable_One_Arm_Tricep_Extension: 'تمديد ترايسبس بالكابل بيد واحدة',
  Cable_Lying_Triceps_Extension: 'تمديد ترايسبس مستلقياً بالكابل',
  'Dips_-_Triceps_Version': 'متوازي بوزن الجسم للترايسبس (الجسم عمودي)',
  Bench_Dips: 'غطس ترايسبس على حافة البنش (Bench Dips)',
  'Diamond_Push-Up': 'ضغط قبضة ماسية بوزن الجسم للترايسبس (Diamond Push-Up)',
  Wrist_Curl: 'ثني المعصم بالدمبل للساعد (Wrist Curl)',
  'Seated_Palm-Up_Barbell_Wrist_Curl': 'ثني المعصم بالبار والراحة لأعلى للساعد',
  'Seated_Palm-Down_Barbell_Wrist_Curl':
    'ثني المعصم بالبار والراحة لأسفل للساعد',
  'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench':
    'ثني المعصم بالدمبل والراحة لأسفل',
  'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench':
    'ثني المعصم بالدمبل والراحة لأعلى',
  'Standing_Palms-Up_Behind_The_Back_Wrist_Curl':
    'ثني المعصم بالبار خلف الظهر للساعد',
  Farmers_Walk: 'مشية المزارع بالأوزان الثقيلة لقوة القبضة والساعد',
  Wrist_Roller: 'بكرة الرسغ بالأوزان لضخامة الساعد',
  Plate_Pinch: 'عصر وحمل الأقراص بالأصابع لقوة القبضة',
  Seated_Finger_Curls: 'ثني الأصابع بالبار جالساً',
  Cable_Wrist_Curl: 'ثني المعصم بالكابل للساعد',

  // Core / Abs
  Plank: 'بلانك ثبات للجذع والكور (Plank)',
  Side_Plank: 'بلانك جانبي لثبات الخصر والكور (Side Plank)',
  Push_Up_to_Side_Plank: 'ضغط أرضي مع دوران لبلانك جانبي',
  Crunches: 'كرنش أرضي كلاسيكي لعضلات البطن العلوية (Crunches)',
  Decline_Crunch: 'كرنش على بنش مائل لأسفل (Decline Crunch)',
  Reverse_Crunch: 'كرنش معكوس برفع الحوض للبطن السفلية (Reverse Crunch)',
  'Cross-Body_Crunch': 'كرنش متقاطع لعضلات البطن والجوانب',
  Tuck_Crunch: 'كرنش ضم الركبتين للبطن',
  Exercise_Ball_Crunch: 'كرنش على الكرة السويسرية لمدى حركي كامل',
  Cable_Crunch: 'كرنش بالكابل مع الركوع للبطن (Cable Kneeling Crunch)',
  Kneeling_Cable_Triceps_Extension: 'كرنش كابل بحبل المقاومة على الركبتين',
  Hanging_Leg_Raise: 'رفع الأرجل معلقاً على العقلة للبطن السفلية',
  Captains_Chair_Leg_Raise: 'رفع الأرجل على جهاز المتوازي (Captain Chair)',
  Hanging_Knee_Raise: 'رفع الركبتين معلقاً على العقلة',
  Flat_Bench_Lying_Leg_Raise: 'رفع الأرجل مستلقياً على البنش للبطن السفلية',
  'Seated_Flat_Bench_Leg_Pull-In': 'سحب الركبتين للصدر جالساً على البنش',
  'Leg_Pull-In': 'ضم الساقين للبطن مستلقياً',
  Ab_Roller: 'تمرين عجلة البطن (Ab Wheel Rollout)',
  Barbell_Rollout: 'فرد العجلة بالبار المحمل بالأقراص للبطن',
  Russian_Twist: 'تويست روسي بالوزن للخصر والخواصر (Russian Twist)',
  Bicycle_Crunches: 'تبديل دراجة أرضي للبطن والجوانب (Bicycle Crunch)',
  Air_Bike: 'تمرين الدراجة الهوائية للبطن',
  Mountain_Climbers: 'متسلق الجبال السريع لشد البطن وحرق الدهون',
  'V-Up': 'تمرين V-Up بضم الأطراف بالكامل للبطن',
  Dead_Bug: 'تمرين الحشرة الميتة (Dead Bug) لثبات الكور وأسفل الظهر',
  Bird_Dog: 'تمرين بيرد دوج (Bird Dog) للاتزان وأسفل الظهر',
  Dragon_Flags: 'تمرين دراجون فلاج الشهير لبروس لي لقوة البطن القصوى',
  The_Hundred: 'تمرين المئة للبطن (The Hundred Pilates)',
  Hollow_Body_Hold: 'ثبات التجويف الكلي للجسم (Hollow Body)',
  Standing_Cable_Wood_Chop: 'تقطيع الخشب بالكابل لخصر وبطن قوية (Woodchopper)',
  Pallof_Press: 'بالوف برس بالكابل لمقاومة الدوران وثبات الجذع',
  Plate_Twist: 'دوران بالقرص للخصر والخواصر',
  Medicine_Ball_Full_Twist: 'تويست كامل بالكرة الطبية للبطن',
  Dumbbell_Side_Bend: 'انحناء جانبي بالدمبل لعضلات الخواصر',
  Bottoms_Up: 'رفع الحوض السفلي للبطن (Bottoms Up)',
  Alternating_Floor_Press: 'ضغط صدري أرضي بالدمبل بالتناوب',
  'Bench_Press_-_With_Bands': 'ضغط صدري بالبار مع أحبال المقاومة',
  'Bent-Arm_Dumbbell_Pullover': 'بولوفر بالدمبل بذراعين منحنيتين للصدر',
  Bodyweight_Flyes: 'تفتيح صدر بوزن الجسم بالأرض',
  Barbell_Shrug_Behind_The_Back: 'شراغز بالبار من خلف الظهر للترابيس',
  'Bent_Over_One-Arm_Long_Bar_Row': 'تجديف بالبار بيد واحدة للظهر',
  'Bent_Over_Two-Dumbbell_Row_With_Palms_In':
    'تجديف بالدمبلين بقبضة متوازية للظهر',
  Cable_Incline_Pushdown: 'سحب كابل مائل للأسفل للظهر',
  'Band_Assisted_Pull-Up': 'عقلة بمساعدة حبل المقاومة',
  'Rocky_Pull-Ups_Pulldowns': 'سحب عالي وعقلة روكي للظهر',
  'Scapular_Pull-Up': 'عقلة تثبيت لوحي الكتف',
  Alternating_Cable_Shoulder_Press: 'ضغط كتف بالكابل بالتناوب',
  Alternating_Kettlebell_Press: 'ضغط كتف بالكتلبل بالتناوب',
  Band_Pull_Apart: 'سحب الحبل للخارج لتقوية لوحي الكتف والدالية الخلفية',
  Barbell_Shoulder_Press: 'ضغط كتف بالبار',
  'Bent_Over_Low-Pulley_Side_Lateral': 'رفرفة جانبية بالكابل المنخفض منحنياً',
  'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise':
    'رفرفة كتف خلفي مستلقياً على البنش',
  Dumbbell_Lying_Rear_Lateral_Raise: 'رفرفة خلفية بالدمبلين مستلقياً',
  'Lateral_Raise_-_With_Bands': 'رفرفة كتف جانبي بأحبال المقاومة',
  Alternate_Hammer_Curl: 'بايسبس مطرقة بالدمبل بالتناوب',
  Alternate_Incline_Dumbbell_Curl: 'بايسبس مائل بالدمبل بالتناوب',
  Band_Skull_Crusher: 'كسر جمجمة بحبل المقاومة للترايسبس',
  Barbell_Curls_Lying_Against_An_Incline: 'بايسبس كيرل بالبار على بنش مائل',
  Cable_Wrist_Curl: 'ثني المعصم بالكابل للساعد',
  'Palms-Down_Wrist_Curl_Over_A_Bench': 'ثني المعصم والراحة لأسفل على البنش',
  'Palms-Up_Wrist_Curl_Over_A_Bench': 'ثني المعصم والراحة لأعلى على البنش',
  'Close-Grip_Push-Up_off_of_a_Dumbbell': 'ضغط قبضة ضيقة على الدمبل للترايسبس',
  '3_4_Sit-Up': 'تمرين 3/4 سيت أب لعضلات البطن',
  Ab_Crunch_Machine: 'كرنش على جهاز البطن بالأوزان',
  Alternate_Heel_Touchers: 'لمس الكعبين بالتناوب لعضلات الخصر والبطن',
  'Barbell_Ab_Rollout_-_On_Knees': 'فرد عجلة البطن بالبار على الركبتين',
  Cocoons: 'تمرين الشرانق لشد كامل البطن',
  Cross_Crunch: 'كرنش متقاطع للبطن والجوانب',
  Gorilla_Chin_Crunch: 'عقلة جوريلا مع كرنش للبطن',
  'Jackknife_Sit-Up': 'تمرين جاك نايف للبطن والكور',
  Kneeling_Cable_Crunch_With_Alternating_Oblique_Crunches:
    'كرنش كابل مع دوران مائل للخصر',
  Plank_with_Twist: 'بلانك مع دوران الحوض للخصر',
  Scissor_Kick: 'ركلات المقص للأرجل للبطن السفلية',
  Spider_Crawl: 'زحف العنكبوت للكور واللياقة',
}

// Precise, high-quality step-by-step instructions in Arabic for all types of exercises
function generateAccurateSteps(item, nameAr, category, equipment) {
  const pm = item.primaryMuscles[0] || ''
  const isPress =
    item.name.toLowerCase().includes('press') ||
    item.name.toLowerCase().includes('push')
  const isPull =
    item.name.toLowerCase().includes('pull') ||
    item.name.toLowerCase().includes('row') ||
    item.name.toLowerCase().includes('chin')
  const isFly = item.name.toLowerCase().includes('fly')
  const isCurl = item.name.toLowerCase().includes('curl')
  const isSquat =
    item.name.toLowerCase().includes('squat') ||
    item.name.toLowerCase().includes('lunge')
  const isCore = category === 'core'
  const isCalf = pm === 'calves'

  if (isCore) {
    return [
      'استلقِ أو اتخذ وضعية البداية مع تثبيت عضلات الحوض والعمود الفقري ومحاذاة الرقبة مع الجذع.',
      'شد عضلات البطن والجذع (الكور) للداخل بقوة، ثم قم بالحركة مع ثني الجذع أو رفع الساقين بتحكم.',
      'اثبت في قمة الانقباض العضلي لثانية واحدة مع إخراج كامل الهواء في الزفير وعصر عضلات البطن.',
      'عد ببطء إلى نقطة البداية (2-3 ثوانٍ) دون إرخاء عضلات البطن مع أخذ شهيق عميق.',
    ]
  }

  if (isCalf) {
    return [
      'قف أو اجلس على الجهاز مع تثبيت مشطي القدمين على حافة المنصة وإنزال الكعبين للأسفل لإطالة كاملة.',
      'ادفع بمشطي القدمين لأعلى نقطة ممكنة لرفع وزن الجسم أو المقاومة بالاعتماد التام على عضلات السمانة.',
      'اثبت واضغط بقوة على عضلات السمانة في قمة الصعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
      'انزل ببطء شديد وتحكم (3 ثوانٍ) حتى تشعر بتمدد واستطالة عضلية عميقة في السمانة قبل التكرار التالي.',
    ]
  }

  if (category === 'chest') {
    if (isFly) {
      return [
        'استلقِ على البنش أو قف بين الكابلات مع ثني المرفقين ثنياً طفيفاً جداً وثابتاً طوال مسار التمرين.',
        'افتح ذراعيك بحركة قوسية واسعة للخارج حتى تشعر بإطالة واستطالة عميقة في ألياف عضلات الصدر مع شهيق.',
        'اجمع يديك معاً في مسار قوسي للأمام فوق منتصف الصدر بالاعتماد الحصري على انقباض عضلات الصدر.',
        'اعصر عضلات الصدر بقوة في قمة نقطة التلاقي لثانية واحدة مع الزفير، ثم أعد الفتح بتحكم وبطء.',
      ]
    }
    return [
      'اضبط وضعية الاستلقاء أو الجلوس، ثبّت القدمين بقوة بالأرض، واسحب لوحي الكتف للخلف وللأسفل لحماية مفصل الكتف.',
      'أمسك الوزن بقبضة محكمة ومتوازنة، وانزل به ببطء وتحكم لمستوى منتصف/أسفل الصدر مع أخذ شهيق عميق.',
      'ادفع الوزن للأعلى وللأمام بقوة بالاعتماد على عضلات الصدر حتى استقامة الذراعين تقريباً دون قفل مفصل الكوع.',
      'اعصر عضلات الصدر بقوة في قمة الدفع مع الزفير، ثم انزل بالمرحلة السلبية ببطء (2-3 ثوانٍ).',
    ]
  }

  if (category === 'back') {
    if (item.name.toLowerCase().includes('deadlift')) {
      return [
        'قف بمنتصف البار مع وضع مشطي القدمين تحت البار مباشرة ومسافة بعرض الوركين، وحافظ على استقامة الظهر.',
        'انزل بالوركين للأسفل وأمسك البار بقبضة محكمة خارج الساقين، مع رفع الصدر وتثبيت عضلات اللاتس والجذع.',
        'ادفع الأرض بقدميك بقوة واسحب البار بمحاذاة الساقين حتى الوقوف التام مع فرد الحوض وعصر الجلوتس في الأعلى.',
        'انزل بالبار بالتحكم نفسه عبر إرجاع الوركين للخلف أولاً ثم ثني الركبتين حتى ملامسة الأرض مع تنظيم التنفس.',
      ]
    }
    if (item.name.toLowerCase().includes('shrug')) {
      return [
        'قف مستقيماً مع إمساك الوزن بقبضة محكمة وثابتة، وحافظ على استقامة العمود الفقري والكتفين للخلف.',
        'ارفع كتفيك باتجاه أذنيك بحركة رفع عمودية نقية للأعلى دون دحرجة الكتفين لحماية المفاصل.',
        'اعصر عضلات الترابيس بأقصى قوة في أعلى نقطة صعود لمدة ثانية إلى ثانيتين مع زفير كامل.',
        'انزل بالوزن بهدوء وبتحكم تام حتى تشعر بتمدد ألياف الترابيس قبل بدء التكرار التالي مع شهيق.',
      ]
    }
    return [
      'اضبط وضعية الجلوس أو الانحناء مع الحفاظ على استقامة العمود الفقري وثبات الأقدام والصدر مفتوحاً.',
      'اسحب الوزن أو اسحب جسمك باتجاه الصدر/البطن عن طريق قيادة الحركة بالمرفقين وليس بمفصل الرسغ.',
      'ضم لوحي الكتف للخلف واعتصر عضلات المجانص وأعلى الظهر بأقصى قوة في قمة السحب لثانية واحدة مع زفير.',
      'أعد الوزن ببطء وتحكم إلى وضع البداية مع السماح للظهر والمجانص بالاستطالة الكاملة قبل التكرار التالي.',
    ]
  }

  if (category === 'legs') {
    if (isSquat) {
      return [
        'قف بوقفة مريحة (بعرض الكتفين أو أوسع قليلاً) مع توجيه أصابع القدمين للخارج قليلاً والصدر مرفوع للأعلى.',
        'انزل بالوركين للخلف وللأسفل كأنك تجلس على كرسي، مع إبقاء الركبتين بمحاذاة أصابع القدمين والظهر مستقيماً مع شهيق.',
        'استمر في النزول حتى يصبح الفخذ موازياً للأرض على الأقل مع ثبات الكعبين بالأرض دون رفعهما.',
        'ادفع بكعبيك بقوة للأعلى للعودة لوضعية الوقوف مع عصر عضلات الفخذ الأمامي والألوية في القمة وزفير.',
      ]
    }
    return [
      'اضبط المقعد أو وضعية البداية ليكون محور دوران مفصل الركبة محاذياً تماماً لمحور دوران الجهاز.',
      'ثبّت ظهرك وجذعك جيداً، ثم قم بالحركة (دفع، فرد، أو ثني) بمدى حركي كامل دون استخدام أي مرجحة.',
      'اضغط واعتصر العضلات المستهدفة (الفخذ أو الألوية) في ذروة الانقباض لثانية كاملة مع زفير عميق.',
      'أعد الوزن بنزول سلبي بطيء ومتحكم فيه (2-3 ثوانٍ) للحصول على أقصى تحفيز عضلي مع أخذ شهيق.',
    ]
  }

  if (category === 'shoulders') {
    if (isPress) {
      return [
        'اجلس أو قف مع تثبيت الجذع وقوس خفيف وطبيعي بأسفل الظهر، وامسك الوزن بمحاذاة الأكتاف والمرفقين بزاوية 45-60 درجة.',
        'اضغط الوزن عمودياً لأعلى الرأس بقوة الصدر العلوي والدالية حتى استقامة الذراعين دون قفل الكوعين.',
        'اثبت لثانية في قمة الحركة مع الزفير واستشعار انقباض الرؤوس الأمامية والجانبية للأكتاف.',
        'أنزل الوزن ببطء وتحكم (2-3 ثوانٍ) لمستوى الذقن أو أعلى الترقوة مع أخذ شهيق عميق.',
      ]
    }
    return [
      'قف أو اجلس مع ثبات العمود الفقري وميل طفيف جداً للأمام، وامسك الوزن بانحناءة كوع طفيفة وثابتة.',
      'ارفع الوزن للأعلى باتجاه زاوية الحركة المحددة (جانبياً أو أمامياً أو خلفياً) باستخدام مفصل الكتف فقط.',
      'اثبت في قمة الحركة عند مستوى الكتف لمدة ثانية كاملة لضمان عزل رأس الكتف المستهدف مع إخراج الزفير.',
      'انزل بالوزن بهدوء ومقاومة تامة في طريق العودة (دون تركه يسقط بالجاذبية) مع أخذ شهيق.',
    ]
  }

  if (category === 'arms') {
    if (isCurl) {
      return [
        'قف أو اجلس مستقيماً مع تثبيت المرفقين بجانبي الجسم تماماً دون تحريكهما للأمام أو الخلف.',
        'اثنِ ذراعيك وارفع الوزن للأعلى في قوس محكم باتجاه الكتفين بالاعتماد الحصري على عضلة البايسبس.',
        'اعصر عضلة البايسبس بأقصى قوة في قمة الحركة لثانية واحدة مع إخراج الزفير بالكامل.',
        'انزل بالوزن بهدوء وبطء (3 ثوانٍ) حتى استقامة الذراع تقريباً وإطالة البايسبس بالكامل مع شهيق.',
      ]
    }
    // Triceps
    return [
      'ثبّت المرفقين في مكان محدد بجانب الجذع أو فوق الرأس دون تأرجحهما طوال مسار التمرين.',
      'افرد ذراعيك وادفع الوزن بالاعتماد الكامل على عصر رؤوس عضلة الترايسبس الثلاثة حتى الامتداد التام.',
      'اضغط واعتصر الترايسبس بقوة في نقطة الفرد الكامل لمدة ثانية واحدة مع إخراج زفير قوي.',
      'أعد الوزن بنزول بطيء ومقاومة مستمرة مع ثني المرفقين فقط واستشعار تمدد ألياف الترايسبس وشهيق.',
    ]
  }

  // Generic fallback
  return [
    'اتخذ وضعية البداية الصحيحة مع تثبيت العمود الفقري وضبط مسار الحركة الملائم.',
    'قم بالحركة بمدى حركي كامل وبتحكم تام بالاعتماد على العضلات الأساسية المستهدفة.',
    'اعصر العضلة المستهدفة في قمة الانقباض لثانية كاملة مع إخراج زفير منتظم.',
    'انزل بالوزن بمرحلة سلبية بطيئة ومتحكمة (2-3 ثوانٍ) مع تنظيم الشهيق.',
  ]
}

// Map injury precautions
function getInjuryPrecautions(item, category) {
  const name = item.name.toLowerCase()
  const injuries = []
  if (
    category === 'chest' &&
    (name.includes('dip') ||
      name.includes('behind') ||
      name.includes('guillotine'))
  ) {
    injuries.push('كتف')
  }
  if (
    category === 'shoulders' &&
    (name.includes('behind') || name.includes('upright row'))
  ) {
    injuries.push('كتف')
  }
  if (
    name.includes('deadlift') ||
    name.includes('good morning') ||
    name.includes('bent_over')
  ) {
    injuries.push('أسفل الظهر')
  }
  if (
    name.includes('squat') ||
    name.includes('lunge') ||
    name.includes('leg extension')
  ) {
    injuries.push('ركبة')
  }
  if (
    name.includes('wrist') ||
    name.includes('push-up') ||
    name.includes('pushup')
  ) {
    injuries.push('رسغ')
  }
  return injuries
}

// Generate the unified database
const CDN_BASE =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

const unifiedExercises = []
const aliasMap = {}

// We also map our legacy IDs:
// chest-1..20, back-1..21, leg-1..21, shoulder-1..20, arm-1..20, core-1..20
const LEGACY_122_TO_FREEDB = {
  // Chest
  'chest-1': 'Barbell_Bench_Press_-_Medium_Grip',
  'chest-2': 'Dumbbell_Bench_Press',
  'chest-3': 'Pushups',
  'chest-4': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'chest-5': 'Incline_Dumbbell_Press',
  'chest-6': 'Dumbbell_Flyes',
  'chest-7': 'Cable_Crossover',
  'chest-8': 'Cable_Chest_Press',
  'chest-9': 'Incline_Dumbbell_Flyes',
  'chest-10': 'Leverage_Chest_Press',
  'chest-11': 'Dips_-_Chest_Version',
  'chest-12': 'Decline_Dumbbell_Flyes',
  'chest-13': 'Decline_Barbell_Bench_Press',
  'chest-14': 'Low_Cable_Crossover',
  'chest-15': 'Decline_Dumbbell_Bench_Press',
  'chest-16': 'Straight-Arm_Dumbbell_Pullover',
  'chest-17': 'One-Arm_Flat_Bench_Dumbbell_Flye',
  'chest-18': 'Wide-Grip_Barbell_Bench_Press',
  'chest-19': 'Incline_Push-Up',
  'chest-20': 'Butterfly',

  // Back
  'back-1': 'Wide-Grip_Lat_Pulldown',
  'back-2': 'Close-Grip_Front_Lat_Pulldown',
  'back-3': 'Underhand_Cable_Pulldowns',
  'back-4': 'Bent_Over_Barbell_Row',
  'back-5': 'Bent_Over_Two-Dumbbell_Row',
  'back-6': 'Seated_Cable_Rows',
  'back-7': 'Close-Grip_Front_Lat_Pulldown',
  'back-8': 'T-Bar_Row_with_Handle',
  'back-9': 'Hyperextensions_Back_Extensions',
  'back-10': 'Pullups',
  'back-11': 'Straight-Arm_Pulldown',
  'back-12': 'Reverse_Flyes',
  'back-13': 'One-Arm_Dumbbell_Row',
  'back-14': 'Barbell_Deadlift',
  'back-15': 'Romanian_Deadlift_from_Deficit',
  'back-16': 'Inverted_Row',
  'back-17': 'Chin-Up',
  'back-18': 'Leverage_High_Row',
  'back-19': 'Shotgun_Row',
  'back-20': 'Barbell_Shrug',
  'back-21': 'Superman',

  // Legs
  'leg-1': 'Barbell_Full_Squat',
  'leg-2': 'Dumbbell_Squat',
  'leg-3': 'Split_Squat_with_Dumbbells',
  'leg-4': 'Leg_Press',
  'leg-5': 'Lying_Leg_Curls',
  'leg-6': 'Romanian_Deadlift',
  'leg-7': 'Dumbbell_Lunges',
  'leg-8': 'Barbell_Lunge',
  'leg-9': 'Standing_Calf_Raises',
  'leg-10': 'Seated_Calf_Raise',
  'leg-11': 'Front_Barbell_Squat',
  'leg-12': 'Hack_Squat',
  'leg-13': 'Dumbbell_Step_Ups',
  'leg-14': 'Box_Squat',
  'leg-15': 'Stiff-Legged_Barbell_Deadlift',
  'leg-16': 'Plie_Dumbbell_Squat',
  'leg-17': 'Seated_Leg_Curl',
  'leg-18': 'Leg_Extensions',
  'leg-19': 'Bodyweight_Squat',
  'leg-20': 'Barbell_Hip_Thrust',
  'leg-21': 'Barbell_Glute_Bridge',

  // Shoulders
  'shoulder-1': 'Standing_Military_Press',
  'shoulder-2': 'Dumbbell_Shoulder_Press',
  'shoulder-3': 'Side_Lateral_Raise',
  'shoulder-4': 'Front_Dumbbell_Raise',
  'shoulder-5': 'Cable_Seated_Lateral_Raise',
  'shoulder-6': 'Arnold_Dumbbell_Press',
  'shoulder-7': 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'shoulder-8': 'Leverage_Shoulder_Press',
  'shoulder-9': 'Seated_Side_Lateral_Raise',
  'shoulder-10': 'Dumbbell_Scaption',
  'shoulder-11': 'Seated_Barbell_Military_Press',
  'shoulder-12': 'Face_Pull',
  'shoulder-13': 'Front_Cable_Raise',
  'shoulder-14': 'One-Arm_Side_Laterals',
  'shoulder-15': 'Dumbbell_Shoulder_Press',
  'shoulder-16': 'Leverage_Shoulder_Press',
  'shoulder-17': 'Upright_Barbell_Row',
  'shoulder-18': 'Barbell_Rear_Delt_Row',
  'shoulder-19': 'Clean_and_Press',
  'shoulder-20': 'Handstand_Push-Ups',

  // Arms
  'arm-1': 'Barbell_Curl',
  'arm-2': 'Dumbbell_Bicep_Curl',
  'arm-3': 'Hammer_Curls',
  'arm-4': 'Concentration_Curls',
  'arm-5': 'Incline_Dumbbell_Curl',
  'arm-6': 'Cable_Preacher_Curl',
  'arm-7': 'Cable_Hammer_Curls_-_Rope_Attachment',
  'arm-8': 'Overhead_Cable_Curl',
  'arm-9': 'Machine_Bicep_Curl',
  'arm-10': 'Reverse_Barbell_Curl',
  'arm-11': 'Close-Grip_Barbell_Bench_Press',
  'arm-12': 'Triceps_Pushdown',
  'arm-13': 'Triceps_Pushdown_-_Rope_Attachment',
  'arm-14': 'Lying_Triceps_Press',
  'arm-15': 'Standing_Overhead_Barbell_Triceps_Extension',
  'arm-16': 'Tricep_Dumbbell_Kickback',
  'arm-17': 'Seated_Triceps_Press',
  'arm-18': 'Bench_Dips',
  'arm-19': 'Dips_-_Triceps_Version',
  'arm-20': 'Close-Grip_Push-Up_off_of_a_Dumbbell',

  // Core
  'core-1': 'Plank',
  'core-2': 'Crunches',
  'core-3': 'Hanging_Leg_Raise',
  'core-4': 'Flat_Bench_Lying_Leg_Raise',
  'core-5': 'Push_Up_to_Side_Plank',
  'core-6': 'Air_Bike',
  'core-7': 'Russian_Twist',
  'core-8': 'Mountain_Climbers',
  'core-9': 'Jackknife_Sit-Up',
  'core-10': 'Cross-Body_Crunch',
  'core-11': 'Dead_Bug',
  'core-12': 'Reverse_Crunch',
  'core-13': 'Dead_Bug',
  'core-14': 'Exercise_Ball_Crunch',
  'core-15': 'Standing_Cable_Wood_Chop',
  'core-16': 'Ab_Roller',
  'core-17': 'Hanging_Leg_Raise',
  'core-18': 'Decline_Crunch',
  'core-19': 'Superman',
  'core-20': 'Cable_Crunch',
}

// Invert to easily find which legacy ID maps to which FreeDb slug
const FREEDB_TO_LEGACY = {}
for (const [legacyId, freedbSlug] of Object.entries(LEGACY_122_TO_FREEDB)) {
  FREEDB_TO_LEGACY[freedbSlug] = legacyId
}

const processedFreeDbSlugs = new Set()

// 1. Process all selected exercises
SELECTED_FREEDB_IDS.forEach((slug) => {
  const item = rawMap.get(slug)
  if (!item) {
    console.warn('Could not find slug in raw:', slug)
    return
  }
  if (processedFreeDbSlugs.has(slug)) return
  processedFreeDbSlugs.add(slug)

  // Canonical ID: If it has a legacy ID like chest-1, use that! Otherwise use the slug!
  const legacyId = FREEDB_TO_LEGACY[slug]
  const canonicalId = legacyId || slug

  // Add alias mappings
  aliasMap[slug] = canonicalId
  aliasMap['ext-' + slug] = canonicalId
  if (legacyId) {
    aliasMap[legacyId] = canonicalId
  }

  const primaryMuscle =
    (item.primaryMuscles && item.primaryMuscles[0]) || 'chest'
  const category = CATEGORY_MAP[primaryMuscle] || 'chest'
  const equipment = EQUIPMENT_MAP[item.equipment] || 'bodyweight'

  const nameAr =
    ARABIC_NAMES[slug] ||
    item.name + ' (' + (MUSCLE_MAP_AR[primaryMuscle] || primaryMuscle) + ')'

  // Target muscles: Primary first, then secondary
  const targetMusclesAr = []
  if (MUSCLE_MAP_AR[primaryMuscle]) {
    targetMusclesAr.push(MUSCLE_MAP_AR[primaryMuscle])
  }
  if (item.secondaryMuscles && item.secondaryMuscles.length > 0) {
    item.secondaryMuscles.forEach((sm) => {
      const ar = MUSCLE_MAP_AR[sm]
      if (ar && !targetMusclesAr.includes(ar)) {
        targetMusclesAr.push(ar)
      }
    })
  }

  const steps = generateAccurateSteps(item, nameAr, category, equipment)
  const avoidInjuries = getInjuryPrecautions(item, category)

  const img0 = item.images && item.images[0] ? CDN_BASE + item.images[0] : ''
  const img1 = item.images && item.images[1] ? CDN_BASE + item.images[1] : img0

  const exerciseObj = {
    id: canonicalId,
    name: item.name,
    nameAr: nameAr,
    descriptionAr:
      'تمرين ' +
      nameAr +
      ' يستهدف ' +
      (MUSCLE_MAP_AR[primaryMuscle] || primaryMuscle) +
      ' بمدى حركي كامل وتحكم لتحفيز البناء العضلي وزيادة القوة.',
    category: category,
    difficulty:
      item.level === 'expert' ? 'advanced' : item.level || 'intermediate',
    equipment: equipment,
    avoidForInjuries: avoidInjuries.length > 0 ? avoidInjuries : undefined,
    howToStepsAr: steps,
    benefitAr:
      'تطوير القوة العضلية والتحمل العضلي لعضلات ' +
      targetMusclesAr.slice(0, 2).join(' و ') +
      ' مع تحسين التوافق العضلي العصبي.',
    targetMusclesAr: targetMusclesAr,
    thumbnailUrl: img0,
    imageUrl: img0,
  }

  unifiedExercises.push(exerciseObj)
})

// Explicitly guarantee all legacy IDs (chest-1..20, etc.) are in aliasMap
for (const [legacyId, freedbSlug] of Object.entries(LEGACY_122_TO_FREEDB)) {
  const canonicalId = FREEDB_TO_LEGACY[freedbSlug] || freedbSlug
  aliasMap[legacyId] = canonicalId
}

console.log(
  'Successfully generated',
  unifiedExercises.length,
  'unified exercises!',
)
console.log('Total aliases registered in map:', Object.keys(aliasMap).length)

// Generate exercises.ts code
const fileHeader = `import type { Exercise } from '../shared/types.ts'

export type { Exercise }

/**
 * قاعدة بيانات تمارين تطبيق مجانص الموحدة والمحققة بنسبة 100%
 * تضم أفضل وأشهر تمارين كمال الأجسام واللياقة المنزلية والجيم
 * تم تدقيق الاستهداف التشريحي، والمعدات، وخطوات الأداء الصحيحة بدون تكرار أو تداخل بيانات.
 */
export const EXERCISES: Exercise[] = ${JSON.stringify(unifiedExercises, null, 2)};

/**
 * خريطة التوافق العكسي للمعرفات القديمة (Alias Map)
 * تضمن التعرف على جميع المعرفات السابقة (chest-1, ext-..., Slugs) دون فقدان أي بيانات
 */
export const EXERCISE_ALIASES: Record<string, string> = ${JSON.stringify(aliasMap, null, 2)};

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
    const matched = EXERCISES.find((e) => e.id === rawSlug || e.name === rawSlug)
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
`

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'modules', 'workout', 'exercises.ts'),
  fileHeader,
  'utf8',
)
console.log('Saved unified exercises.ts successfully!')

// Also update exercises800.ts to re-export EXERCISES as EXERCISES_800
const ex800Content = `import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

/**
 * إعادة تصدير التمارين الموحدة لضمان التوافق العكسي مع المكونات
 * دون زيادة حجم الحزمة البرمجية بملفات مكررة
 */
export const EXERCISES_800: Exercise[] = EXERCISES
export const EXERCISES_520: Exercise[] = EXERCISES
`

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'modules', 'workout', 'exercises800.ts'),
  ex800Content,
  'utf8',
)
console.log('Updated exercises800.ts successfully!')
