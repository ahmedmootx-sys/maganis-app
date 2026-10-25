# Maganis Anatomical Muscle Atlas Audit (G6-C)

**Date**: 2026-10-25  
**Inspector**: Antigravity Assistant  
**Assets**: `evidence/g6-c/contact-sheet/` (Contact sheet overview & 57 individual muscle tiles)  
**Total Muscles Audited**: 53  

---

## 1. Owner Defect Investigation Summary

| Screenshot Defect | Muscle ID(s) | Root Cause in Codebase | Resolution in G6-C |
| :--- | :--- | :--- | :--- |
| **2. Scapular Pull-Up Back View**: Large red rounded block with dashed outline on lower back + red triangle on upper back | `lats` (lower block), `trap_lower` (upper triangle) | `APPROXIMATE_REGIONS.lats` in `src/modules/workout/approximateRegions.ts` drew a crude hand-drawn SVG polygon (`M 505 660 L 430 690...`) rendered with `strokeDasharray="6 4"`. `trap_lower` is a real mesh triangle. | Removed the hand-drawn polygon. Per Rule C3.4, muscles without geometry are not painted with fake polygons; rendered with an anatomical locator pin from `atlas-anchors.json` and tagged "مفيش رسم للعضلة دي". |
| **3. Side Plank Back View**: Two small red rectangles at the sacrum between yellow arcs | `quadratus_lumborum` | `APPROXIMATE_REGIONS.quadratus_lumborum` drew small rectangular polygons (`M 480 860 L 445 870...`) at the sacrum level. | Removed the artificial rectangles. Quadratus lumborum is represented by a locator pin in `atlas-anchors.json` and chip selection. |
| **4. Support Hold Front View**: Tiny red wedges at the sternum and thin yellow curves at sides | `pec_costal` (wedges at sternum), `serratus_anterior` (lateral curves) | Crude centroid triangle filtering in `build_binary_geometry.mjs` created tiny fragmented wedges at the sternocostal junction. | Replaced centroid filtering with exact plane triangle clipping in 3D (`clipTrianglesPlane`), producing clean, contiguous contours. |
| **5. Bench Press Front View**: Ragged saw-tooth yellow lower chest boundary | `pec_sternal` and `pec_costal` | Horizontal slicing selected whole triangles if triangle centroid $z \ge \text{splitZ}$, creating jagged stair-step edges. | Implemented analytical triangle-plane bisecting at $z = \text{splitZ}$ in `tools/atlas/build_binary_geometry.mjs`. Boundary is now a smooth line. |

---

## 2. 53-Muscle Comprehensive Audit Table

