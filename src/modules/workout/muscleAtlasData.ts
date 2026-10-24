/**
 * Anatomical Head-Level Muscle Atlas for Maganis
 * Contains exact SVG paths, bounding boxes, layers, and bilingual metadata
 * for all 48 anatomical muscle heads across Anterior and Posterior views.
 *
 * ViewBox: 0 0 200 440 (Center X = 100)
 */

export type MuscleView = 'A' | 'P' | 'A+P'
export type MuscleLayer = 'S' | 'D' // Superficial vs Deep
export type MuscleRegion =
  'chest' | 'shoulders' | 'arms' | 'back' | 'core' | 'legs'

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface MuscleDefinition {
  id: string
  nameAr: string
  nameEn: string
  view: MuscleView
  layer: MuscleLayer
  region: MuscleRegion
  /** SVG Path string for Anterior view (bilateral) */
  pathA?: string
  /** SVG Path string for Posterior view (bilateral) */
  pathP?: string
  bboxA?: BoundingBox
  bboxP?: BoundingBox
}

export const ROLE_COLORS = {
  primary: {
    fill: '#E53935',
    outline: '#B71C1C',
  },
  secondary: {
    fill: '#FDD835',
    outline: '#F9A825',
  },
  neutralLight: {
    fill: '#cbd5e1',
    outline: '#94a3b8',
  },
  neutralDark: {
    fill: '#334155',
    outline: '#475569',
  },
} as const

export const MUSCLE_REGIONS_AR: Record<MuscleRegion, string> = {
  chest: 'الصدر (Chest)',
  shoulders: 'الأكتاف (Shoulders)',
  arms: 'الذراعين (Arms)',
  back: 'الظهر (Back)',
  core: 'البطن والجذع (Core)',
  legs: 'الأرجل والحوض (Legs)',
}

/**
 * All 48 anatomical muscle heads
 */
