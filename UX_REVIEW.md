# UX Review: TargetScout

Reviewed against Domino Design System guidelines (ux-review skill) and the 4 Core UX Principles.

---

## Summary

The app's core layout and functionality are solid, but several issues break Domino's visual system: the input field is nearly invisible against the dark header, score bar labels use all-caps, the evidence graph panel introduces a jarring dark background that splits the UI in two, and emoji in the footer/summary bar are inconsistent with enterprise B2B design. 9 findings across High/Medium/Low.

---

## Findings

### High Severity

**1. Search input invisible against dark header**
The input uses a dark fill (`#3A3A4E`) inside the `#2E2E38` header — nearly zero contrast. Users can barely see where to type. The placeholder text disappears. Per Domino's "Increase User Confidence" principle, the field must be clearly legible.
→ Fix: Use a white/light input (`background: #fff, color: #2E2E38`) or a noticeably lighter border (`#8080A0`) with light placeholder text. The current inline style override on the Input component is fighting the parent dark background.

**2. "DISEASE ASSOC" label wraps to 2 lines in every row**
The 76px label container can't fit "DISEASE ASSOC" in one line, so it wraps. Every row then has uneven vertical spacing. This is a layout-breaking typography issue.
→ Fix: Shorten labels to "Assoc.", "Tract.", "Novelty" (or use abbreviations with a tooltip) OR widen the label container to 90px.

**3. Narrative truncation has no affordance**
Narratives are hard-truncated at 180 characters with "…" but there's no "Read more" link or visual cue that the card is clickable to see the rest. Users won't know to click the row. Violates "Pave a Smooth Path" — no dead end guidance.
→ Fix: Add a `Read more →` tertiary-style link after the truncated text. The click target should already be the whole row, but the affordance needs to be visible.

---

### Medium Severity

**4. All-caps score labels violate Domino typography rules**
"DISEASE ASSOC", "TRACTABILITY", "NOVELTY" are all uppercase. Domino uses sentence case for all labels. All-caps also reduces legibility at small sizes (10-11px).
→ Fix: Use `text-transform: none` and sentence case: "Disease assoc", "Tractability", "Novelty".

**5. Evidence graph background creates a jarring dark/light split**
The target list panel is white; the evidence graph panel is `#1A1A2E` (very dark navy). This creates a visually harsh break down the middle of the UI. Domino's design system uses consistent light UI backgrounds with subtle border differentiation.
→ Fix: Change the graph panel to `#F0F0F8` or `#FAFAFA` with a subtle `#E0E0F0` border. Update node/edge colors for visibility on light background. Keep node fill colors — just lighten the canvas.

**6. "Demo Data" toggle has no explanation or tooltip**
The toggle is labeled "Demo Data" but there's nothing explaining what happens when it's toggled off, whether live data is slower, or whether it requires platform access. Violates "Increase User Confidence."
→ Fix: Add a `Tooltip` with text like: "Demo Data uses built-in mock data. Toggle off to query Open Targets + ClinicalTrials.gov live (requires network access)." Also show a brief state label: "Demo" vs "Live".

**7. Primary button color deviates from Domino's button token**
The "Find Targets" button uses `#543FDE` (Domino brand purple). Domino's button spec calls for `#3B3BD3` (Primary Blue) for solid primary buttons. While close, this inconsistency would be flagged in a design review.
→ Fix: Update `colorPrimary` in the ConfigProvider theme to `#3B3BD3`.

**8. Emoji used in summary bar and footer badges**
🔬 in the summary bar and 🗄 🤖 ⚡ 🌐 🔄 in the footer primitives badges are not part of Domino's design system. They read as playful/consumer, inconsistent with enterprise B2B.
→ Fix: Remove emoji from the summary bar icon. For the footer, use plain text separators: "Data Sources · Model Endpoint · Agent Orchestration · App Hosting · Scheduled Refresh" — the current `primitives-item` + separator pattern from the skill already supports this.

**9. Panel title font too small relative to Domino type scale**
Panel titles ("Top 10 Target Hypotheses", "Evidence Graph") use 13px/600. Per Domino's typography scale, card titles should be H4 at 16px.
→ Fix: Bump `.panel-title` to `font-size: 15px` (split the difference — 16px may be too large for a sub-panel label, but 13px is below caption level).

---

### Low Severity

**10. Composite score floats to far right with no column header**
The composite score (9.2, 8.7…) is right-aligned at the row edge. There's no column header labeling it as "Score" or "Composite". A new user seeing 9.2 in green has no anchor for what it represents without reading closely.
→ Fix: Add a micro-label "Composite" above the score in the first row, or add a column header at the top of the list. A thin `Tooltip` on the score number explaining it is the weighted composite.

**11. Score bar track background too light to distinguish from white row**
The score bar track (`#F0F0F4`) on a white row background has very low contrast. On a laptop in a bright room, the "empty" portion of each bar is nearly invisible.
→ Fix: Darken the track to `#E0E0E8`.

**12. Autocomplete dropdown blocks the summary bar**
When typing in the search field, the autocomplete dropdown overlaps the summary bar from a previous search. The dropdown is z-indexed above content that the user may want to read while choosing.
→ Fix: Clear the summary bar when the user starts typing a new query (`setInputDisease` handler should also `setSummary('')`).

---

## What's Working Well

- **Two-panel layout** with a clear left/right split for the ranked list and evidence graph is the right UX pattern for this use case — information-dense without being overwhelming.
- **Skeleton loading with streaming narratives** is exactly the right pattern for a demo app. The staggered 650ms fade-in creates the "system working for me" feel the brief calls for.
- **Detail drawer** correctly overlays the main content rather than pushing/crushing it. The four score cards at the top of the drawer make scores immediately scannable.
- **D3 force graph** is well-executed: correct node sizing hierarchy, edge thickness encoding association score, color-coded by datatype. Click-to-select with glow highlight works.
- **Primitives footer** is well-placed and appropriately subtle — low visual weight but legible from a distance.
- **Empty state** correctly answers What / Why / What to do with the three-line description.
- **Evidence Breakdown score bars** in the drawer are a strong pattern — they give the same visual language as the row bars but with more detail.
- **ClinicalTrials.gov cards** in the drawer are clean: NCT ID in monospace, phase and status as color-coded tags, sponsor name in subdued gray.
