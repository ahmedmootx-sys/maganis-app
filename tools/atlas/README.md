# Maganis Anatomical Muscle Atlas Toolchain

This directory contains the automated pipeline for generating the 2D anatomical muscle atlas static assets for **Maganis** from BodyParts3D Release 4.0 3D polygon meshes.

---

## 1. Quick Start

To generate or rebuild all atlas assets with a single command:

```bash
npm run build:atlas
```

Or run directly with Node:

```bash
node tools/atlas/build_atlas.mjs
```

---

## 2. Pipeline Architecture

The pipeline consists of three sequential, deterministic stages:

```
data/atlas_muscles.json (53 muscle definitions)
       │
       ▼
[1] resolve_all_muscles.mjs
       │  • Matches names to FMA concepts & OBJ file IDs in BodyParts3D 4.0
       │  • Resolves anatomical heads (e.g. flexor carpi ulnaris)
       │  • Detects absent parts truthfully
       ▼
tools/atlas/resolved_muscles.json
       │
       ▼
[2] build_binary_geometry.mjs
       │  • Parses 142 muscle OBJs + skin (FJ2810) + hair (FJ2813)
       │  • Unions bilateral pairs into single geometries
       │  • Splits sternocostal pectoralis major at 35% height (pec_sternal / pec_costal)
       │  • Packs geometries into 4-byte aligned binary bundle
       ▼
tools/atlas/geometry_bundle.bin (20.4 MB) & geometry_meta.json
       │
       ▼
[3] render_server.mjs + render_page.html (Headless Chrome)
       │  • Boots local HTTP server + launches Headless Chrome with isolated profile
       │  • Loads Three.js and binary geometries
       │  • Computes orthographic projections (1024x2048, centered at Z = 786.76 mm)
       │  • Pass A: Grayscale diffuse lighting -> shade-anterior.webp & shade-posterior.webp
       │  • Pass B: Integer ID ShaderMaterial with depth test -> Occluded visible pixel masks
       │  • Pass C: Per-muscle isolated renders -> Full unoccluded pixel masks
       │  • Pass D: Skin + hair renders -> Body silhouette masks
       │  • Vectorization: Potrace traces masks into clean SVG paths
       │  • Label Anchors: Two-pass distance transform (pole of inaccessibility)
       │  • Verification: Orientation sanity check (Right pec major X < Left pec major X)
       ▼
Generated Assets in public/atlas/
```

---

## 3. Script Reference

| Script | Purpose | Output |
| :--- | :--- | :--- |
| `resolve_all_muscles.mjs` | Resolves muscle IDs to constituent OBJ files using BP3D IS-A relations. | `tools/atlas/resolved_muscles.json` |
| `build_binary_geometry.mjs` | Pre-processes and merges OBJs into an aligned binary payload. | `geometry_bundle.bin`, `geometry_meta.json` |
| `render_server.mjs` | Server & vectorization pipeline driving Headless Chrome. | `public/atlas/*` assets |
| `render_page.html` | Client-side WebGL rendering harness loaded by Chrome. | Framebuffer pixel readbacks |
| `check_names.mjs` | Audits input definitions against BodyParts3D lists. | `docs/atlas-name-check.md` |
| `check_bounds.mjs` | Measures exact 3D extents across all 2,234 meshes. | Console bounding box metrics |

---

## 4. Generated Artifacts (`public/atlas/`)

All generated assets are static files placed in `public/atlas/`:

1. **`anterior.svg` & `posterior.svg`**:
   - Shared `viewBox="0 0 1024 2048"`.
   - `<path id="body-silhouette" ... />`: Anatomical human silhouette from skin/hair meshes.
   - `<path id="m-<id>-vis" ... />`: Visible (unoccluded) muscle outline.
   - `<path id="m-<id>-full" ... />`: Full unoccluded anatomical boundary.
   - Empty `d=""` paths for the 5 missing entities to prevent client runtime DOM errors.
   - Combined gzipped size: ~203 KB (well below the 1.5 MB limit).

2. **`shade-anterior.webp` & `shade-posterior.webp`**:
   - Directional diffuse-lit anatomical muscle rasters with transparency.
   - Lightweight: ~19.5 KB and ~17.8 KB (limit: <= 300 KB).

3. **`atlas-meta.json`**:
   - Metadata for all 53 muscles: Arabic name, English name, expected views, best view, best layer (`S` if `visible_ratio >= 0.35` else `D`), visible ratio, pixel area, derived flag, parts used, and label anchors `{ A: [x, y], P: [x, y] }`.

4. **`debug.html`**:
   - Interactive developer inspector with dual-figure views, layer/mask toggles, WebP shade slider, 53-muscle checklist, and hover metadata tooltip.

---

## 5. Licensing & Data Hygiene

- Raw BodyParts3D files reside in `.cache/bp3d/` (git-ignored) and are never committed.
- BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International. Full attribution and changes made are documented in [`LICENSE-ATLAS.txt`](../../LICENSE-ATLAS.txt).