export const MUSCLE_ATLAS: Record<string, MuscleDefinition> = {
  // ==================== CHEST (A) ====================
  pec_clavicular: {
    id: 'pec_clavicular',
    nameAr: 'صدر علوي',
    nameEn: 'Pectoralis major, clavicular head',
    view: 'A',
    layer: 'S',
    region: 'chest',
    // Left & Right Upper Chest originating at medial clavicle down-laterally to humerus
    pathA:
      'M 80 64 C 90 64 97 66 98 78 C 92 78 85 79 74 77 C 72 73 75 66 80 64 Z ' +
      'M 120 64 C 110 64 103 66 102 78 C 108 78 115 79 126 77 C 128 73 125 66 120 64 Z',
    bboxA: { minX: 72, minY: 64, maxX: 128, maxY: 79 },
  },
  pec_sternal: {
    id: 'pec_sternal',
    nameAr: 'صدر أوسط',
    nameEn: 'Pectoralis major, sternal head',
    view: 'A',
    layer: 'S',
    region: 'chest',
    // Mid chest along sternum out to axilla
    pathA:
      'M 98 79 C 98 94 92 98 75 97 C 70 91 71 83 74 78 C 85 80 92 79 98 79 Z ' +
      'M 102 79 C 102 94 108 98 125 97 C 130 91 129 83 126 78 C 115 80 108 79 102 79 Z',
    bboxA: { minX: 70, minY: 78, maxX: 130, maxY: 98 },
  },
  pec_costal: {
    id: 'pec_costal',
    nameAr: 'صدر سفلي',
    nameEn: 'Pectoralis major, costal head',
    view: 'A',
    layer: 'S',
    region: 'chest',
    // Lower chest fibers sweeping upward toward humerus
    pathA:
      'M 98 99 C 94 109 88 111 76 105 C 74 101 74 97 75 96 C 88 98 94 98 98 99 Z ' +
      'M 102 99 C 106 109 112 111 124 105 C 126 101 126 97 125 96 C 112 98 106 98 102 99 Z',
    bboxA: { minX: 74, minY: 96, maxX: 126, maxY: 111 },
  },
  pec_minor: {
    id: 'pec_minor',
    nameAr: 'الصدرية الصغرى',
    nameEn: 'Pectoralis minor',
    view: 'A',
    layer: 'D',
    region: 'chest',
    // Deep chest triangular slips from ribs 3-5 to coracoid process
    pathA:
      'M 72 73 L 79 88 L 75 91 L 70 78 Z ' +
      'M 128 73 L 121 88 L 125 91 L 130 78 Z',
    bboxA: { minX: 70, minY: 73, maxX: 130, maxY: 91 },
  },
  serratus_anterior: {
    id: 'serratus_anterior',
    nameAr: 'سيراتس',
    nameEn: 'Serratus anterior',
    view: 'A',
    layer: 'S',
    region: 'chest',
    // Sawtooth serrations along lateral ribcage
    pathA:
      'M 68 102 L 74 100 L 73 105 L 67 107 Z ' +
      'M 67 109 L 73 107 L 72 112 L 66 114 Z ' +
      'M 66 116 L 72 114 L 71 119 L 65 121 Z ' +
      'M 132 102 L 126 100 L 127 105 L 133 107 Z ' +
      'M 133 109 L 127 107 L 128 112 L 134 114 Z ' +
      'M 134 116 L 128 114 L 129 119 L 135 121 Z',
    bboxA: { minX: 65, minY: 100, maxX: 135, maxY: 121 },
  },

  // ==================== SHOULDERS (A + P) ====================
  delt_anterior: {
    id: 'delt_anterior',
    nameAr: 'كتف أمامي',
    nameEn: 'Anterior deltoid',
    view: 'A',
    layer: 'S',
    region: 'shoulders',
    pathA:
      'M 68 64 C 74 65 74 74 72 84 C 68 84 64 80 63 74 C 63 67 65 64 68 64 Z ' +
      'M 132 64 C 126 65 126 74 128 84 C 132 84 136 80 137 74 C 137 67 135 64 132 64 Z',
    bboxA: { minX: 63, minY: 64, maxX: 137, maxY: 84 },
  },
  delt_lateral: {
    id: 'delt_lateral',
    nameAr: 'كتف جانبي',
    nameEn: 'Lateral deltoid',
    view: 'A+P',
    layer: 'S',
    region: 'shoulders',
    pathA:
      'M 63 67 C 65 74 67 82 70 88 C 65 89 57 85 57 76 C 57 70 60 67 63 67 Z ' +
      'M 137 67 C 135 74 133 82 130 88 C 135 89 143 85 143 76 C 143 70 140 67 137 67 Z',
    pathP:
      'M 58 68 C 60 76 64 84 67 88 C 62 89 55 84 55 77 C 55 71 56 68 58 68 Z ' +
      'M 142 68 C 140 76 136 84 133 88 C 138 89 145 84 145 77 C 145 71 144 68 142 68 Z',
    bboxA: { minX: 57, minY: 67, maxX: 143, maxY: 89 },
    bboxP: { minX: 55, minY: 68, maxX: 145, maxY: 89 },
  },
  delt_posterior: {
    id: 'delt_posterior',
    nameAr: 'كتف خلفي',
    nameEn: 'Posterior deltoid',
    view: 'P',
    layer: 'S',
    region: 'shoulders',
    pathP:
      'M 67 67 C 72 68 73 78 70 87 C 65 86 61 80 60 74 C 60 69 63 67 67 67 Z ' +
      'M 133 67 C 128 68 127 78 130 87 C 135 86 139 80 140 74 C 140 69 137 67 133 67 Z',
    bboxP: { minX: 60, minY: 67, maxX: 140, maxY: 87 },
  },

  // ==================== ARMS (A + P) ====================
  biceps_long: {
    id: 'biceps_long',
    nameAr: 'باي – الرأس الطويل',
    nameEn: 'Biceps brachii, long head',
    view: 'A',
    layer: 'S',
    region: 'arms',
    // Outer/lateral belly of biceps
    pathA:
      'M 60 90 C 63 94 62 110 59 126 C 56 125 54 116 55 102 C 55 94 58 91 60 90 Z ' +
      'M 140 90 C 137 94 138 110 141 126 C 144 125 146 116 145 102 C 145 94 142 91 140 90 Z',
    bboxA: { minX: 54, minY: 90, maxX: 146, maxY: 126 },
  },
  biceps_short: {
    id: 'biceps_short',
    nameAr: 'باي – الرأس القصير',
    nameEn: 'Biceps brachii, short head',
    view: 'A',
    layer: 'S',
    region: 'arms',
    // Inner/medial belly of biceps
    pathA:
      'M 64 91 C 67 95 67 112 63 127 C 60 126 59 116 60 102 C 61 95 63 92 64 91 Z ' +
      'M 136 91 C 133 95 133 112 137 127 C 140 126 141 116 140 102 C 139 95 137 92 136 91 Z',
    bboxA: { minX: 59, minY: 91, maxX: 141, maxY: 127 },
  },
  brachialis: {
    id: 'brachialis',
    nameAr: 'براكيالس',
    nameEn: 'Brachialis',
    view: 'A',
    layer: 'S',
    region: 'arms',
    // Sits deep/flanking under lower biceps
    pathA:
      'M 54 112 C 56 112 56 124 55 133 C 51 130 50 121 52 114 Z ' +
      'M 146 112 C 144 112 144 124 145 133 C 149 130 150 121 148 114 Z',
    bboxA: { minX: 50, minY: 112, maxX: 150, maxY: 133 },
  },
  brachioradialis: {
    id: 'brachioradialis',
    nameAr: 'براكيورادياليس',
    nameEn: 'Brachioradialis',
    view: 'A+P',
    layer: 'S',
    region: 'arms',
    pathA:
      'M 54 133 C 56 138 56 156 50 174 C 47 172 45 158 49 140 C 50 134 52 133 54 133 Z ' +
      'M 146 133 C 144 138 144 156 150 174 C 153 172 155 158 151 140 C 150 134 148 133 146 133 Z',
    pathP:
      'M 51 135 C 53 140 54 158 48 174 C 45 171 44 158 47 142 C 48 136 50 135 51 135 Z ' +
      'M 149 135 C 147 140 146 158 152 174 C 155 171 156 158 153 142 C 152 136 150 135 149 135 Z',
    bboxA: { minX: 45, minY: 133, maxX: 155, maxY: 174 },
    bboxP: { minX: 44, minY: 135, maxX: 156, maxY: 174 },
  },
  forearm_flexors: {
    id: 'forearm_flexors',
    nameAr: 'ساعد داخلي',
    nameEn: 'Forearm flexors',
    view: 'A',
    layer: 'S',
    region: 'arms',
    pathA:
      'M 57 135 C 60 142 61 162 57 184 C 53 182 51 166 52 148 C 53 138 55 135 57 135 Z ' +
      'M 143 135 C 140 142 139 162 143 184 C 147 182 149 166 148 148 C 147 138 145 135 143 135 Z',
    bboxA: { minX: 51, minY: 135, maxX: 149, maxY: 184 },
  },
  forearm_extensors: {
    id: 'forearm_extensors',
    nameAr: 'ساعد خارجي',
    nameEn: 'Forearm extensors',
    view: 'P',
    layer: 'S',
    region: 'arms',
    pathP:
      'M 54 136 C 58 144 58 165 54 186 C 50 184 48 166 49 148 C 50 139 52 136 54 136 Z ' +
      'M 146 136 C 142 144 142 165 146 186 C 150 184 152 166 151 148 C 150 139 148 136 146 136 Z',
    bboxP: { minX: 48, minY: 136, maxX: 152, maxY: 186 },
  },
  triceps_long: {
    id: 'triceps_long',
    nameAr: 'تراي – الرأس الطويل',
    nameEn: 'Triceps, long head',
    view: 'P',
    layer: 'S',
    region: 'arms',
    // Medial mass of triceps on rear view
    pathP:
      'M 68 89 C 71 96 70 114 66 128 C 63 127 61 116 62 102 C 63 94 65 90 68 89 Z ' +
      'M 132 89 C 129 96 130 114 134 128 C 137 127 139 116 138 102 C 137 94 135 90 132 89 Z',
    bboxP: { minX: 61, minY: 89, maxX: 139, maxY: 128 },
  },
  triceps_lateral: {
    id: 'triceps_lateral',
    nameAr: 'تراي – الرأس الجانبي',
    nameEn: 'Triceps, lateral head',
    view: 'P',
    layer: 'S',
    region: 'arms',
    // Outer horseshoe contour
    pathP:
      'M 61 88 C 64 94 63 108 59 122 C 55 120 54 110 55 98 C 56 91 58 89 61 88 Z ' +
      'M 139 88 C 136 94 137 108 141 122 C 145 120 146 110 145 98 C 144 91 142 89 139 88 Z',
    bboxP: { minX: 54, minY: 88, maxX: 146, maxY: 122 },
  },
  triceps_medial: {
    id: 'triceps_medial',
    nameAr: 'تراي – الرأس الأوسط',
    nameEn: 'Triceps, medial head',
    view: 'P',
    layer: 'D',
    region: 'arms',
    // Deep belly visible near elbow tendon
    pathP:
      'M 63 121 C 66 124 65 132 63 137 C 60 135 59 128 60 123 Z ' +
      'M 137 121 C 134 124 135 132 137 137 C 140 135 141 128 140 123 Z',
    bboxP: { minX: 59, minY: 121, maxX: 141, maxY: 137 },
  },

  // ==================== CORE (A) ====================
  rectus_abdominis_upper: {
    id: 'rectus_abdominis_upper',
    nameAr: 'بطن علوي',
    nameEn: 'Rectus abdominis, upper',
    view: 'A',
    layer: 'S',
    region: 'core',
    pathA:
      'M 87 114 L 98 114 L 98 128 L 86 128 Z ' +
      'M 86 130 L 98 130 L 98 145 L 85 145 Z ' +
      'M 102 114 L 113 114 L 114 128 L 102 128 Z ' +
      'M 102 130 L 114 130 L 115 145 L 102 145 Z',
    bboxA: { minX: 85, minY: 114, maxX: 115, maxY: 145 },
  },
  rectus_abdominis_lower: {
    id: 'rectus_abdominis_lower',
    nameAr: 'بطن سفلي',
    nameEn: 'Rectus abdominis, lower',
    view: 'A',
    layer: 'S',
    region: 'core',
    pathA:
      'M 85 147 L 98 147 L 98 162 L 87 162 Z ' +
      'M 88 164 L 98 164 L 98 180 L 91 180 Z ' +
      'M 102 147 L 115 147 L 113 162 L 102 162 Z ' +
      'M 102 164 L 112 164 L 109 180 L 102 180 Z',
    bboxA: { minX: 85, minY: 147, maxX: 115, maxY: 180 },
  },
  obliques_external: {
    id: 'obliques_external',
    nameAr: 'أوبليك',
    nameEn: 'External obliques',
    view: 'A',
    layer: 'S',
    region: 'core',
    pathA:
      'M 74 124 C 80 125 82 142 82 168 C 76 166 70 154 70 138 C 70 128 72 124 74 124 Z ' +
      'M 126 124 C 120 125 118 142 118 168 C 124 166 130 154 130 138 C 130 128 128 124 126 124 Z',
    bboxA: { minX: 70, minY: 124, maxX: 130, maxY: 168 },
  },
  transversus_abdominis: {
    id: 'transversus_abdominis',
    nameAr: 'بطن عميقة',
    nameEn: 'Transversus abdominis',
    view: 'A',
    layer: 'D',
    region: 'core',
    pathA:
      'M 76 138 L 84 138 L 84 172 L 76 170 Z ' +
      'M 124 138 L 116 138 L 116 172 L 124 170 Z',
    bboxA: { minX: 76, minY: 138, maxX: 124, maxY: 172 },
  },
  iliopsoas: {
    id: 'iliopsoas',
    nameAr: 'إليوبسواس',
    nameEn: 'Iliopsoas',
    view: 'A',
    layer: 'D',
    region: 'core',
    pathA:
      'M 88 172 L 95 174 L 92 198 L 86 195 Z ' +
      'M 112 172 L 105 174 L 108 198 L 114 195 Z',
    bboxA: { minX: 86, minY: 172, maxX: 114, maxY: 198 },
  },
  neck_scm: {
    id: 'neck_scm',
    nameAr: 'رقبة جانبية',
    nameEn: 'Sternocleidomastoid',
    view: 'A',
    layer: 'S',
    region: 'shoulders',
    pathA:
      'M 91 46 L 95 46 L 93 62 L 89 61 Z ' +
      'M 109 46 L 105 46 L 107 62 L 111 61 Z',
    bboxA: { minX: 89, minY: 46, maxX: 111, maxY: 62 },
  },

  // ==================== BACK (P + A) ====================
  trap_upper: {
    id: 'trap_upper',
    nameAr: 'ترابس علوي',
    nameEn: 'Upper trapezius',
    view: 'A+P',
    layer: 'S',
    region: 'back',
    pathA:
      'M 86 52 C 90 52 92 60 90 64 C 82 64 78 63 76 60 C 76 56 80 52 86 52 Z ' +
      'M 114 52 C 110 52 108 60 110 64 C 118 64 122 63 124 60 C 124 56 120 52 114 52 Z',
    pathP:
      'M 94 48 C 98 48 100 56 100 70 C 88 68 78 68 76 64 C 77 56 84 49 94 48 Z ' +
      'M 106 48 C 102 48 100 56 100 70 C 112 68 122 68 124 64 C 123 56 116 49 106 48 Z',
    bboxA: { minX: 76, minY: 52, maxX: 124, maxY: 64 },
    bboxP: { minX: 76, minY: 48, maxX: 124, maxY: 70 },
  },
  trap_middle: {
    id: 'trap_middle',
    nameAr: 'ترابس أوسط',
    nameEn: 'Middle trapezius',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP: 'M 100 71 L 118 78 L 109 98 L 100 106 L 91 98 L 82 78 Z',
    bboxP: { minX: 82, minY: 71, maxX: 118, maxY: 106 },
  },
  trap_lower: {
    id: 'trap_lower',
    nameAr: 'ترابس سفلي',
    nameEn: 'Lower trapezius',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP: 'M 100 107 L 108 99 L 100 138 L 92 99 Z',
    bboxP: { minX: 92, minY: 99, maxX: 108, maxY: 138 },
  },
  rhomboids: {
    id: 'rhomboids',
    nameAr: 'رومبويد',
    nameEn: 'Rhomboids',
    view: 'P',
    layer: 'D',
    region: 'back',
    pathP:
      'M 91 82 L 81 87 L 83 99 L 93 94 Z ' +
      'M 109 82 L 119 87 L 117 99 L 107 94 Z',
    bboxP: { minX: 81, minY: 82, maxX: 119, maxY: 99 },
  },
  levator_scapulae: {
    id: 'levator_scapulae',
    nameAr: 'رافعة الكتف',
    nameEn: 'Levator scapulae',
    view: 'P',
    layer: 'D',
    region: 'back',
    pathP:
      'M 92 54 L 88 54 L 85 68 L 89 68 Z ' +
      'M 108 54 L 112 54 L 115 68 L 111 68 Z',
    bboxP: { minX: 85, minY: 54, maxX: 115, maxY: 68 },
  },
  lats: {
    id: 'lats',
    nameAr: 'لاتس',
    nameEn: 'Latissimus dorsi',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP:
      'M 80 106 C 85 106 88 126 95 158 C 88 156 75 142 70 122 C 70 114 74 107 80 106 Z ' +
      'M 120 106 C 115 106 112 126 105 158 C 112 156 125 142 130 122 C 130 114 126 107 120 106 Z',
    bboxP: { minX: 70, minY: 106, maxX: 130, maxY: 158 },
  },
  teres_major: {
    id: 'teres_major',
    nameAr: 'تيرس ميجر',
    nameEn: 'Teres major',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP:
      'M 72 104 C 77 105 77 113 71 115 C 67 114 66 107 72 104 Z ' +
      'M 128 104 C 123 105 123 113 129 115 C 133 114 134 107 128 104 Z',
    bboxP: { minX: 66, minY: 104, maxX: 134, maxY: 115 },
  },
  teres_minor: {
    id: 'teres_minor',
    nameAr: 'تيرس مينور',
    nameEn: 'Teres minor',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP:
      'M 72 96 C 76 97 76 102 71 104 C 67 103 67 98 72 96 Z ' +
      'M 128 96 C 124 97 124 102 129 104 C 133 103 133 98 128 96 Z',
    bboxP: { minX: 67, minY: 96, maxX: 133, maxY: 104 },
  },
  infraspinatus: {
    id: 'infraspinatus',
    nameAr: 'إنفراسبيناتس',
    nameEn: 'Infraspinatus',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP:
      'M 77 82 C 82 84 81 96 74 96 C 70 94 70 86 77 82 Z ' +
      'M 123 82 C 118 84 119 96 126 96 C 130 94 130 86 123 82 Z',
    bboxP: { minX: 70, minY: 82, maxX: 130, maxY: 96 },
  },
  supraspinatus: {
    id: 'supraspinatus',
    nameAr: 'سوبراسبيناتس',
    nameEn: 'Supraspinatus',
    view: 'P',
    layer: 'D',
    region: 'back',
    pathP:
      'M 78 72 C 84 73 83 79 77 80 C 72 79 73 74 78 72 Z ' +
      'M 122 72 C 116 73 117 79 123 80 C 128 79 127 74 122 72 Z',
    bboxP: { minX: 72, minY: 72, maxX: 128, maxY: 80 },
  },
  erector_spinae: {
    id: 'erector_spinae',
    nameAr: 'إريكتور (أسفل الظهر)',
    nameEn: 'Erector spinae',
    view: 'P',
    layer: 'S',
    region: 'back',
    pathP:
      'M 92 126 C 96 126 96 172 93 178 C 89 176 89 130 92 126 Z ' +
      'M 108 126 C 104 126 104 172 107 178 C 111 176 111 130 108 126 Z',
    bboxP: { minX: 89, minY: 126, maxX: 111, maxY: 178 },
  },
  quadratus_lumborum: {
    id: 'quadratus_lumborum',
    nameAr: 'جانب أسفل الظهر',
    nameEn: 'Quadratus lumborum',
    view: 'P',
    layer: 'D',
    region: 'back',
    pathP:
      'M 84 148 L 91 148 L 91 172 L 84 170 Z ' +
      'M 116 148 L 109 148 L 109 172 L 116 170 Z',
    bboxP: { minX: 84, minY: 148, maxX: 116, maxY: 172 },
  },

  // ==================== GLUTES (P) ====================
  glute_max: {
    id: 'glute_max',
    nameAr: 'جلوتس كبير',
    nameEn: 'Gluteus maximus',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 76 186 C 88 184 98 188 98 214 C 94 228 80 230 72 216 C 68 202 70 190 76 186 Z ' +
      'M 124 186 C 112 184 102 188 102 214 C 106 228 120 230 128 216 C 132 202 130 190 124 186 Z',
    bboxP: { minX: 68, minY: 184, maxX: 132, maxY: 230 },
  },
  glute_med: {
    id: 'glute_med',
    nameAr: 'جلوتس وسطي',
    nameEn: 'Gluteus medius',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 72 174 C 82 174 84 185 76 188 C 68 188 66 180 72 174 Z ' +
      'M 128 174 C 118 174 116 185 124 188 C 132 188 134 180 128 174 Z',
    bboxP: { minX: 66, minY: 174, maxX: 134, maxY: 188 },
  },
  glute_min: {
    id: 'glute_min',
    nameAr: 'جلوتس صغير',
    nameEn: 'Gluteus minimus',
    view: 'P',
    layer: 'D',
    region: 'legs',
    pathP:
      'M 74 178 L 81 180 L 76 187 L 70 184 Z ' +
      'M 126 178 L 119 180 L 124 187 L 130 184 Z',
    bboxP: { minX: 70, minY: 178, maxX: 130, maxY: 187 },
  },

  // ==================== LEGS (A + P) ====================
  tfl: {
    id: 'tfl',
    nameAr: 'جانب الورك الأمامي',
    nameEn: 'Tensor fasciae latae',
    view: 'A',
    layer: 'S',
    region: 'legs',
    pathA:
      'M 70 178 C 74 178 76 195 72 208 C 68 206 66 194 67 184 C 68 180 69 178 70 178 Z ' +
      'M 130 178 C 126 178 124 195 128 208 C 132 206 134 194 133 184 C 132 180 131 178 130 178 Z',
    bboxA: { minX: 66, minY: 178, maxX: 134, maxY: 208 },
  },
  sartorius: {
    id: 'sartorius',
    nameAr: 'الخياطية',
    nameEn: 'Sartorius',
    view: 'A',
    layer: 'S',
    region: 'legs',
    // Long diagonal strap across anterior thigh
    pathA:
      'M 74 184 L 78 183 L 88 262 L 85 264 Z ' +
      'M 126 184 L 122 183 L 112 262 L 115 264 Z',
    bboxA: { minX: 74, minY: 183, maxX: 126, maxY: 264 },
  },
  rectus_femoris: {
    id: 'rectus_femoris',
    nameAr: 'فخذ أمامي – منتصف',
    nameEn: 'Rectus femoris',
    view: 'A',
    layer: 'S',
    region: 'legs',
    pathA:
      'M 83 194 C 88 194 91 224 88 256 C 84 256 81 230 80 205 C 80 198 81 194 83 194 Z ' +
      'M 117 194 C 112 194 109 224 112 256 C 116 256 119 230 120 205 C 120 198 119 194 117 194 Z',
    bboxA: { minX: 80, minY: 194, maxX: 120, maxY: 256 },
  },
  vastus_lateralis: {
    id: 'vastus_lateralis',
    nameAr: 'فخذ أمامي – خارجي',
    nameEn: 'Vastus lateralis',
    view: 'A',
    layer: 'S',
    region: 'legs',
    pathA:
      'M 73 196 C 79 196 81 228 78 260 C 72 256 66 238 67 212 C 67 202 70 196 73 196 Z ' +
      'M 127 196 C 121 196 119 228 122 260 C 128 256 134 238 133 212 C 133 202 130 196 127 196 Z',
    bboxA: { minX: 66, minY: 196, maxX: 134, maxY: 260 },
  },
  vastus_medialis: {
    id: 'vastus_medialis',
    nameAr: 'فخذ أمامي – داخلي',
    nameEn: 'Vastus medialis',
    view: 'A',
    layer: 'S',
    region: 'legs',
    // Teardrop above medial knee
    pathA:
      'M 87 242 C 93 242 94 258 90 268 C 86 267 85 252 87 242 Z ' +
      'M 113 242 C 107 242 106 258 110 268 C 114 267 115 252 113 242 Z',
    bboxA: { minX: 85, minY: 242, maxX: 115, maxY: 268 },
  },
  vastus_intermedius: {
    id: 'vastus_intermedius',
    nameAr: 'فخذ أمامي – عميق',
    nameEn: 'Vastus intermedius',
    view: 'A',
    layer: 'D',
    region: 'legs',
    pathA:
      'M 82 205 L 89 205 L 87 252 L 81 250 Z ' +
      'M 118 205 L 111 205 L 113 252 L 119 250 Z',
    bboxA: { minX: 81, minY: 205, maxX: 119, maxY: 252 },
  },
  adductors: {
    id: 'adductors',
    nameAr: 'فخذ داخلي',
    nameEn: 'Adductors',
    view: 'A+P',
    layer: 'S',
    region: 'legs',
    pathA:
      'M 91 188 C 96 188 98 208 94 238 C 90 234 89 214 89 198 C 89 191 90 188 91 188 Z ' +
      'M 109 188 C 104 188 102 208 106 238 C 110 234 111 214 111 198 C 111 191 110 188 109 188 Z',
    pathP:
      'M 94 216 C 98 218 98 238 94 252 C 91 248 91 230 94 216 Z ' +
      'M 106 216 C 102 218 102 238 106 252 C 109 248 109 230 106 216 Z',
    bboxA: { minX: 89, minY: 188, maxX: 111, maxY: 238 },
    bboxP: { minX: 91, minY: 216, maxX: 109, maxY: 252 },
  },
  tibialis_anterior: {
    id: 'tibialis_anterior',
    nameAr: 'مقدمة الساق',
    nameEn: 'Tibialis anterior',
    view: 'A',
    layer: 'S',
    region: 'legs',
    pathA:
      'M 76 290 C 80 290 82 328 78 370 C 75 368 74 330 74 300 C 74 293 75 290 76 290 Z ' +
      'M 124 290 C 120 290 118 328 122 370 C 125 368 126 330 126 300 C 126 293 125 290 124 290 Z',
    bboxA: { minX: 74, minY: 290, maxX: 126, maxY: 370 },
  },

  // ==================== HAMSTRINGS & CALVES (P) ====================
  hamstring_bf_long: {
    id: 'hamstring_bf_long',
    nameAr: 'فخذ خلفي – خارجي (طويل)',
    nameEn: 'Biceps femoris, long head',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 75 228 C 79 230 78 258 72 284 C 68 280 67 254 70 234 C 71 230 73 228 75 228 Z ' +
      'M 125 228 C 121 230 122 258 128 284 C 132 280 133 254 130 234 C 129 230 127 228 125 228 Z',
    bboxP: { minX: 67, minY: 228, maxX: 133, maxY: 284 },
  },
  hamstring_bf_short: {
    id: 'hamstring_bf_short',
    nameAr: 'فخذ خلفي – خارجي (قصير)',
    nameEn: 'Biceps femoris, short head',
    view: 'P',
    layer: 'D',
    region: 'legs',
    pathP:
      'M 70 262 L 75 264 L 72 285 L 68 282 Z ' +
      'M 130 262 L 125 264 L 128 285 L 132 282 Z',
    bboxP: { minX: 68, minY: 262, maxX: 132, maxY: 285 },
  },
  hamstring_semitendinosus: {
    id: 'hamstring_semitendinosus',
    nameAr: 'فخذ خلفي – داخلي (سطحي)',
    nameEn: 'Semitendinosus',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 82 228 C 86 228 86 260 82 286 C 79 285 78 258 80 234 C 80 230 81 228 82 228 Z ' +
      'M 118 228 C 114 228 114 260 118 286 C 121 285 122 258 120 234 C 120 230 119 228 118 228 Z',
    bboxP: { minX: 78, minY: 228, maxX: 122, maxY: 286 },
  },
  hamstring_semimembranosus: {
    id: 'hamstring_semimembranosus',
    nameAr: 'فخذ خلفي – داخلي (عميق)',
    nameEn: 'Semimembranosus',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 87 236 C 91 238 90 268 86 288 C 83 286 83 260 85 240 Z ' +
      'M 113 236 C 109 238 110 268 114 288 C 117 286 117 260 115 240 Z',
    bboxP: { minX: 83, minY: 236, maxX: 117, maxY: 288 },
  },
  gastrocnemius_medial: {
    id: 'gastrocnemius_medial',
    nameAr: 'سمانة – داخلي',
    nameEn: 'Gastrocnemius, medial head',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 89 292 C 95 292 97 318 92 342 C 87 340 85 316 86 296 C 87 293 88 292 89 292 Z ' +
      'M 111 292 C 105 292 103 318 108 342 C 113 340 115 316 114 296 C 113 293 112 292 111 292 Z',
    bboxP: { minX: 85, minY: 292, maxX: 115, maxY: 342 },
  },
  gastrocnemius_lateral: {
    id: 'gastrocnemius_lateral',
    nameAr: 'سمانة – خارجي',
    nameEn: 'Gastrocnemius, lateral head',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 78 294 C 84 294 85 318 80 338 C 73 336 71 316 74 298 C 75 295 76 294 78 294 Z ' +
      'M 122 294 C 116 294 115 318 120 338 C 127 336 129 316 126 298 C 125 295 124 294 122 294 Z',
    bboxP: { minX: 71, minY: 294, maxX: 129, maxY: 338 },
  },
  soleus: {
    id: 'soleus',
    nameAr: 'سمانة عميقة (سولس)',
    nameEn: 'Soleus',
    view: 'P',
    layer: 'S',
    region: 'legs',
    pathP:
      'M 78 334 C 84 336 86 358 83 376 C 76 374 74 352 75 338 Z ' +
      'M 91 338 C 94 340 94 362 90 376 C 88 374 87 352 89 338 Z ' +
      'M 122 334 C 116 336 114 358 117 376 C 124 374 126 352 125 338 Z ' +
      'M 109 338 C 106 340 106 362 110 376 C 112 374 113 352 111 338 Z',
    bboxP: { minX: 74, minY: 334, maxX: 126, maxY: 376 },
  },
}

