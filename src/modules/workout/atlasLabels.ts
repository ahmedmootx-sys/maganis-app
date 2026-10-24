/**
 * src/modules/workout/atlasLabels.ts
 * Precomputed leader-line label positions for the anatomical muscle atlas.
 * Coordinate space: 1024 x 2048 SVG viewBox.
 *
 * Rules (C1.1):
 * - Uses only gym slang names (gym_ar)
 * - Zero overlap between any two label bounding boxes (verified by gate-atlas)
 * - No label box clips or extends outside the 1024x2048 viewport
 */

export interface AtlasLabel {
  id: string
  gym_ar: string
  // Anchor on the muscle
  anchor: [number, number]
  // Leader line destination point
  lineEnd: [number, number]
  // Label bounding box: [x, y, width, height]
  box: [number, number, number, number]
  // Text alignment
  align: 'start' | 'end' | 'middle'
}

export const ANTERIOR_LABELS: AtlasLabel[] = [
  {
    id: 'neck_scm',
    gym_ar: 'رقبة',
    anchor: [547, 390],
    lineEnd: [360, 310],
    box: [240, 290, 110, 40],
    align: 'end'
  },
  {
    id: 'delt_anterior',
    gym_ar: 'كتف أمامي',
    anchor: [692, 434],
    lineEnd: [840, 410],
    box: [850, 390, 140, 40],
    align: 'start'
  },
  {
    id: 'pec_clavicular',
    gym_ar: 'صدر علوي',
    anchor: [611, 431],
    lineEnd: [360, 430],
    box: [220, 410, 130, 40],
    align: 'end'
  },
  {
    id: 'pec_sternal',
    gym_ar: 'صدر أوسط',
    anchor: [584, 502],
    lineEnd: [360, 500],
    box: [220, 480, 130, 40],
    align: 'end'
  },
  {
    id: 'pec_costal',
    gym_ar: 'صدر سفلي',
    anchor: [574, 585],
    lineEnd: [360, 570],
    box: [220, 550, 130, 40],
    align: 'end'
  },
  {
    id: 'delt_lateral',
    gym_ar: 'كتف جانبي',
    anchor: [749, 477],
    lineEnd: [850, 480],
    box: [860, 460, 140, 40],
    align: 'start'
  },
  {
    id: 'biceps_long',
    gym_ar: 'باي',
    anchor: [745, 618],
    lineEnd: [850, 610],
    box: [860, 590, 120, 40],
    align: 'start'
  },
  {
    id: 'serratus_anterior',
    gym_ar: 'سيراتس',
    anchor: [660, 561],
    lineEnd: [790, 680],
    box: [800, 660, 120, 40],
    align: 'start'
  },
  {
    id: 'brachioradialis',
    gym_ar: 'براكيو',
    anchor: [789, 790],
    lineEnd: [860, 770],
    box: [870, 750, 120, 40],
    align: 'start'
  },
  {
    id: 'forearm_flexors',
    gym_ar: 'ساعد داخلي',
    anchor: [760, 861],
    lineEnd: [850, 850],
    box: [860, 830, 140, 40],
    align: 'start'
  },
  {
    id: 'obliques_external',
    gym_ar: 'أوبليك',
    anchor: [593, 881],
    lineEnd: [360, 840],
    box: [230, 820, 120, 40],
    align: 'end'
  },
  {
    id: 'tfl',
    gym_ar: 'جانب الورك',
    anchor: [673, 980],
    lineEnd: [810, 960],
    box: [820, 940, 140, 40],
    align: 'start'
  },
  {
    id: 'adductors',
    gym_ar: 'فخذ داخلي',
    anchor: [568, 1049],
    lineEnd: [360, 1040],
    box: [210, 1020, 140, 40],
    align: 'end'
  },
  {
    id: 'rectus_femoris',
    gym_ar: 'فخذ أمامي وسط',
    anchor: [646, 1158],
    lineEnd: [810, 1150],
    box: [820, 1130, 160, 40],
    align: 'start'
  },
  {
    id: 'vastus_lateralis',
    gym_ar: 'فخذ أمامي خارجي',
    anchor: [658, 1336],
    lineEnd: [810, 1310],
    box: [820, 1290, 170, 40],
    align: 'start'
  },
  {
    id: 'vastus_medialis',
    gym_ar: 'الدمعة',
    anchor: [578, 1392],
    lineEnd: [360, 1390],
    box: [230, 1370, 120, 40],
    align: 'end'
  },
  {
    id: 'tibialis_anterior',
    gym_ar: 'مقدمة الساق',
    anchor: [625, 1624],
    lineEnd: [810, 1620],
    box: [820, 1600, 140, 40],
    align: 'start'
  }
]

