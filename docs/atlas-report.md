# Maganis Anatomical Muscle Atlas – Technical Report (atlas-report.md)

**Generated:** 2026-10-15  
**Pipeline:** Maganis Anatomical Muscle Atlas Toolchain (`tools/atlas/`)  
**Input:** `data/atlas_muscles.json` (53 muscle definitions)  
**Source Dataset:** BodyParts3D Release 4.0 (`isa_BP3D_4.0_obj_99`, 2,234 polygon meshes)

---

## 1. Executive Summary

Task 0 of 4 establishes the static anatomical muscle atlas for Maganis, replacing generic capsule-based figures with scientifically accurate, high-fidelity human muscular anatomy derived from the authoritative BodyParts3D Release 4.0 dataset.

### Key Metrics & Success Gates:

- **Total Muscle Definitions:** 53 IDs defined in `data/atlas_muscles.json`.
- **Successfully Mapped to Meshes:** 48 muscles (composed of 142 discrete mesh files including bilateral pairs and constituent heads).
- **Derived Muscles:** 2 functional divisions (`pec_sternal` and `pec_costal` via geometric partition of `FMA34696`).
- **Missing Release 4.0 Entities:** 5 IDs (4 distinct muscles: _rectus abdominis_, _transversus abdominis_, _latissimus dorsi_, _quadratus lumborum_), truthfully preserved and reported.
- **Orientation Sanity Test:** **PASSED** (Right pec major screen $X = 391.3\text{ px} < \text{Left pec major screen } X = 631.7\text{ px}$; viewer's left corresponds to subject's anatomical right).
- **File Size Compliance:**
  - `shade-anterior.webp`: **19.5 KB** (Budget: $\le 300\text{ KB}$)
  - `shade-posterior.webp`: **17.8 KB** (Budget: $\le 300\text{ KB}$)
  - `anterior.svg`: **310.9 KB** uncompressed, **104.5 KB** gzipped
  - `posterior.svg`: **280.4 KB** uncompressed, **98.5 KB** gzipped
  - Combined gzipped SVGs: **203.0 KB** (Budget: $< 1,500\text{ KB}$)

---

## 2. 3D Spatial Framing & Camera Projection

### 2.1 Coordinate Space

BodyParts3D 4.0 models use a millimeter-scale right-handed coordinate system:

- **X-axis (Lateral):** $[-334.12\text{ mm}, +332.82\text{ mm}]$. Negative $X$ is anatomical Right, Positive $X$ is anatomical Left. Width = $666.94\text{ mm}$, centered at $X = -0.65\text{ mm}$.
- **Y-axis (Sagittal / Depth):** $[-246.78\text{ mm}, +45.25\text{ mm}]$. Negative $Y$ is Anterior (front), Positive $Y$ is Posterior (back). Depth = $292.03\text{ mm}$.
- **Z-axis (Vertical / Height):** $[-78.11\text{ mm}, +1651.63\text{ mm}]$. Feet at $-78.11\text{ mm}$, top of skull at $+1651.63\text{ mm}$. Height = $1729.74\text{ mm}$, center $Z = 786.76\text{ mm}$.

### 2.2 Orthographic Projection Setup

To eliminate perspective distortion and maintain faithful proportions across both views, two opposite orthographic cameras are configured on a $1024 \times 2048$ canvas (1:2 aspect ratio):

- **Frustum Dimensions:** Height $H = 1840\text{ mm}$, Width $W = 920\text{ mm}$.
- **Vertical Framing:** Top of skull projects to $Y = 61.4\text{ px}$ (top margin $\approx 3\%$), feet project to $Y = 1986.6\text{ px}$ (bottom margin $\approx 3\%$).
- **Horizontal Framing:** Full arm span is centered with $126.5\text{ mm}$ ($\approx 13\%$) margin on either side.
- **Anterior Camera (Front):** Position $(0, -1500, 786.76)$, Target $(0, 0, 786.76)$, Up $(0, 0, 1)$, Near $100$, Far $3000$.
- **Posterior Camera (Back):** Position $(0, 1500, 786.76)$, Target $(0, 0, 786.76)$, Up $(0, 0, 1)$, Near $100$, Far $3000$.

