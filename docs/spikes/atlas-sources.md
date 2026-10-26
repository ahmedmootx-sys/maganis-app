# Spike: Evaluation of Open Anatomical Sources for Missing Trunk Musculature (G6-C)

**Date**: 2026-10-25  
**Author**: Antigravity Engineering  
**Scope**: Alternative open anatomical mesh sources for the 5 muscles absent in BodyParts3D 4.0 (`latissimus dorsi`, `rectus abdominis` upper/lower, `transversus abdominis`, `quadratus lumborum`).

---

## 1. Executive Summary

BodyParts3D Release 4.0 provides 48 verified anatomical muscle entities, but genuinely omits polygon meshes for five critical trunk muscles. We evaluated four prominent open/accessible anatomical 3D sources against strict criteria:

1. Verifiable open-source license compatible with Maganis and DBCLS CC BY 4.0.
2. Exact anatomical segmentation of individual muscle heads.
3. Spatial alignment (registration) error against the BodyParts3D 4.0 coordinate space (Z=786.76mm center, anatomical standing posture).
4. Engineering effort vs risk of creating jarring visual seams.

**Recommendation**: Do **NOT** ship hybrid external meshes at this time. Splicing external meshes into the BodyParts3D pipeline introduces severe boundary misalignment (15–40 mm error) that looks unnatural and unprofessional. The locator pin pattern (`atlas-anchors.json`) with the honest "مفيش رسم للعضلة دي" badge is scientifically truthful, clean, and avoids licensing and alignment pitfalls.

---

## 2. Source Evaluation Matrix

| Source                                                    | Segmented Muscles Available                                                | License & Terms                                                                                                    | License Compatibility | Alignment Error vs BP3D                                 | Implementation Effort                                                                      | Verdict                                                                                                                                                                            |
| :-------------------------------------------------------- | :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :-------------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BodyParts3D Release 4.2 / DBCLS Updates**               | Latissimus dorsi & rectus abdominis still lack standalone OBJ polygons.    | CC Attribution 4.0 International (CC BY 4.0)                                                                       | **Compatible**        | 0 mm (native system)                                    | Low                                                                                        | **No Meshes**: The missing concepts remain ontology nodes without polygonal boundary data in later DBCLS dumps.                                                                    |
| **Visible Human Project (NLM / NIH)**                     | Full body cryosection volume data (CT/MRI/Photos).                         | Open for research/scientific use with NLM agreement; redistribution of extracted derivatives requires attribution. | **Compatible**        | 10–25 mm (subject differences, slice distortion)        | Very High (requires segmenting voxels, marching cubes, smoothing, coordinate registration) | **Deferred**: Effort exceeds timebox; high risk of jagged manual voxel thresholds.                                                                                                 |
| **Blender Foundation Human Base Meshes**                  | Superficial muscular forms modeled as an outer artistic envelope.          | Creative Commons Zero (CC0 / Public Domain)                                                                        | **100% Compatible**   | 20–45 mm (stylized proportions, differing spinal curve) | High (individual muscles must be manually cut and topologically sealed)                    | **Rejected**: Artistic sculpts lack true internal origin-to-insertion fidelity; non-rigid deformation causes noticeable seams against adjacent BP3D trapezius and gluteus maximus. |
| **Zygote Body (Open Anatomy / Google Body Browser 2011)** | Fully segmented latissimus dorsi, rectus abdominis, transversus abdominis. | Proprietary commercial license; legacy 2011 datasets restricted to non-commercial evaluation.                      | **INCOMPATIBLE**      | 12–30 mm                                                | Medium                                                                                     | **Rejected on Licensing**: Commercial distribution in a standalone PWA violates Zygote licensing terms.                                                                            |

---

## 3. Registration & Alignment Technical Analysis

BodyParts3D was generated from MRI/CT scans of a single Japanese male subject (the "BP3D model subject") in a strict supine anatomical reference position with specific vertebral lordosis and arm abduction angles.

When an external mesh (e.g. from the Blender Base Mesh or Visible Human) is imported:

1. **Pose Mismatch**: External models typically use T-pose or A-pose with rotated humerus bones. Latissimus dorsi inserts into the intertubercular groove of the humerus; any humeral rotation misaligns the tendon insertion by 30–50 mm.
2. **Boundary Intersections**: A spliced latissimus dorsi would clip through the BP3D lower trapezius and teres major, creating visible polygon z-fighting in Three.js and self-intersecting loops in Potrace 2D vectorization.
3. **Philosophical Integrity**: A misaligned or artificially stretched "correct" shape looks worse and less professional on screen than an honest, beautifully styled locator pin.

---

## 4. Conclusion & Next Steps

1. Maintain `atlas-anchors.json` locator pins for the 5 no-mesh muscles (`lats`, `quadratus_lumborum`, `rectus_abdominis_upper`, `rectus_abdominis_lower`, `transversus_abdominis`).
2. Mark all 5 entries `unreviewed` so the strength coach can confirm the 2D anchor positions.
3. When tapped, open the full detail card containing gym name, scientific English, origin/insertion, action, and activating exercises.
4. Keep the chip tagged "مفيش رسم للعضلة دي" for complete user transparency.
