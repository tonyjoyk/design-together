# Android UI Patterns & Feasibility Rules

This document teaches Claude which UI patterns are established and real on Android (Material Design 3), and which to avoid inventing. When generating wireframes, always use patterns from this guide. **Do not invent custom UI patterns.** If a layout problem can be solved with a component listed here, use it.

---

## 1. The Core Rule

> **Only use UI patterns that exist as real, implemented components in Material Design 3 or established Android conventions. If you are about to draw something that doesn't have a name from this guide, stop and use the closest real component instead.**

---

## 2. The Approved Component Library

These are the only components you should reach for. Everything else is an invention.

### Actions
| Component | Use it when |
|---|---|
| **Filled button** | Primary action on a screen. One per screen ideally. |
| **Outlined button** | Secondary action alongside a filled button. |
| **Text button** | Low-emphasis action, e.g. "Cancel", "Skip". |
| **Elevated button** | Same as filled but on colored backgrounds. |
| **FAB (Floating Action Button)** | The single most important action on a screen. |
| **Extended FAB** | FAB with a label — use when the action needs more clarity. |
| **Icon button** | Toolbar actions, toggles (e.g. bookmark, favorite). |
| **Segmented button** | Choosing between 2–5 mutually exclusive options (replaces toggle buttons). |

### Navigation
| Component | Use it when |
|---|---|
| **Top app bar** | Every screen. Contains title, back arrow, and up to 3 action icons. |
| **Bottom navigation bar** | App has 3–5 top-level destinations. Mobile only. |
| **Navigation drawer** | App has many destinations (6+) or complex hierarchy. Slides in from left. |
| **Navigation rail** | Tablet/foldable only. 3–7 destinations on left edge. |
| **Tabs** | Switching between peer-level content sections within a screen. |

### Containment
| Component | Use it when |
|---|---|
| **Card (elevated)** | Grouping related content that stands out from the background. |
| **Card (outlined)** | Grouping content with a border, no elevation. |
| **Card (filled)** | Grouping content on a tinted background. |
| **Dialog** | Interrupting the user for a focused decision or confirmation. |
| **Bottom sheet (modal)** | Contextual actions or options related to the current screen. |
| **Bottom sheet (standard)** | Supplementary content anchored to the bottom, doesn't block main content. |
| **Side sheet** | Supplementary content anchored to the right edge (tablet/desktop). |

### Communication
| Component | Use it when |
|---|---|
| **Snackbar** | Brief feedback after an action (e.g. "Item deleted"). One at a time. |
| **Badge** | Notification count on an icon. |
| **Progress indicator (linear)** | Loading state for a specific section or process. |
| **Progress indicator (circular)** | Loading state for a button or small area. |
| **Tooltip** | Brief label for an icon button on long press. |

### Selection
| Component | Use it when |
|---|---|
| **Checkbox** | Multi-select from a list. |
| **Radio button** | Single select from a short list (2–5 options). |
| **Switch** | Toggling a single setting on/off. |
| **Slider** | Selecting a value from a continuous range (e.g. volume, risk score). |
| **Date picker** | Selecting a date. Use the native Android date picker — don't invent one. |
| **Time picker** | Selecting a time. Use the native Android time picker. |
| **Chip (filter)** | Filtering a list. Multiple can be active at once. |
| **Chip (input)** | Representing a user-entered value (e.g. a tag). |
| **Chip (assist)** | Suggesting a smart action. |
| **Chip (suggestion)** | Offering AI-generated or predicted content. |

### Text Input
| Component | Use it when |
|---|---|
| **Text field (filled)** | Standard form input on a white/light background. |
| **Text field (outlined)** | Standard form input — more emphasis, used in this app's style. |
| **Search bar** | Searching within a screen or the whole app. |
| **Search view** | Expanded search with results inline. |

### Lists
| Component | Use it when |
|---|---|
| **List item (1-line)** | Simple item with just a label. |
| **List item (2-line)** | Item with a label and supporting text. |
| **List item (3-line)** | Item with a label, supporting text, and metadata. |

---

## 3. Navigation Rules

