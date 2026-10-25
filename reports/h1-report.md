# Task H1 Verification & Root-Cause Remediation Report: Exercise Video

**Task**: Task H1 (Exercise Video Root-Cause Fix)  
**Date**: 2026-10-26  
**Status**: COMPLETE (All checks passing; regression suite verified red -> green; CI wired)  
**Verification Method**: Emulation on Chromium (viewport 360x720, DPR 2) driving the production build (`dist/` via `vite preview` with Service Worker offline routing stub) via Playwright (`qa/video-flow.mjs`).

---

## 1. Executive Summary & Root Cause Analysis

The owner reported twice that tapping the video play button made the card disappear, and tapping "ضيف رابط فيديو شرح" made the button vanish without showing a place to paste a link. While Task G6-A previously claimed this was fixed via `aspectRatio: '16 / 9'`, reproduction on the production build at 360x720 DPR 2 demonstrated that the card was still collapsing and the video input remained inaccessible.

### Root Cause 1: Layout Collapse (The "Play Makes the Card Vanish" Bug)

- **Mechanism**: `VideoPlayer` renders its active iframe/video inside a container with `overflow: hidden`. That container is a direct flex child of `.screen-content`, a fixed-height flex column with `overflow: auto`. In CSS flexbox, a flex item with `overflow: hidden` has an automatic `min-height: 0`, allowing the column layout algorithm to shrink it to its borders. When play was clicked, the active player container collapsed from ~200px down to **328x2 px** (a 2px sliver line), clipping the iframe completely.
- **Why it was masked previously**: The initial facade card (`NoVideoFacade` or `VideoFacade`) does not have `overflow: hidden`, so it resisted flex shrinking and appeared fine until play was tapped.
- **Root Fix Applied**:
  1. Added `flexShrink: 0` explicitly to both active video player containers in `src/modules/workout/VideoPlayer.tsx`.
  2. Added a defensive zero-specificity rule in `src/styles/components.css`:
     ```css
     :where(.screen-content, .scroller, .wizard-step-body) > * {
       flex-shrink: 0;
     }
     ```
     Because `:where()` carries zero specificity, any intentional custom flex rules still take precedence while protecting all cards and scroller children from collapsing.

### Root Cause 2: Hidden Field (The "Add Video Link" Bug)

- **Mechanism**: Tapping "ضيف رابط فيديو شرح" opened `ExerciseEditSheet` at the top of the modal. However, the video URL input was located at the very bottom of the edit sheet—approximately 4,900 px down at 360x720. The user was presented with an unrelated set of inputs (muscle pickers, exercise name, equipment) and no visible place to paste their link.
- **Root Fix Applied**:
  1. Extended `ExerciseEditSheetProps` with `focusField?: 'video' | null`.
  2. In `ExerciseEditSheet.tsx`, added an effect that detects `focusField === 'video'`, scrolls `#edit-video-url` into view (`scrollIntoView({ block: 'center' })`), and focuses the input.
  3. In `ExerciseDetailView.tsx`, passed `setEditFocus('video')` and forwarded `focusField={editFocus}` whenever the user clicks "ضيف فيديو" from either the media placeholder or the video section.

---

## 2. "Was False" Register (Operating Rules Compliance)

| Previous Claim                                                             | Origin                                                 | Finding                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------------------------------------------------------------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Exercise Video bug was fixed by switching to `aspectRatio: '16 / 9'`"** | Task G6-A Report (`reports/g6-a-report.md`, Defect D3) | **FALSE**. The diagnosis attributing the bug to a padding-bottom percentage hack was incorrect. The collapse occurred because the flex container had `overflow: hidden` within a flex column scroller, collapsing the container to its 2px border height regardless of `aspectRatio`. The facade only remained visible prior to click because it lacked the `overflow: hidden` rule. |

---

## 3. Red -> Green Verification Evidence