/**
 * Head silhouette outlines for both views (neutral anatomical human shape)
 */
export const BODY_CONTOURS = {
  anterior:
    'M 100 12 C 108 12 113 18 113 28 C 113 38 108 44 100 44 C 92 44 87 38 87 28 C 87 18 92 12 100 12 Z ' + // Head
    'M 89 44 L 91 62 L 76 64 L 62 67 L 54 88 L 46 138 L 40 188 L 38 214 L 43 216 L 50 188 L 56 142 L 64 92 L 67 96 L 68 174 L 64 212 L 70 270 L 72 380 L 68 418 L 84 424 L 90 380 L 89 270 L 98 226 L 100 226 L 102 226 L 111 270 L 110 380 L 116 424 L 132 418 L 128 380 L 130 270 L 136 212 L 132 174 L 133 96 L 136 92 L 144 142 L 150 188 L 157 216 L 162 214 L 160 188 L 154 138 L 146 88 L 138 67 L 124 64 L 109 62 L 111 44 Z',
  posterior:
    'M 100 12 C 108 12 113 18 113 28 C 113 38 108 44 100 44 C 92 44 87 38 87 28 C 87 18 92 12 100 12 Z ' + // Head
    'M 89 44 L 91 62 L 76 64 L 60 68 L 52 88 L 44 138 L 38 188 L 36 214 L 41 216 L 48 188 L 54 142 L 62 92 L 66 96 L 66 174 L 64 216 L 68 280 L 70 380 L 66 418 L 82 424 L 88 380 L 88 280 L 98 230 L 100 230 L 102 230 L 112 280 L 112 380 L 118 424 L 134 418 L 130 380 L 132 280 L 136 216 L 134 174 L 134 96 L 138 92 L 146 142 L 152 188 L 159 216 L 164 214 L 162 188 L 156 138 L 148 88 L 140 68 L 124 64 L 109 62 L 111 44 Z',
}