### Bottom navigation bar
- Use for **3–5 top-level destinations** of equal importance.
- Each destination needs an icon. Label is shown for active item (and all items if only 3).
- Height: 56dp. Minimum touch target per item: 48×48dp.
- ❌ Do not use for more than 5 destinations.
- ❌ Do not mix with tabs on the same screen — confusing.
- ❌ Do not use for actions (e.g. "Add", "Submit") — use a FAB instead.

### Top app bar
- Always present. Contains: back/menu icon (left), screen title (center or left), actions (right, max 3 icons).
- ❌ Do not put more than 3 action icons in the top bar — use overflow menu (⋮) for extras.
- ❌ Do not put primary actions here — use a FAB or bottom button instead.

### FAB (Floating Action Button)
- Represents **one primary action** per screen.
- Positioned bottom-right (standard) or bottom-center for full-width CTAs.
- ❌ Do not show more than one FAB per screen.
- ❌ Do not use FAB for destructive actions (delete, remove).
- ❌ Do not use FAB for navigation.

### Tabs
- Use for switching between **peer-level sections** within a single screen (e.g. "Overview / History / Settings").
- Maximum **5 tabs**. Prefer 2–3.
- ❌ Do not use tabs for top-level app navigation — use bottom nav instead.
- ❌ Do not nest tabs inside tabs.

---

## 4. Layout Rules for Mobile Screens

### Single-column forms
- All forms on mobile use a **single-column layout**.
- ❌ Do not place two input fields side by side unless they are tightly related and short (e.g. "First name" / "Last name").

### Content width
- Cards and content blocks have **16–18dp horizontal margins** on each side.
- ❌ Do not stretch content edge-to-edge (no margins) except for full-bleed media or nav bars.

### Touch targets
- Every tappable element must be at least **48×48dp**.
- Buttons minimum height: **36–48dp**.
- ❌ Do not create rows of small tappable items stacked tightly — users will miss-tap.

### Scrolling
- Long content scrolls vertically. One scroll direction per screen.
- ❌ Do not create horizontally scrolling lists unless it is a media carousel.
- ❌ Do not nest a scrollable list inside a scrollable screen without a fixed height container.

### Columns
- Mobile (compact, <600dp): **1 column** for content, 2 columns maximum for grids (e.g. image thumbnails).
- ❌ Do not use 3-column layouts on a mobile screen.

---

## 5. Dialog Rules

- Use dialogs sparingly — they interrupt the user.
- A dialog has: optional icon, title, optional body text, and **1–2 action buttons**.
- Button labels: affirmative action on the right, dismissive ("Cancel") on the left.
- ❌ Do not put more than 2 actions in a dialog. If you need more, use a bottom sheet or a new screen.
- ❌ Do not put complex forms inside a dialog. Use a full-screen dialog or navigate to a new screen.
- ❌ Do not stack multiple dialogs.

---

## 6. Card Rules

- Cards group **related content** that belongs together.
- A card is either **elevated**, **outlined**, or **filled** — pick one style consistently.
- Cards can be tapped to navigate or expand.
- ❌ Do not nest cards inside cards.
- ❌ Do not use a card just to add a background color to a section — use a list item or a section header instead.

---

## 7. Bottom Sheet Rules

- **Modal bottom sheet**: Slides up and blocks the background. Use for contextual actions (e.g. "Share options", "Sort by").
- **Standard bottom sheet**: Visible alongside main content. Rare on mobile.
- ❌ Do not put a full form inside a modal bottom sheet — use a full-screen dialog instead.
- ❌ Do not use a bottom sheet for navigation — use bottom nav or a drawer.

---

## 8. Snackbar Rules

- Shows **brief, auto-dismissing feedback** after an action.
- One optional action button (e.g. "Undo").
- ❌ Do not stack snackbars — show one at a time.
- ❌ Do not use snackbars for errors that require action — use a dialog or inline error instead.
- ❌ Do not use snackbars for persistent information.

---

## 9. Selection Component Rules

