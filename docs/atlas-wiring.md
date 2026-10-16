# 3D Anatomical Atlas Wiring & Offline Asset Pipeline

## 1. Problem Root Cause Analysis

During production testing on Android Chrome (`viewport ~360x780, DPR 2`) and under hash routes/GitHub Pages deployment (`/maganis-app/`), the muscle map rendered as a white frame with a broken-image placeholder:

1. **Hardcoded Root URLs**: `AnatomyMuscleMap.tsx` and `atlasSvgLoader.ts` fetched `/atlas/anterior.svg` and loaded `/atlas/shade-anterior.webp` directly from domain root (`/`), ignoring Vite's base path (`/maganis-app/`). When hosted on GitHub Pages or a subpath, these requests resulted in HTTP 404 errors.
2. **Missing Offline Precache**: Service Worker (`public/sw.js`) had not included `/atlas/` assets in `STATIC_ASSETS`, causing complete failure when the user was offline.
3. **Absence of Failure UI**: If the SVG fetch failed, the component remained an empty frame with no diagnostic feedback or retry mechanism.
4. **Broken Image Icon**: The `<img>` tag for the multiply shade layer displayed a default browser broken-image placeholder upon a 404 response.

---

## 2. Implemented Architecture & Fixes

### A. Dynamic Asset Resolution

All atlas resources are now resolved through `assetUrl()` from `src/utils/assetUrl.ts`:

- **SVG Vector Data**: `loadAtlasSvg(view)` in `src/modules/workout/atlasSvgLoader.ts` attempts multi-stage resolution:
  1. `assetUrl('atlas/' + fileName)` (respects Vite base path `/maganis-app/` or `/`)
  2. Relative path `./atlas/${fileName}`
  3. Absolute root fallback `/atlas/${fileName}`
  4. Explicit repository subpath `/maganis-app/atlas/${fileName}`
- **WebP Shade Layer**: `shadeSrc` in `src/modules/workout/AnatomyMuscleMap.tsx` uses `assetUrl('atlas/shade-[view].webp')` with an `onError` handler hiding broken image placeholders if the network drops.

### B. Offline Service Worker Precache

`public/sw.js` (Cache Name bumped to `maganis-v5`) precaches all 5 core atlas assets during the `install` phase:

- `BASE + 'atlas/anterior.svg'`
- `BASE + 'atlas/posterior.svg'`
- `BASE + 'atlas/atlas-meta.json'`
- `BASE + 'atlas/shade-anterior.webp'`
- `BASE + 'atlas/shade-posterior.webp'`

### C. Graceful Failure & Error Recovery

`AnatomyMuscleMap.tsx` now tracks `svgError`:

- When loading fails, it displays an RTL `Callout` with a retry action button (**"إعادة المحاولة"**).
- The full accessible muscle list (primary and secondary muscle rows) **remains visible and operable** underneath the canvas even if the visual canvas is offline.

### D. Persistent Zoom & Pan Controls

The zoom toolbar overlay now permanently includes three dedicated touch buttons:

1. `+` (Zoom In, up to 3.0x)
2. `−` (Zoom Out, down to 1.0x)
3. `↺` (Reset Zoom & Pan to default state)

---

## 3. Verification Across 5 Canonical Exercises

| Exercise Name                         | View Tested          | Primary Muscles            | Secondary Muscles                  | Deep Toggle                   | Status Line        |
| :------------------------------------ | :------------------- | :------------------------- | :--------------------------------- | :---------------------------- | :----------------- |
| **Barbell Bench Press** (`chest-1`)   | Anterior / Posterior | Pectoralis major (sternal) | Triceps long/lat, Anterior deltoid | Yes (deep pectoralis/deltoid) | أساسية 1، مساعدة 4 |
| **Pull-up / Lat Pulldown** (`back-1`) | Posterior            | Latissimus dorsi           | Biceps, Rhomboids, Trapezius       | Yes (deep lats/rhomboids)     | أساسية 1، مساعدة 3 |
| **Barbell Full Squat** (`legs-1`)     | Anterior / Posterior | Quadriceps (vastus/rectus) | Gluteus maximus, Adductors         | Yes (vastus intermedius)      | أساسية 3، مساعدة 2 |
| **Overhead Press** (`shoulders-1`)    | Anterior             | Anterior deltoid           | Lateral deltoid, Triceps           | Yes (deep rotators)           | أساسية 1، مساعدة 3 |
| **Barbell Deadlift** (`back-2`)       | Posterior            | Erector spinae, Glute max  | Hamstrings, Lats, Trapezius        | Yes (deep erectors)           | أساسية 2، مساعدة 3 |
