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

// C3.4: Filled shapes may only come from real meshes or data-defined splits.
// Hand-drawn polygons have been removed; muscles without geometry show a locator pin via atlas-anchors.json.
export const APPROXIMATE_REGIONS: Record<string, ApproximateRegion> = {
  lats: {
    id: 'lats',
    view: 'P',
    ar: 'الظهرية العريضة (لاتس)',
    en: 'Latissimus dorsi',
    path: '',
    anchor: [512, 755],
    adjacentMeshes: ['erector_spinae', 'glute_max', 'trap_lower'],
    approximate: true,
  },
  rectus_abdominis_upper: {
    id: 'rectus_abdominis_upper',
    view: 'A',
    ar: 'المستقيمة البطنية - العلوية',
    en: 'Rectus abdominis, upper',
    path: '',
    anchor: [512, 675],
    adjacentMeshes: ['pec_costal', 'obliques_external'],
    approximate: true,
  },
  rectus_abdominis_lower: {
    id: 'rectus_abdominis_lower',
    view: 'A',
    ar: 'المستقيمة البطنية - السفلية',
    en: 'Rectus abdominis, lower',
    path: '',
    anchor: [512, 858],
    adjacentMeshes: ['rectus_abdominis_upper', 'obliques_external'],
    approximate: true,
  },
  transversus_abdominis: {
    id: 'transversus_abdominis',
    view: 'A',
    ar: 'المستعرضة البطنية',
    en: 'Transversus abdominis',
    path: '',
    anchor: [512, 790],
    adjacentMeshes: ['obliques_external'],
    approximate: true,
  },
  quadratus_lumborum: {
    id: 'quadratus_lumborum',
    view: 'P',
    ar: 'المربعة القطنية',
    en: 'Quadratus lumborum',
    path: '',
    anchor: [512, 888],
    adjacentMeshes: ['erector_spinae', 'glute_max'],
    approximate: true,
  },
}