### Switches vs Checkboxes vs Radio buttons
- **Switch**: A single independent on/off setting (e.g. "Enable notifications").
- **Checkbox**: Multiple items that can each be independently selected.
- **Radio button**: Exactly one choice from a small set of mutually exclusive options.
- ❌ Do not use a switch where the result isn't immediate — if it requires "Save", use a checkbox.
- ❌ Do not use radio buttons for more than 5 options — use a dropdown/exposed menu instead.

### Date & Time pickers
- Always use the **native Android date/time picker pattern** — do not invent a custom one.
- Date picker shows a calendar modal or an input field, not a custom scroll wheel.

---

## 10. Common Anti-Patterns to Avoid

These are invented patterns Claude should never generate:

| ❌ Anti-pattern | ✅ Use instead |
|---|---|
| Custom radial/circular menu | FAB + bottom sheet with actions |
| Horizontal scrolling tab row with 8+ tabs | 3–5 tabs + overflow, or switch to bottom nav |
| Floating card stack / stacked deck UI | Standard list or ViewPager |
| Multi-column form on mobile | Single-column form |
| Inline dropdown inside a card header | Exposed dropdown menu or separate field |
| Action buttons in the top app bar (primary CTA) | FAB or bottom button bar |
| Full-screen overlay for a simple confirmation | Dialog (2 buttons) |
| Custom date scroll wheel | Native date picker dialog |
| Nested scrollable lists | Single scroll with expandable sections |
| Side-by-side primary action buttons (2 full-width) | One primary (filled), one secondary (outlined or text) |
| Progress bar used as a risk gauge | Slider (read-only) or segmented bar with a labeled tick mark |
| Custom toggle group with 6+ options | Exposed dropdown menu or radio buttons in a dialog |

---

## 11. Information Hierarchy Rules

- **One primary action per screen.** The most important thing the user should do should be visually dominant. Everything else is secondary.
- **Progressive disclosure.** Don't show everything at once. Use expandable sections, "Show more", or navigation to a detail screen for secondary content.
- **Section headers** should label groups of related content — not every individual item needs a header.
- **Empty states** must tell the user what's missing and what to do about it (e.g. "No medicines added — tap + to add one").
- **Error states** must be inline, next to the field that caused the error — not at the top of the screen in a banner unless it's a system-level error.

---

## 12. Screen-Level Patterns

These are the established screen templates for Android apps. Use these compositions:

### List screen
```
[Top app bar] — title, optional search icon, optional filter icon
[Optional filter chips] — horizontal scroll row
[List of items] — scrollable, each item is a 1–3 line list item or card
[FAB] — bottom right, for the primary add/create action
```

### Detail screen
```
[Top app bar] — back arrow, title, optional action icons (edit, share, ⋮)
[Optional subheader] — contextual info band (name, status, location)
[Content sections] — cards or list items grouped by category
[Primary CTA] — full-width button or FAB pinned at bottom
```

### Form / Edit screen
```
[Top app bar] — back/close (left), screen title (center), optional "Save" text button (right)
[Single-column form fields] — labeled inputs, one per row
[Section dividers] — to group related fields
[Primary CTA] — full-width "Save" or "Submit" button at bottom
```

### Settings screen
```
[Top app bar] — back arrow, "Settings" title
[Section headers] — plain text labels grouping related settings
[List items with controls] — label on left, switch/checkbox/value on right
```

### Empty / Onboarding screen
```
[Illustration placeholder] — centered image area
[Headline] — short, explains the purpose
[Body text] — brief description
[Primary button] — single CTA centered
```

---

## 13. Quick Feasibility Checklist

Before finalising any wireframe, check:

- [ ] Every navigation pattern matches a real M3 component
- [ ] Bottom nav has 3–5 items, not more
- [ ] Only 1 FAB on the screen
- [ ] Dialogs have max 2 buttons
- [ ] Forms are single-column
- [ ] No custom date/time pickers — use native
- [ ] All touch targets are visually at least 48dp tall
- [ ] No nested scrolling
- [ ] No 3-column layouts on mobile
- [ ] No invented toggle/selector patterns — use switch, checkbox, radio, or segmented button
- [ ] Empty states have a message and an action
- [ ] Errors are inline, next to the relevant field
