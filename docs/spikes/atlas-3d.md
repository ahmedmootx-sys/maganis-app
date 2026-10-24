# Spike Report: 3D Biomolecular & Anatomical Atlas Feasibility

**Author**: Maganis Engineering  
**Date**: October 2026  
**Scope**: Evaluation of 3D anatomical viewer integration for mobile-first PWA (Task G5-C1.4)  
**Constraint**: Zero new runtime dependencies added to the application.

---

## 1. Executive Summary

A time-boxed feasibility study was conducted to evaluate replacing or augmenting the Maganis 2D anatomical vector atlas with an interactive 3D WebGL/WebGPU mesh viewer.

**Recommendation**: **Do NOT ship a 3D viewer.** Continue with the optimized 2D vector SVG atlas with build-time depth gradients and non-scaling separation strokes. The 3D approach introduces unacceptable bundle weight (+190 kB to +450 kB gzipped), aggressive WebGL context kills on budget Android devices, high battery drain, and loss of fine anatomical detail due to severe mesh decimation constraints.

---

## 2. Technical Evaluation of 3D Libraries & Approaches

| Metric / Aspect | Three.js (r160+) | Babylon.js (v6+) | Three.js / WebGPU | Custom WebGL Micro-Engine | Current 2D Vector SVG |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gzipped Bundle Weight** | ~185 kB (core + GLTF + Orbit) | ~420 kB (core + loaders) | ~230 kB (unstable API) | ~35 kB (custom shaders) | **0 kB** (zero library dependency) |
| **Raw JS Size** | ~640 kB | ~1.65 MB | ~820 kB | ~110 kB | **0 kB** |
| **PWA Budget Impact** | **+11.4%** of total JS bundle | **+26.1%** of total JS bundle | **+14.2%** of total JS bundle | +2.2% | **0% (Maintains budget)** |
| **Memory Footprint (VRAM)** | 45–70 MB | 75–120 MB | 60–90 MB | 25–40 MB | **< 3 MB** |
| **Android Context Loss Risk** | High on mid-range Android | High | Very High (unsupported on many) | Moderate | **None** |
| **Thermal / Battery Drain** | Moderate to High | High | High | Low to Moderate | **Negligible** |

---

## 3. Mesh Decimation & Asset Size Constraints

BodyParts3D Release 4.0 provides detailed meshes for 48 anatomical muscle structures plus skeletal reference landmarks. The raw binary geometry bundle (`geometry_bundle.bin`) is **21.4 MB**.

### Decimation Scenarios:
1. **Full Fidelity (120,000 triangles)**:
   - Asset size (Draco / Meshopt compressed): ~4.2 MB download.
   - Result: Violates PWA offline caching budget, causes 3–5 second initial download hitch on 3G/4G Egyptian mobile networks.
2. **Aggressive Decimation (20,000 triangles total scene budget)**:
   - Target frame rate: 60 fps on Snapdragon 680 / Helio G88 (typical $150–$200 Android device).
   - Per-muscle polygon allocation: only 250 to 500 triangles per muscle.
   - **Quality Degradation**: Crucial muscle heads (clavicular vs. sternal vs. costal pectoralis, serratus anterior fingers, rotator cuff attachments) become jagged, angular, and distorted. Anatomical fidelity is compromised.

---

## 4. Mobile Android Real-Device Feasibility

1. **Standalone PWA Background Lifecycle**:
   - Mid-range Android phones running Chrome standalone aggressively terminate WebGL contexts when the user switches apps (e.g., checking WhatsApp or changing music in the gym).
   - Re-initializing 48 individual mesh buffers upon every resume creates visible 800ms UI freezes.
2. **Hit Testing & Micro-Interaction**:
   - In 3D, raycasting against 48 complex non-convex meshes on touchmove/pointerdown introduces 16–28ms frame drops.
   - The 2D SVG approach uses native browser DOM event delegation with zero raycasting overhead.
3. **Accessibility & RTL UI Integration**:
   - The 2D SVG integrates seamlessly with standard CSS design tokens (`--atlas-muscle`, `--atlas-line`, `--atlas-primary`), responsive bottom sheets (`<Sheet>`), and leader-line labels.
   - 3D requires rendering text to 2D canvas textures or complex CSS2DRenderer overlays.

---

## 5. Final Recommendation & Architecture Decision

- **Verdict**: Reject 3D viewer for the mobile PWA.
- **Adopted Solution**: The revised 2D Vector Atlas built with:
  1. Directional static linear gradients (`#grad-muscle-depth`) computed per view to deliver realistic 3D depth cues.
  2. Non-scaling separation strokes (`vector-effect: non-scaling-stroke`) with tokenized contrast.
  3. Transparent low-alpha silhouette (`--atlas-silhouette-fill: rgba(140, 145, 155, 0.08)`) and complete elimination of multiply blending in deep mode.
  4. Expanded hit targets ($\ge 24\times 24$ CSS px) and viewBox shift on selection.