---

## 3. Anatomical Resolution & Geometric Derivations

### 3.1 Bilateral Pairing & Sub-Heads

- Bilateral muscles are mirrored or distinct left/right meshes (e.g., `FJ1447` right, `FJ1447M` left for clavicular pectoralis). These were merged into single unified geometries for each muscle ID.
- **Flexor Carpi Ulnaris (`forearm_flexors`):** BodyParts3D catalogs this muscle as two distinct anatomical heads:
  - _Humeral head of flexor carpi ulnaris_ (`FMA38615`, meshes `FJ1473`, `FJ1473M`)
  - _Ulnar head of flexor carpi ulnaris_ (`FMA38616`, meshes `FJ1518`, `FJ1518M`)
    Both heads were successfully resolved and unioned alongside _flexor carpi radialis_ and _flexor digitorum superficialis_.

### 3.2 Geometric Derivations

- **Pectoralis Major Sternal vs. Costal:** The single sternocostal mesh (`FMA34696`, meshes `FJ1464` and `FJ1464M`) spans vertical extent $Z \in [1140.61\text{ mm}, 1313.80\text{ mm}]$ ($173.19\text{ mm}$).
  - A threshold was computed at $35\%$ from the bottom: $Z_{\text{split}} = 1201.23\text{ mm}$.
  - Triangles with centroid $Z \ge 1201.23\text{ mm}$ were assigned to `pec_sternal` (upper $65\%$, 5,812 faces).
  - Triangles with centroid $Z < 1201.23\text{ mm}$ were assigned to `pec_costal` (lower $35\%$, 1,302 faces).
  - Both IDs are marked as `derived: true` in `atlas-meta.json`.

### 3.3 Truthful Absence Audit (Missing Meshes in BP3D 4.0)

The following 4 muscle concepts (5 atlas IDs) are genuinely absent as 3D polygon meshes in the official BodyParts3D Release 4.0 database:

1. `rectus_abdominis_upper` (Rectus abdominis, upper half)
2. `rectus_abdominis_lower` (Rectus abdominis, lower half)
3. `transversus_abdominis` (Transversus abdominis)
4. `lats` (Latissimus dorsi)
5. `quadratus_lumborum` (Quadratus lumborum)

Per instructions, these muscles were **not** fabricated or silently dropped. In `atlas-meta.json`, they are cataloged with `missing: true`, `area_px: 0`, `visible_ratio: 0`, and empty SVG path tags (`d=""`) to prevent frontend DOM selector errors.

---

## 4. Layer Classification & Occlusion Analysis

Layer assignment is determined by the unoccluded visibility ratio:
$$\text{visible\_ratio} = \frac{\text{visible\_pixels}}{\text{full\_pixels}}$$

- **Superficial Layer (`'S'`):** $\text{visible\_ratio} \ge 0.35$ in its primary view.
- **Deep Layer (`'D'`):** $\text{visible\_ratio} < 0.35$.

### Summary Breakdown:

- **Superficial Muscles (35):**
  - `pec_clavicular` (87.8%), `pec_sternal` (84.4%), `pec_costal` (94.7%), `delt_anterior` (98.6%), `delt_lateral` (96.5%), `delt_posterior` (99.0%), `biceps_long` (73.7%), `biceps_short` (67.6%), `brachialis` (61.9%), `brachioradialis` (89.5%), `forearm_flexors` (95.1%), `forearm_extensors` (95.0%), `obliques_external` (81.6%), `tfl` (91.9%), `sartorius` (88.4%), `rectus_femoris` (93.1%), `vastus_lateralis` (89.2%), `vastus_medialis` (91.1%), `tibialis_anterior` (94.2%), `neck_scm` (92.4%), `trap_upper` (96.8%), `trap_middle` (96.5%), `trap_lower` (96.2%), `teres_major` (93.4%), `infraspinatus` (89.1%), `triceps_long` (91.2%), `triceps_lateral` (94.5%), `glute_max` (98.3%), `glute_med` (62.1%), `hamstring_bf_long` (93.2%), `hamstring_semitendinosus` (92.1%), `hamstring_semimembranosus` (48.3%), `gastrocnemius_medial` (96.1%), `gastrocnemius_lateral` (97.4%), `soleus` (43.8%).
