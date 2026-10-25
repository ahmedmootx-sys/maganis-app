# OPERATING RULES (apply to every task)

R1. The standing owner rule: every piece of information shown in the app must be correct. You are not able to guarantee that by assertion. The mechanism is: every educational or factual sentence lives in `src/content` and is rendered through `<Claim id>` backed by `src/content/claims.ts` ({id, text_ar, source_id|null, status: sourced|coach_authored|unverified}). Production builds hide `unverified` claims. A test fails on any Arabic string literal of 60 or more characters outside `src/content`.
R2. Verify on the PRODUCTION build served through the service worker, not on the dev server. Fix at the shared component or token, not per screen.
R3. No invented content. If you need a fact, a source or a text you do not have, say so in the report and leave a clearly marked gap. Do not write medical, nutrition or training facts yourself.
R4. No formula changes in the calculation engine (BMR, TDEE, macros). If you think one is wrong, report it; do not edit it.
R5. No vacuous gates: every automated gate must print what it examined (counts) and enforce a minimum. Every new gate must be shown FAILING on the pre-fix build first (red first), then passing after the fix. Keep the red output in the evidence folder.
R6. Run the checks on both the fixture data and the owner's real data (`docs/owner-profile-dump.json`). Coverage, not samples: enumerate every screen, sheet, dialog and state through the state registry `src/qa/states.ts` plus a coverage test that fails when a registered state has no check.
R7. Viewports: 360x720, 360x640 and 412x892. Font scale 1 and 1.3. Light and dark. Take screenshots of the production build for each change and store them under `evidence/<task>/`.
R8. Scope freeze: do exactly what is asked. No new dependencies. Respect the bundle budget; report the size delta. If something would break the budget, stop and report.
R9. Honest reporting: write "verified in emulation" unless you actually captured it on the phone with adb. Never write "verified on device" otherwise. If an earlier report claim is contradicted by evidence, list it under "was false".
R10. Local-first: no network calls except what the task explicitly adds, and those must be user-initiated and degrade offline with a clear Arabic message.
R11. Never show formal Arabic muscle names (for example الدالية, المستقيمة الفخذية). Use gym slang as the primary line and the scientific English name in `<bdi dir="ltr">` as the secondary line (source of truth: `muscle-names.json`).
R12. Plural forms: use `Intl.PluralRules('ar')` with the full six-category table (zero, one, two, few 3-10, many 11-99, other 100+). No "1 تمارين" and no "4 سعرة".
R13. No raw hex colours in components. Colours come from design tokens that exist for both themes. Text must pass WCAG AA (4.5:1 normal, 3:1 large text and meaningful icons/borders).
R14. Before you finish, run the full gate suite and the existing tests. Do not report success with any red gate.

# PROCESS RULES (Task G6 Mandatory)

P1. Reproduce first. For every defect in your prompt, write a Playwright script that drives the PRODUCTION build (served through the service worker) to the exact state shown in the owner's screenshot, at 360x720 and DPR 2, and saves a screenshot to `evidence/<task>/red/<id>.png`. Open that screenshot yourself and write one sentence in the report describing what you see. If you cannot reproduce a defect, say so; do not claim it is fixed.
P2. Fix at the shared component or token, not per screen.
P3. After the fix, produce `evidence/<task>/green/<id>.png` from the same script and look at it. A defect is "fixed" only when the green screenshot shows it fixed and the gate that was red is now green.
P4. A gate that examines fewer states or elements than expected is a failing gate. Every gate prints counts and enforces minimums. Every new gate must be shown red on the pre-fix build.
P5. Register every screen, sheet, dialog and state in `src/qa/states.ts`, and add a coverage test that fails when a registered state is not run by every gate.
P6. Generic gates that must exist after this task (create them if absent): `gate-overlap` (no two visible text or interactive elements overlap unless one contains the other or the pair is explicitly marked `data-overlay`), `gate-clipping`, `gate-contrast` (pixel-sampled), `gate-raw-tokens`. Run them on every registered state at 360x720, 360x640, 412x892, font scale 1 and 1.3, light and dark.
P7. `gate-raw-tokens`: fail when a visible text node contains a snake_case identifier, a known internal enum value (none, body only, barbell, dumbbell, cable, machine, pec_sternal and every muscle id), or Latin words outside an element marked `<bdi dir="ltr">` that is an intended English name. Print the number of text nodes examined.
P8. Test the real interaction, not only the logic: type into the real inputs, tap the real buttons, assert on the DOM and on pixels. Unit tests alone do not count for UI behaviour.
P9. Run everything on the fixture AND the owner's real data (`docs/owner-profile-dump.json`).
P10. Report honestly: "verified in emulation" unless captured on the phone via adb. List every earlier claim contradicted by evidence under "was false".

# REPORTING (every task)

Write `reports/g6-<letter>-report.md`: what changed (files), the defect table (id, red screenshot, green screenshot, gate, status), verification method, bundle delta, what you could not do and why, questions for the owner, and the "was false" list. Update `docs/STATE.md` with the status of every item in this prompt.
