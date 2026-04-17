# Domino App UX Reference

Cross-reference guide for evaluating screen designs against Domino's design system and UX principles.

---

## 4 Core UX Principles

| Principle | Test question |
|-----------|--------------|
| **Pave a Smooth Path** | Is it obvious what to do next? Are there any dead ends? |
| **Increase User Confidence** | Are errors human-readable with resolution steps? Are disabled states explained? |
| **Reduce Effort to Value** | Are smart defaults used? Is cognitive load minimized per step? |
| **Adapt to Repeat Users** | Does the design reward familiarity? Can experienced users move fast? |

---

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Text / Heading | `#3F4547` | Headings, labels, primary text |
| Text / Body | `#7F8385` | Body copy, descriptions |
| Primary Blue | `#3B3BD3` | Primary buttons, active elements |
| On Primary | `#FFFFFF` | Text on primary backgrounds |
| Secondary Surface | `#EDECFB` | Secondary button bg |
| Secondary Border | `#C9C5F2` | Secondary button border |
| Secondary Text | `#1820A0` | Secondary button text |
| Container Border | `#DBE4E8` | Card borders, dividers |

---

## Button Hierarchy

| Type | Style | Use for |
|------|-------|---------|
| **Primary** | Solid `#3B3BD3` bg, white text | Single main action per view |
| **Secondary** | `#EDECFB` bg, `#C9C5F2` border, `#1820A0` text | Important non-primary (Cancel, Export) |
| **Tertiary** | Text-only `#3B3BD3`, no border | Lower-emphasis (Reset, Clear filters) |
| **Link** | Link-styled `#3B3BD3` | Navigation (View docs, Learn more) |

**Anti-patterns:** Two Primary buttons side-by-side · Cancel as Primary · All buttons same style

---

## Typography Scale

| Level | Size | Use |
|-------|------|-----|
| H1 | 32px | Page titles |
| H2 | 26px | Section headers |
| H3 | 20px | Subsection headers |
| H4 | 16px | Card titles, labels |
| Body | 14–16px | Primary content |
| Caption | 12px | Helper text, metadata |
| Small | 11px | Fine print, timestamps |

- **Always sentence case** — exception: Domino proper nouns (Workspace, Model API, Artifacts)
- No all-caps labels
- Start CTAs with a verb ("Save", "Delete", "Export")
- Be specific: "Delete project" not "Delete"

---

## Spacing — 1:2 Ratio Rule

Space **within** a group ≈ half the space **between** groups.

- Apply to: content panels, forms, cards with multiple sections
- Do NOT apply to: data tables (uniform row spacing is correct), navigation menus, homogeneous lists

---

## Layout Checklist

- [ ] Side panels **overlay** content, not push/crush it
- [ ] Tables have adequate width — not compressed by adjacent panels
- [ ] Visual hierarchy is clear at a glance
- [ ] Layout reviewed at laptop width AND wide monitor width
- [ ] Consistent light UI background — no jarring dark/light splits between panels

---

## Tables & Data Checklist

- [ ] Truncated text has tooltips (verify in running app, not just screenshot)
- [ ] Only necessary columns shown
- [ ] Rows are visually distinguishable
- [ ] Numbers right-aligned, text left-aligned

---

## Interactive Elements Checklist

- [ ] Icon-only buttons have tooltips (verify in running app)
- [ ] Exactly **one** Primary button per view or modal
- [ ] All other buttons styled Secondary or Tertiary as appropriate
- [ ] Disabled states have a visible explanation
- [ ] Touch targets ≥ 24×24px (desktop), ≥ 44×44px (touch)
- [ ] Actions positioned near related content (Fitts's Law)

---

## Empty & Error States Checklist

Every empty state must answer all three:

1. **What is this?**
2. **Why is it empty?**
3. **What can the user do?**

| Bad | Good |
|-----|------|
| "No tags" | "No tags yet — Tags help organize jobs. [+ Add tag]" |
| (blank table) | "No jobs found. [Run a job] or adjust filters." |

- [ ] System errors are human-readable with guidance
- [ ] User code output (stderr, tracebacks) shown raw in monospace

---

## Forms Checklist

- [ ] Labels above fields, not placeholder-as-label
- [ ] Optional fields clearly marked
- [ ] Validation on blur, not every keystroke
- [ ] Code inputs have placeholder guidance
- [ ] Checkboxes/toggles use positive framing (checked = feature enabled)

---

## Detail Panels

Prefer **overlay drawers** for table row detail — main content stays full width. If push panels are used, enforce minimum widths so tables remain readable.

---

## UX Writing Quick Reference

- Sentence case everywhere ("Filter by date" not "Filter by Date")
- Domino proper nouns capitalize: Workspace, Model API, Artifacts, Project
- Numerals for numbers: "3 items" not "three items"
- No exclamation points
- Contractions are fine for conversational tone
- No emoji in enterprise UI

---

## Severity Guide (for review notes)

| Severity | Definition |
|----------|------------|
| **High** | Blocks a user goal or causes significant confusion |
| **Medium** | Slows users or reduces confidence |
| **Low** | Minor polish, spacing, copy |

---

## What Not to Flag

- Raw monospace output for user-generated code or logs
- Uniform row spacing in data tables
- Dense displays for technical/power users