The test script `qa/video-flow.mjs` was executed against the unpatched production build and then against the patched production build served via `vite preview` at `http://localhost:4173/maganis-app/` with viewport 360x720 DPR 2.

### A. Pre-Fix Reproduction (Red Output)

File: [`evidence/h1/red.txt`](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/h1/red.txt)

```
FAIL  video link field is visible right after tapping "add video link"
FAIL  video link field is focused
PASS  play facade appears after saving the link
PASS  iframe is mounted after tapping play
PASS  iframe has its own size (got 200px)
FAIL  iframe is actually visible, not clipped by a collapsed container (visible 2px; the bug gave ~2px)
PASS  iframe src is the nocookie embed of the right video

3 check(s) failed
```

- **Visible height**: 2px (completely clipped by collapsed parent container).
- **Video field**: Not visible and not focused when edit sheet opened.

### B. Post-Fix Verification (Green Output)

File: [`evidence/h1/green.txt`](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/h1/green.txt)

```
PASS  video link field is visible right after tapping "add video link"
PASS  video link field is focused
PASS  play facade appears after saving the link
PASS  iframe is mounted after tapping play
PASS  iframe has its own size (got 200px)
PASS  iframe is actually visible, not clipped by a collapsed container (visible 200px; the bug gave ~2px)
PASS  iframe src is the nocookie embed of the right video

all checks passed
```

- **Visible height**: 200px (full unclipped iframe box).
- **Video field**: Visible in viewport and focused automatically.

---

## 4. Visual Evidence & Screenshot Inspection

Two 360x720 screenshots were captured directly from the running production build:

1. **Add Video Sheet**: [`evidence/h1/add-video-sheet.png`](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/h1/add-video-sheet.png)
   - _Observation_: The bottom sheet "تعديل بيانات التمرين" opens scrolled directly to the bottom. The video field "رابط فيديو شرح (يوتيوب أو فيميو أو ملف فيديو مباشر)" is centered and prominently displayed with an active focus ring. The "إلغاء" and "حفظ التعديلات" buttons are visible immediately below.
2. **Player Playing**: [`evidence/h1/player-playing.png`](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/h1/player-playing.png)
   - _Observation_: After tapping play, the exercise card retains its full layout. The video container is expanded to a solid dark player card displaying "STUB PLAYER" at 200px height. It does not disappear or collapse into a 2px sliver line.

---

## 5. Test Suite & Quality Gates

| Gate / Command      | Status    | Notes                                                                                       |
| :------------------ | :-------- | :------------------------------------------------------------------------------------------ |
| `npm run typecheck` | **PASS**  | `tsc -b` completed with 0 errors.                                                           |
| `npm run lint`      | **PASS**  | ESLint completed with 0 errors (3 pre-existing exhaustive-deps warnings).                   |
| `npx vitest run`    | **PASS**  | 46/46 test files passed, 521/521 unit and invariant tests green.                            |
| `npm run qa:video`  | **PASS**  | Production regression harness passed all 7 assertions against Vite preview.                 |
| CI Integration      | **WIRED** | Added Playwright browser installation and `npm run qa:video` to `.github/workflows/ci.yml`. |

---

## 6. Honest Technical Limits & Real-Device Requirements

- **Stub Verification Only**: The test stub fulfills requests to `www.youtube-nocookie.com`, which validates layout, container sizing, flex shrinking, DOM mounting, and focus routing. It does **not** prove YouTube accepts the embed.
- **Device Follow-up**: The owner should test on their actual phone with:
  1. A standard YouTube link: `https://www.youtube.com/watch?v=...`
  2. A shortened YouTube link: `https://youtu.be/...`
     If the embedded player displays an in-player YouTube error message (e.g. "Video unavailable" or "Playback on other websites has been disabled by the video owner - Error 153"), this indicates video-level permissions set by the uploader on YouTube's side, rather than an in-app layout collapse or code failure.
- **Scope Compliance**: No changes were made to CSP headers, iframe sandbox attributes, or `src/modules/workout/videoUtils.ts`.
