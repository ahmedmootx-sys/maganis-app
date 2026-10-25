# MAGANIS TASK G6-C REPORT: MUSCLE ATLAS (Accuracy, Names Mode, Tap Any Muscle)

**Date**: 2026-10-25  
**Branch**: `main`  
**Author**: Antigravity Agent  
**Language Context**: Arabic (Egyptian slang for gym names, scientific English in `<bdi dir="ltr">`, standard code/reports in English).  

---

## 1. Executive Summary

Task G6-C addressed critical defects identified from the owner's real Android phone screenshots:
1. **Unreadable Names Mode**: Replaced 6-7px unreadable labels with >= 11.25 CSS px high-contrast cards, thin solid leader lines, side-aware placement, and collision-avoidance layout.
2. **Weird Lower Back Block & Sacrum Rectangles**: Traced to fake hand-drawn SVG polygons in `APPROXIMATE_REGIONS` (`lats` and `quadratus_lumborum`). Removed all hand-drawn polygons; replaced with clean anatomical locator pins linked to `data/atlas-anchors.json`.
3. **Chest Split Sawtooth Raggedness & Sternum Wedges**: Traced to crude centroid triangle filtering during binary mesh generation. Rebuilt the 3D geometry with analytical plane triangle clipping at `splitZ`, yielding smooth, anatomical split curves between `pec_sternal` and `pec_costal`.
4. **Tap Any Muscle in Every Mode**: Implemented full selection capabilities for all 53 muscles in surface, deep, and names mode, as well as without exercise context. 2px accent outline on selected muscle, 45% dimming on unselected muscles. Detail card bottom sheet features:
   - Gym name (Egyptian gym slang)
   - Scientific English name in `<bdi dir="ltr">`
   - "فين مكانها" (`where_ar` via `<Claim>`)
   - "بتتربط فين" (`attaches_ar` via `<Claim>`)
   - "بتعمل إيه" (`does_ar` via `<Claim>`)
   - Muscle group
   - "تقريبي" or "مفيش رسم للعضلة دي" badge
   - "تمارين بتشغّل العضلة دي" (clickable exercise list navigating to each exercise)
   - Dynamic viewBox shift so the bottom sheet never occludes the selected muscle.
5. **License Reconciliation**: Verified official DBCLS BodyParts3D release notice (2025/02/27). Updated license in footer, README, and `LICENSE-ATLAS.txt` to **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

---

## 2. Defect & Deliverables Table

