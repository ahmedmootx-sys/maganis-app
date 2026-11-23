# Bunyan / Maganis Project Instructions & Rules

Always follow the project operating rules in `docs/OPERATING-RULES.md`.

## Key Mobile & Layout Invariants (Rule R15)
- **Anti-Stacking on Mobile Viewports (360px - 390px):**
  - Never squeeze titles: Any card header must give the title at least 65% of card width on 360px viewports. Action buttons must occupy a dedicated row below the title or be placed in a fixed-width trailing container.
  - Line-clamp safety: Never nest `flex-wrap: wrap` inside an element styled with `display: -webkit-box` / `-webkit-box-orient: vertical`.
  - Arabic title wrapping: Primary item titles must allow 2 lines of wrap (`-webkit-line-clamp: 2`, `line-height: 1.35`, `word-break: break-word`). Never apply single-line `white-space: nowrap` to primary entity names.
  - Badge & Marks flow: Wrappers containing title text and badges (`ExerciseMarks`) must use `display: inline` to preserve native bidirectional text wrap.
  - Clean in-session contexts: In fast-paced tracking views (e.g. active workout sessions, set loggers), never render multi-line bibliographic citations or academic sources directly in the set card; use `showSource={false}` or a collapsible sheet.
  - Gate enforcement: `scripts/check-ui.mjs` must inspect text node bounding boxes at 360x780 DPR 2 to guarantee zero overlapping text boxes (`gate-overlap`).