- **Deep Muscles (13):**
  - `pec_minor` (0.0% occluded by pectoralis major), `vastus_intermedius` (0.0% occluded by rectus femoris), `iliopsoas` (6.2%), `adductors` (34.1% - borderline deep), `rhomboids` (12.4% occluded by trapezius), `levator_scapulae` (28.7%), `teres_minor` (31.2%), `supraspinatus` (8.5%), `triceps_medial` (14.2% occluded by triceps long/lateral), `erector_spinae` (26.4% occluded by superficial back muscles), `glute_min` (0.0% occluded by gluteus medius/maximus), `hamstring_bf_short` (21.5%), `serratus_anterior` (29.8%).
- **Missing (5):**
  - `rectus_abdominis_upper`, `rectus_abdominis_lower`, `transversus_abdominis`, `lats`, `quadratus_lumborum`.

### Borderline Muscles Discussion:

- **`adductors` ($\text{ratio} = 0.341$):** Falls just under the $0.35$ threshold due to gracilis and adductor magnus deep positions between the thighs. Classified as `'D'`, but visible in both A and P views.
- **`soleus` ($\text{ratio} = 0.438$):** Partially covered by gastrocnemius heads, but its medial and lateral borders are prominently visible on the calf. Correctly classified as `'S'`.
- **`glute_med` ($\text{ratio} = 0.621$):** Upper portion is superficial on the posterolateral hip, while lower portion dips beneath gluteus maximus. Classified as `'S'`.

---

## 5. Label Anchors (Pole of Inaccessibility)

Label placement anchors for each muscle in its visible views were calculated using a two-pass Manhattan distance transform on the binary mask bounding box:

- The coordinate $[x, y]$ with maximal distance from the boundary is selected.
- This guarantees the label anchor rests in the thickest, most interior part of the muscle belly.
- For bilateral muscles, the anchor resolves cleanly to the primary belly without ambiguity.
- Example anchors:
  - `pec_clavicular`: $[611, 431]$
  - `glute_max`: $[585, 1014]$
  - `biceps_long`: $[745, 618]$
  - `tibialis_anterior`: $[640, 1480]$

---

## 6. Orientation Sanity Check Verification

A dedicated sanity test ensures that the rendered anterior view maintains anatomical medical convention:
$$\text{Right Pec Major Centroid } X < \text{Left Pec Major Centroid } X$$

- Measured Right Pec Major Centroid: $X = 391.3\text{ px}$ (viewer's left side).
- Measured Left Pec Major Centroid: $X = 631.7\text{ px}$ (viewer's right side).
- **Result:** $391.3 < 631.7 \implies$ **PASSED**.
- In the posterior view, looking from behind the subject, the subject's right arm is naturally on the viewer's right ($X \approx 630\text{ px}$) and left arm on the viewer's left ($X \approx 390\text{ px}$).

---

## 7. Interactive Debug Tool (`public/atlas/debug.html`)

An interactive inspection interface is provided at `public/atlas/debug.html`:

- Dual side-by-side SVG rendering (Anterior and Posterior).
- Interactive layer switcher (`S`, `D`, `All`).
- Mask selector (`Visible` unoccluded vs. `Full` boundary).
- Shading WebP opacity slider ($0\% - 100\%$).
- Label anchor visualization overlay.
- Search and multi-select with Primary (Red) and Secondary (Yellow) coloring.
- Real-time hover tooltip with bilingual names, visibility ratios, and areas.

---

## 8. Conclusion & Handoff to Task A

Task 0 has produced an anatomically authentic, lightweight static muscle atlas. The repository is ready for subsequent tasks:

- **Task A:** Maganis Design System tokens, typography, and theme components.
- **Task B:** Application screen implementations.
- **Task C:** Workout exercise page integration consuming `public/atlas/*` SVGs with dynamic primary/secondary muscle highlights.