| ID | Description | Red Screenshot | Green Screenshot | Gate / Verification | Status | One-Sentence Visual Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C1** | Tap Any Muscle & Detail Bottom Sheet | [c3-missing-chips.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c3-missing-chips.png) | [c1-card-lats.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c1-card-lats.png), [c1-card-pec-minor.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c1-card-pec-minor.png) | `scripts/capture-g6c-green.mjs` (53/53 real Playwright taps pass) | **Fixed** | Selecting any muscle smoothly shifts the viewport and opens a structured card with gym name, English name in `<bdi>`, 3 `<Claim>` texts, badge, and exercise links. |
| **C2** | Names Mode Labels & Collision Avoidance | [c2-names-mode-labels.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c2-names-mode-labels.png) | [c2-names-mode-labels.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c2-names-mode-labels.png) | `scripts/gate-atlas-labels.mjs` (67 labels checked, 0 errors) | **Fixed** | Labels render as solid high-contrast rounded cards with >= 11.25 CSS px font and thin solid leader lines with zero collisions. |
| **C2.Toolbar** | Unified Toolbar Order & Deep Toggle | [c2-toolbar-shift.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c2-toolbar-shift.png) | [c2-toolbar-shift.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c2-toolbar-shift.png) | `scripts/gate-atlas.mjs` | **Fixed** | The toolbar maintains constant order: View Toggle (أمامي / خلفي), Deep Muscle Toggle, Names Mode Toggle across all exercises. |
| **C3.1** | Weird Lower Back Block (Scapular Pull-up) | [c3-scapular-pullup-block.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c3-scapular-pullup-block.png) | [c3-scapular-pullup-block.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c3-scapular-pullup-block.png) | `scripts/gate-atlas.mjs` | **Fixed** | The fake hand-drawn dashed red block (`lats` approximate polygon) is eliminated, replaced by real anatomical meshes and an honest locator pin. |
| **C3.2** | Weird Rectangles at Sacrum (Side Plank) | [c3-sacrum-rectangles.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c3-sacrum-rectangles.png) | [c3-sacrum-rectangles.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c3-sacrum-rectangles.png) | `scripts/gate-atlas.mjs` | **Fixed** | The two red rectangles (`quadratus_lumborum` polygon) are removed in favor of a clean locator pin and true erector spinae / glute med geometry. |
| **C3.3** | Sawtooth Jagged Chest Split (Bench Press) | [c3-bench-press-ragged.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c3-bench-press-ragged.png) | [c3-bench-press-ragged.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c3-bench-press-ragged.png) | `scripts/gate-atlas.mjs` | **Fixed** | The chest split line between sternal and costal pec heads is an analytically clipped smooth curve with no jagged teeth. |
| **C3.4** | Missing Chips & No-Mesh Identification | [c3-missing-chips.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/red/c3-missing-chips.png) | [c3-missing-chips.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g6-c/green/c3-missing-chips.png) | `scripts/gate-atlas.mjs` | **Fixed** | The 5 muscles without 3D geometry in BodyParts3D are clearly badged "مفيش رسم للعضلة دي" and open full educational detail cards. |
| **C3.5** | License Footer Accuracy | N/A (repo text mismatch) | Verified official DBCLS 2025/02/27 notice | `tools/atlas/README.md`, `LICENSE-ATLAS.txt` | **Fixed** | Footer, README, and licenses updated to "CC Attribution 4.0 International" in agreement with DBCLS official license. |

---

## 3. Files Modified & Created

### Project Source Files:
- [src/modules/workout/AnatomyMuscleMap.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/AnatomyMuscleMap.tsx):
  - Added full muscle selection in surface, deep, names, and no-exercise modes.
  - Implemented C2 leader-line labels with collision-avoidance layout, >= 11.25 CSS px font, solid backgrounds, and thin solid lines.
  - Unified toolbar layout with persistent Deep Muscle Toggle.
  - Detail Bottom Sheet: gym name, English name in `<bdi dir="ltr">`, "فين مكانها", "بتتربط فين", "بتعمل إيه" (all rendered via `<Claim id="..." status="coach_authored">`), group name, badge ("تقريبي" / "مفيش رسم للعضلة دي"), and clickable exercise list.
  - Dynamic viewBox shift ($Y > 600$ shifts $Y$ upward by $320\text{px}$) preventing bottom sheet occlusion.
  - Locator pin overlay for no-geometry muscles (`data/atlas-anchors.json`).
- [src/content/Claim.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/Claim.tsx):
  - Added `data-claim-id={id}` attribute for QA and automated gate traceability.
- [src/content/claims.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/claims.ts):
  - Registered all 53 muscles' `muscle_where.<id>`, `muscle_attaches.<id>`, and `muscle_does.<id>` with status `'coach_authored'`.
- [src/content/muscle-info-v1.1.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/muscle-info-v1.1.json):
  - Created containing `does_ar` and `attaches_ar` for all 53 muscles.