export const POSTERIOR_LABELS: AtlasLabel[] = [
  {
    id: 'trap_upper',
    gym_ar: 'ترابس علوي',
    anchor: [512, 316],
    lineEnd: [330, 270],
    box: [180, 250, 140, 40],
    align: 'end'
  },
  {
    id: 'trap_middle',
    gym_ar: 'ترابس أوسط',
    anchor: [539, 388],
    lineEnd: [330, 360],
    box: [180, 340, 140, 40],
    align: 'end'
  },
  {
    id: 'delt_posterior',
    gym_ar: 'كتف خلفي',
    anchor: [698, 458],
    lineEnd: [840, 440],
    box: [850, 420, 140, 40],
    align: 'start'
  },
  {
    id: 'infraspinatus',
    gym_ar: 'إنفراسبيناتس',
    anchor: [639, 483],
    lineEnd: [840, 510],
    box: [850, 490, 150, 40],
    align: 'start'
  },
  {
    id: 'trap_lower',
    gym_ar: 'ترابس سفلي',
    anchor: [512, 534],
    lineEnd: [330, 520],
    box: [180, 500, 140, 40],
    align: 'end'
  },
  {
    id: 'rhomboids',
    gym_ar: 'رومبويد',
    anchor: [597, 562],
    lineEnd: [330, 600],
    box: [190, 580, 130, 40],
    align: 'end'
  },
  {
    id: 'triceps_long',
    gym_ar: 'تراي طويل',
    anchor: [710, 604],
    lineEnd: [840, 600],
    box: [850, 580, 130, 40],
    align: 'start'
  },
  {
    id: 'triceps_lateral',
    gym_ar: 'تراي جانبي',
    anchor: [748, 631],
    lineEnd: [850, 670],
    box: [860, 650, 130, 40],
    align: 'start'
  },
  {
    id: 'erector_spinae',
    gym_ar: 'إريكتور',
    anchor: [550, 841],
    lineEnd: [330, 810],
    box: [190, 790, 130, 40],
    align: 'end'
  },
  {
    id: 'forearm_extensors',
    gym_ar: 'ساعد خارجي',
    anchor: [783, 889],
    lineEnd: [860, 870],
    box: [870, 850, 140, 40],
    align: 'start'
  },
  {
    id: 'glute_med',
    gym_ar: 'جلوتس وسطي',
    anchor: [634, 873],
    lineEnd: [820, 940],
    box: [830, 920, 150, 40],
    align: 'start'
  },
  {
    id: 'glute_max',
    gym_ar: 'جلوتس كبير',
    anchor: [585, 1014],
    lineEnd: [330, 1010],
    box: [180, 990, 140, 40],
    align: 'end'
  },
  {
    id: 'hamstring_semitendinosus',
    gym_ar: 'هامسترنج داخلي',
    anchor: [563, 1267],
    lineEnd: [330, 1260],
    box: [160, 1240, 160, 40],
    align: 'end'
  },
  {
    id: 'hamstring_bf_long',
    gym_ar: 'هامسترنج خارجي',
    anchor: [618, 1319],
    lineEnd: [810, 1300],
    box: [820, 1280, 170, 40],
    align: 'start'
  },
  {
    id: 'gastrocnemius_medial',
    gym_ar: 'سمانة داخلي',
    anchor: [563, 1685],
    lineEnd: [330, 1680],
    box: [180, 1660, 140, 40],
    align: 'end'
  },
  {
    id: 'gastrocnemius_lateral',
    gym_ar: 'سمانة خارجي',
    anchor: [611, 1638],
    lineEnd: [810, 1640],
    box: [820, 1620, 140, 40],
    align: 'start'
  },
  {
    id: 'soleus',
    gym_ar: 'سولس',
    anchor: [591, 1778],
    lineEnd: [330, 1760],
    box: [200, 1740, 120, 40],
    align: 'end'
  }
]