| ID | English Name | Arabic Name | Expected Views | Atlas Source | Verdict | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `pec_clavicular` | Pectoralis major — clavicular | صدر علوي | A | Mesh | **Looks like real muscle** | Clean clavicular head contour. |
| `pec_sternal` | Pectoralis major — sternal | صدر أوسط | A | Derived split | **Looks like real muscle** | Smoothed boundary against costal head after analytical plane cut. |
| `pec_costal` | Pectoralis major — costal | صدر سفلي | A | Derived split | **Looks like real muscle** | Smoothed boundary; ragged wedges eliminated. |
| `pec_minor` | Pectoralis minor | الصدرية الصغرى | A | Mesh | **Looks like real muscle** | Small deep muscle under pectoralis major; visible in deep mode. |
| `serratus_anterior` | Serratus anterior | سيراتس | A | Mesh | **Looks like real muscle** | Distinct finger-like digitations on lateral rib cage. |
| `delt_anterior` | Anterior deltoid | كتف أمامي | A | Mesh | **Looks like real muscle** | Accurate contour on front shoulder. |
| `delt_lateral` | Lateral deltoid | كتف جانبي | A+P | Mesh | **Looks like real muscle** | Accurately defines shoulder width in both views. |
| `delt_posterior` | Posterior deltoid | كتف خلفي | P | Mesh | **Looks like real muscle** | Clear rear shoulder cap. |
| `teres_minor` | Teres minor | تريس ماينور | P | Mesh | **Looks like real muscle** | Rotator cuff muscle cleanly positioned below infraspinatus. |
| `infraspinatus` | Infraspinatus | إنفراسبيناتس | P | Mesh | **Looks like real muscle** | Large scapular fossa surface coverage. |
| `supraspinatus` | Supraspinatus | سوبراسبيناتس | P | Mesh | **Looks like real muscle** | Deep muscle above scapular spine; visible in deep mode. |
| `trap_upper` | Upper trapezius | ترابس علوي | P | Mesh | **Looks like real muscle** | Distinct neck-to-acromion contour. |
| `levator_scapulae` | Levator scapulae | ليفيتور سكابيولي | P | Mesh | **Looks like real muscle** | Deep cervical strap to superior scapular angle; deep mode. |
| `trap_middle` | Middle trapezius | ترابس أوسط | P | Mesh | **Looks like real muscle** | Horizontal diamond fibers between spine and scapula. |
| `trap_lower` | Lower trapezius | ترابس سفلي | P | Mesh | **Looks like real muscle** | Inverted triangle down to T12 spine. |
| `rhomboids` | Rhomboids | رومبويد | P | Mesh | **Looks like real muscle** | Deep rhomboid major/minor beneath trapezius; deep mode. |
| `teres_major` | Teres major | تريس ميجر | P | Mesh | **Looks like real muscle** | Thick lateral muscle from inferior angle of scapula. |
| `lats` | Latissimus dorsi | لاتس | P | No mesh (Locator) | **Locator Pin** | Hand-drawn polygon removed; represented by locator pin at [512, 755]. |
| `erector_spinae` | Erector spinae | إريكتور | P | Mesh | **Looks like real muscle** | Bilateral columns along vertebral column. |
| `quadratus_lumborum` | Quadratus lumborum | جانب أسفل الظهر | P | No mesh (Locator) | **Locator Pin** | Sacrum rectangles removed; represented by locator pin at [512, 888]. |
| `biceps_long` | Biceps brachii — long head | باي طويل | A | Mesh | **Looks like real muscle** | Outer bicipital belly. |
| `biceps_short` | Biceps brachii — short head | باي قصير | A | Mesh | **Looks like real muscle** | Inner bicipital belly. |
| `brachialis` | Brachialis | براكيالس | A | Mesh | **Looks like real muscle** | Deep elbow flexor beneath biceps; deep mode. |
| `triceps_long` | Triceps brachii — long head | تراي طويل | P | Mesh | **Looks like real muscle** | Medial scapular head extending down to olecranon. |
| `triceps_lateral` | Triceps brachii — lateral head | تراي جانبي | P | Mesh | **Looks like real muscle** | Lateral horse-shoe belly. |
| `triceps_medial` | Triceps brachii — medial head | تراي أوسط | P | Mesh | **Looks like real muscle** | Deep distal triceps; deep mode. |
| `brachioradialis` | Brachioradialis | براكيو | A | Mesh | **Looks like real muscle** | Prominent forearm flexor along radius. |
| `forearm_flexors` | Forearm flexors | ساعد داخلي | A | Mesh | **Looks like real muscle** | Medial epicondyle anterior forearm group. |
| `forearm_extensors` | Forearm extensors | ساعد خارجي | P | Mesh | **Looks like real muscle** | Lateral epicondyle posterior forearm group. |
| `rectus_abdominis_upper` | Rectus abdominis — upper | بطن علوي | A | No mesh (Locator) | **Locator Pin** | Hand-drawn polygon removed; locator pin at [512, 675]. |
| `rectus_abdominis_lower` | Rectus abdominis — lower | بطن سفلي | A | No mesh (Locator) | **Locator Pin** | Hand-drawn polygon removed; locator pin at [512, 858]. |
| `obliques_external` | External obliques | أوبليك | A | Mesh | **Looks like real muscle** | Broad anterolateral flank musculature. |
| `transversus_abdominis` | Transversus abdominis | بطن عميقة | A | No mesh (Locator) | **Locator Pin** | Hand-drawn polygon removed; locator pin at [512, 790]. |
| `iliopsoas` | Iliopsoas | إليوبسواس | A | Mesh | **Looks like real muscle** | Deep pelvic hip flexor; deep mode. |
| `tfl` | Tensor fasciae latae | جانب الورك | A | Mesh | **Looks like real muscle** | Anterolateral hip stabilizer. |
| `sartorius` | Sartorius | سارتوريوس | A | Mesh | **Looks like real muscle** | Diagonal strap from ASIS to medial tibia. |
| `rectus_femoris` | Rectus femoris | فخذ أمامي وسط | A | Mesh | **Looks like real muscle** | Central superficial quadriceps belly. |
| `vastus_lateralis` | Vastus lateralis | فخذ أمامي خارجي | A | Mesh | **Looks like real muscle** | Large lateral quad sweep. |
| `vastus_medialis` | Vastus medialis | الدمعة | A | Mesh | **Looks like real muscle** | Teardrop muscle above medial patella. |
| `vastus_intermedius` | Vastus intermedius | فخذ أمامي عميق | A | Mesh | **Looks like real muscle** | Deep quadriceps under rectus femoris; deep mode. |
| `hamstring_bf_long` | Biceps femoris — long head | هامسترنج خارجي | P | Mesh | **Looks like real muscle** | Lateral posterior thigh contour. |
| `hamstring_bf_short` | Biceps femoris — short head | فخذ خلفي قصير | P | Mesh | **Looks like real muscle** | Deep lateral hamstring; deep mode. |
| `hamstring_semitendinosus` | Semitendinosus | هامسترنج داخلي | P | Mesh | **Looks like real muscle** | Medial posterior thigh belly. |
| `hamstring_semimembranosus` | Semimembranosus | فخذ خلفي عميق | P | Mesh | **Looks like real muscle** | Deep medial hamstring beneath semitendinosus; deep mode. |
| `glute_max` | Gluteus maximus | جلوتس كبير | P | Mesh | **Looks like real muscle** | Large posterior buttock muscle. |
| `glute_med` | Gluteus medius | جلوتس وسطي | P | Mesh | **Looks like real muscle** | Upper lateral hip abductor. |
| `glute_min` | Gluteus minimus | جلوتس صغير | P | Mesh | **Looks like real muscle** | Deep abductor under gluteus medius; deep mode. |
| `adductors` | Adductors | فخذ داخلي | A | Mesh | **Looks like real muscle** | Medial thigh groin group. |
| `tibialis_anterior` | Tibialis anterior | مقدمة الساق | A | Mesh | **Looks like real muscle** | Anterolateral shin muscle. |
| `gastrocnemius_medial` | Gastrocnemius — medial head | سمانة داخلي | P | Mesh | **Looks like real muscle** | Medial calf belly. |
| `gastrocnemius_lateral` | Gastrocnemius — lateral head | سمانة خارجي | P | Mesh | **Looks like real muscle** | Lateral calf belly. |
| `soleus` | Soleus | سولس | P | Mesh | **Looks like real muscle** | Broad deep calf muscle beneath gastrocnemius. |
| `neck_scm` | Sternocleidomastoid | رقبة | A | Mesh | **Looks like real muscle** | Diagonal anterior cervical strap. |

---

## 3. Summary of Geometry Status

- **Drawn from Verified Mesh**: 46 muscles
- **Derived Split from Real Mesh**: 2 muscles (`pec_sternal`, `pec_costal`)
- **No Mesh in BP3D 4.0 (Locator Pin)**: 5 muscles (`lats`, `quadratus_lumborum`, `rectus_abdominis_upper`, `rectus_abdominis_lower`, `transversus_abdominis`)
- **Total Muscles in Catalog**: 53
