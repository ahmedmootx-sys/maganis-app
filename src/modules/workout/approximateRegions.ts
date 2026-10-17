export interface ApproximateRegion {
  id: string
  view: 'A' | 'P'
  ar: string
  en: string
  path: string
  anchor: [number, number]
  adjacentMeshes: string[]
  approximate: true
}

export const APPROXIMATE_REGIONS: Record<string, ApproximateRegion> = {
  lats: {
    id: 'lats',
    view: 'P',
    ar: 'الظهرية العريضة (المجانص)',
    en: 'Latissimus dorsi',
    path: 'M 505 660 L 430 690 L 380 770 L 375 920 L 460 1020 L 505 1020 Z M 519 660 L 594 690 L 644 770 L 649 920 L 564 1020 L 519 1020 Z',
    anchor: [512, 850],
    adjacentMeshes: ['trapezius', 'gluteus_maximus', 'teres_major'],
    approximate: true,
  },
  rectus_abdominis_upper: {
    id: 'rectus_abdominis_upper',
    view: 'A',
    ar: 'المستقيمة البطنية - العلوية',
    en: 'Rectus abdominis, upper',
    path: 'M 508 615 L 455 620 L 445 745 L 508 745 Z M 516 615 L 569 620 L 579 745 L 516 745 Z',
    anchor: [512, 680],
    adjacentMeshes: ['pec_costal', 'obliques'],
    approximate: true,
  },
  rectus_abdominis_lower: {
    id: 'rectus_abdominis_lower',
    view: 'A',
    ar: 'المستقيمة البطنية - السفلية',
    en: 'Rectus abdominis, lower',
    path: 'M 508 755 L 445 755 L 460 955 L 508 960 Z M 516 755 L 579 755 L 564 955 L 516 960 Z',
    anchor: [512, 855],
    adjacentMeshes: ['rectus_abdominis_upper', 'obliques'],
    approximate: true,
  },
  transversus_abdominis: {
    id: 'transversus_abdominis',
    view: 'A',
    ar: 'المستعرضة البطنية',
    en: 'Transversus abdominis',
    path: 'M 435 740 L 385 760 L 380 930 L 445 920 Z M 589 740 L 639 760 L 644 930 L 579 920 Z',
    anchor: [512, 840],
    adjacentMeshes: ['obliques', 'rectus_abdominis'],
    approximate: true,
  },
  quadratus_lumborum: {
    id: 'quadratus_lumborum',
    view: 'P',
    ar: 'المربعة القطنية',
    en: 'Quadratus lumborum',
    path: 'M 480 860 L 445 870 L 440 980 L 480 985 Z M 544 860 L 579 870 L 584 980 L 544 985 Z',
    anchor: [512, 920],
    adjacentMeshes: ['erector_spinae', 'gluteus_maximus'],
    approximate: true,
  },
}