- [src/data/atlas-anchors.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/atlas-anchors.json) and [data/atlas-anchors.json](file:///c:/Users/power%20tech/Downloads/maganis-project/data/atlas-anchors.json):
  - Created locator pin coordinates for `lats`, `quadratus_lumborum`, `rectus_abdominis_upper`, `rectus_abdominis_lower`, and `transversus_abdominis`, marked `unreviewed`.
- [src/modules/workout/approximateRegions.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/approximateRegions.ts):
  - Emptied hand-drawn polygon paths (`path: ''`), keeping only anchors for locator pins.
- [src/styles/components.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/components.css):
  - Removed `stroke-dasharray` from `.muscle-approximate`. Added `.atlas-locator-pin` styles.
- [src/qa/states.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/qa/states.ts):
  - Registered G6-C atlas states (`choice-atlas-names-front`, `choice-atlas-names-back`, `choice-atlas-bench-press`, `choice-atlas-scapular-pullup`, `choice-atlas-side-plank`, `choice-atlas-pullup`).

### Pipeline & Tooling:
- [tools/atlas/build_binary_geometry.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/tools/atlas/build_binary_geometry.mjs):
  - Replaced crude centroid triangle filtering with exact plane triangle clipping (`clipTrianglesPlane`) at $z = \text{splitZ}$. Rebuilt binary geometry (`tools/atlas/geometry_bundle.bin`, 20.70 MB).
- [tools/atlas/render_server.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/tools/atlas/render_server.mjs):
  - Re-rendered SVGs and metadata using headless Chrome WebGL to regenerate `public/atlas/anterior.svg`, `public/atlas/posterior.svg`, and `public/atlas/atlas-meta.json`.
- [LICENSE-ATLAS.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/LICENSE-ATLAS.txt) and [tools/atlas/README.md](file:///c:/Users/power%20tech/Downloads/maganis-project/tools/atlas/README.md):
  - Updated license to CC Attribution 4.0 International.

### Automated Gates & Verification:
- [scripts/gate-atlas.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-atlas.mjs): Passed (456 checks, 0 errors).
- [scripts/gate-atlas-deep.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-atlas-deep.mjs): Passed (7 checks, 0 errors).
- [scripts/gate-atlas-labels.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-atlas-labels.mjs): Passed (67 label instances checked across 8 states, 0 errors).
- [scripts/capture-g6c-green.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/capture-g6c-green.mjs): Automated Playwright evidence capture & 53-muscle real tap audit. Passed (53/53 muscles passed).
- [src/modules/workout/atlasG5c.test.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/atlasG5c.test.tsx): Updated to G6-C label minimums and badge checks. Passed (4/4 tests).

---

## 4. Accuracy Audit & Rebuild Findings (C3)

### 4.1 Contact Sheet Audit
All 53 muscles were rendered in isolation in 160x240 tiles and audited in [docs/atlas-contact-sheet-audit.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/atlas-contact-sheet-audit.md).
- **Owner Screenshot 2 (Scapular Pull-up lower back block)**: Caused by a hand-drawn SVG polygon in `approximateRegions.ts` assigned to `lats` with `strokeDasharray: "6 4"`. Status: **Eliminated**.
- **Owner Screenshot 3 (Side plank sacrum rectangles)**: Caused by hand-drawn SVG polygons in `approximateRegions.ts` assigned to `quadratus_lumborum`. Status: **Eliminated**.
- **Owner Screenshot 4 & 5 (Sawtooth chest split & sternum wedges)**: Caused by centroid triangle filtering in `build_binary_geometry.mjs` splitting triangles based on whether the center was $\lessgtr z_{\text{split}}$, creating jagged steps. Status: **Eliminated** via plane triangle clipping.

### 4.2 BodyParts3D 4.0 "No Mesh" Reality
The parts lists and releases of BodyParts3D 4.0 were searched by Latin anatomical names and FMA IDs:
- `latissimus dorsi` (FMA: 9626): **0 OBJ files** in BP3D 4.0.
- `quadratus lumborum` (FMA: 19728): **0 OBJ files** in BP3D 4.0.
- `transversus abdominis` (FMA: 9630): **0 OBJ files** in BP3D 4.0.
- `rectus abdominis` (FMA: 9628): **0 OBJ files** in BP3D 4.0 (neither upper nor lower segments exist as separate meshes).
Earlier reports claiming meshes existed or could be trivially exported were **false**.

### 4.3 Alternative 3D Open Anatomical Sources Spike
A comprehensive spike was written in [docs/spikes/atlas-sources.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/spikes/atlas-sources.md) evaluating Zygote, Blender Human Base Meshes, Visible Human, and DBCLS 4.2:
- Mixing 3D meshes from different anatomical donors without high-density non-rigid registration creates severe alignment mismatch (e.g. muscles floating outside skin or penetrating bones).
- Therefore, in strict adherence to Rule R2 (no fake drawings), no-geometry muscles are represented honestly via **anatomical locator pins** with the clear label "مفيش رسم للعضلة دي".

### 4.4 BodyParts3D License Reconciliation
- Official DBCLS release notes in `.cache/bp3d/README_e.html` (updated 2025/02/27) confirm BodyParts3D 4.0 is licensed under:
  $$\text{Creative Commons Attribution 4.0 International (CC BY 4.0)}$$
- The earlier note referencing CC BY-SA 2.1 Japan was an outdated legacy reference from older 2008 BodyParts3D releases.
- All footer credits, READMEs, and metadata now state **CC Attribution 4.0 International**.

---

## 5. Verification Method & Test Summary

- **Verification Method**: Verified in emulation using Playwright on the production build (`dist/`) served with Service Worker, at viewport **360x720 CSS px**, DPR 2, light and dark themes.
- **Unit & Integration Tests**:
  - `npm test`: **46 / 46 test suites passed** (521 / 521 tests passed).
- **Automated Gates**:
  - `gate-atlas.mjs`: **456 checks passed**, 0 errors.
  - `gate-atlas-deep.mjs`: **7 checks passed**, 0 errors.
  - `gate-atlas-labels.mjs`: **67 label instances checked across 8 states**, 0 errors.
  - `capture-g6c-green.mjs`: **53 / 53 muscles successfully tapped, verified with all 3 claims, and closed cleanly**.

---

## 6. Bundle Size Delta

| Asset | Before G6-C | After G6-C | Delta |
| :--- | :--- | :--- | :--- |
| **`dist/assets/index.js`** | 1,732.07 kB | 1,772.41 kB (gzip: 350.12 kB) | +40.34 kB |
| **`dist/assets/index.css`** | 102.80 kB | 103.38 kB (gzip: 18.15 kB) | +0.58 kB |
| **Dependencies** | 0 new npm packages | 0 new npm packages | 0 |

*Note*: The delta is due to the complete educational content additions: `where_ar`, `attaches_ar`, and `does_ar` claims for all 53 muscles in `muscle-info-v1.1.json`, claim registrations in `claims.ts`, and locator coordinates in `atlas-anchors.json`.

---

## 7. "Was False" List (Earlier Claims Contradicted by Evidence)

1. **"The lats have a 3D mesh in BodyParts3D"**: False. Thorough search of all 5,142 OBJ meshes in the DBCLS BP3D 4.0 release showed zero geometry files for FMA: 9626 (`latissimus dorsi`). The shape shown previously was a hand-drawn SVG polygon.
2. **"Approximate muscles are distinguished cleanly by dashed borders"**: False. On the user's mobile screen, dashed SVG outlines rendered as jarring, disorienting "red blocks" and "sacrum rectangles" that looked broken. Replacing them with honest locator pins and a subtle "تقريبي" badge in the card resolved this.
3. **"Labels mode was readable"**: False. Labels were rendered at SVG font-size 17 inside a 1024px viewBox on a 360px viewport, resulting in ~5.97 CSS px text with long dashed criss-crossing lines that obstructed the anatomy.
4. **"BodyParts3D is CC BY-SA 2.1 Japan"**: False for the current release. DBCLS updated the license for BP3D 4.0 to CC Attribution 4.0 International on 2025/02/27.

---

## 8. Open Questions & Recommendations for the Owner

1. **Locator Pin Anchors Confirmation**:
   - The coordinates in `data/atlas-anchors.json` for `lats`, `quadratus_lumborum`, `transversus_abdominis`, `rectus_abdominis_upper`, and `rectus_abdominis_lower` are currently marked `"review_status": "unreviewed"`. Please review the pin locations on your phone and confirm if any locator pin should be shifted slightly up or down.
2. **Custom Lats 3D Mesh**:
   - If you wish to have a fully painted 3D shape for the lats in the future rather than a locator pin, a 3D medical illustrator can build a dedicated OBJ mesh custom-rigged and fitted to the BodyParts3D donor skeleton.
