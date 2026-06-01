# Wireframe Generation Style Guide

This document teaches Claude how to generate lo-fi UI wireframes as inline SVGs, based on a specific wireframing kit and visual style. Always follow these rules when asked to create a wireframe, mockup, or screen layout.

---

## 1. Output Format

- Always output wireframes as **inline SVG** rendered directly in chat.
- Do **not** use HTML, React, or Canvas unless explicitly asked.
- The SVG must be self-contained — no external fonts, no external images.
- Use `viewBox` to define dimensions; always include `role="img"` with a `<title>` and `<desc>`.

```svg
<svg viewBox="0 0 320 680" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:340px;display:block;margin:0 auto;">
  <title>Screen name wireframe</title>
  <desc>Brief description of what is shown</desc>
  ...
</svg>
```

---

## 2. Philosophy & Aesthetic

This is a **lo-fi wireframe** style — not a polished UI mockup. The goal is to communicate layout and structure, not final visual design.

- **No gradients, no drop shadows, no blur effects**
- **No photos or realistic images** — use placeholder boxes with an X drawn through them for images
- **No color fills for decorative purposes** — color is used only to communicate state or hierarchy
- **Clean, straight lines only** — no hand-drawn roughness (roughness = 0 in Excalidraw terms)
- **Minimal text** — use placeholder labels like "Title Text", "Body Text", "Input Field Text"
- Think of it as a **blueprint**, not a design

---

## 3. Color Palette

Use only this palette. Do not introduce other colors.

| Role | Hex | Usage |
|------|-----|-------|
| Dark gray (primary) | `#495057` | Nav bars, borders, input strokes, icons, section labels |
| Medium gray | `#868e96` | Image placeholders, subheaders, filled header bars |
| Light gray (fill) | `#ced4da` | Chart fills, image placeholder fills, skeleton content |
| Very light gray | `#efefef` | Alert/notification backgrounds |
| Off-white | `#c8c8c8` | Secondary fills, checkbox fills, tag backgrounds |
| White | `#ffffff` | Card backgrounds, content areas |
| Black | `#000000` | Primary text, phone frames, borders |
| Green (primary action) | `#40c057` | Primary buttons, CTAs |
| Teal (success/active) | `#12b886` | Success state, active tab indicator, active toggle |
| Red (error) | `#c92a2a` | Error borders, error text, destructive alerts |
| Dark green (success) | `#2b8a3e` | Success borders, success input state |
| Muted red (error text) | `#fa5252` | Error state fills |

### Color usage rules:
- **Default button**: white fill, `#000` or `#495057` stroke
- **Primary button**: `#40c057` fill, `#495057` stroke, black text
- **Destructive/error**: `#c92a2a` stroke, `#efefef` fill
- **Success**: `#2b8a3e` stroke, `#efefef` fill
- **Active nav/tab item**: `#12b886` underline or accent
- **Section headers with fill**: `#495057` or `#868e96` fill, white text
- **Input fields**: transparent fill, `#495057` stroke

---

## 4. Typography

- **Font**: Use `font-family="sans-serif"` in SVG — no external fonts
- **Font sizes** (SVG px units):

| Level | Size | Usage |
|-------|------|-------|
| Screen title / hero | 20–24px | Page-level headings |
| Section label | 11–13px bold | Card section headers (e.g. "MEDICINES") |
| Body / list items | 10–12px | Regular content text |
| Small / helper | 9–10px | Timestamps, helper text, badges |
| Placeholder label | 10–12px, muted | "No items added", "Input Field Text" |

- Use `font-weight="bold"` only for section titles and primary labels
- Placeholder/empty-state text uses `fill="#adb5bd"` (muted)
- ALL CAPS only for nav actions (EDIT, SAVE, CHANGE) and section headers in the app style shown

---

## 5. Stroke & Line Rules

- **Default stroke width**: `stroke-width="1"` or `stroke-width="0.75"` for card borders
- **Frame/phone outline**: `stroke-width="1.5"`
- All shapes use `stroke-linecap="round"` where applicable
- Divider lines inside cards: `stroke="#e0e0e0"` `stroke-width="0.5"`
- No dashed lines unless representing a dotted border state

---

## 6. Component Patterns

### 6a. Phone Frame
Use for mobile screens. Standard dimensions: **320×680** viewBox.

```
- Outer rect: x=10 y=10 w=300 h=660 rx=18, fill=white, stroke=#000, stroke-width=1.5
- Status bar: x=10 y=10 w=300 h=22 rx=18, fill=#ced4da
- Status text left: "9:41" at font-size=9
- Status text right: "WiFi  Batt" at font-size=9
- Content starts at y=32
```

### 6b. Navigation Bar (Top)
```
- rect: full width, h=44, fill=#495057
- Back arrow: two lines forming a left-pointing chevron, stroke=white
- Title text: centered, fill=white, font-size=13, font-weight=bold
- Action button (e.g. EDIT): small rect outline in white, text inside
```

### 6c. Subheader / Patient Info Band
A darker colored band below the nav for contextual info:
```
- rect: full width, h=44-52, fill=#868e96
- Primary label: font-size=13, fill=white, font-weight=bold
- Secondary label: font-size=10, fill=#ced4da
```

### 6d. Section Card
The core repeating unit. Used for Medicines, Blood Pressure, Diabetes, etc.

```
- rect: mx=18, w=284, h=varies (min 60), rx=4, fill=white, stroke=#c8c8c8, stroke-width=0.75
- Section header row (inside card, top):
    - Circle (+) icon: cx=35 from card left, r=10, fill=#495057
    - "+" text inside circle: fill=white, font-size=12, centered
    - Section title: x=54 from card left, font-size=11, fill=#495057, font-weight=bold, ALL CAPS
- Divider line after header: full card width, stroke=#e0e0e0, stroke-width=0.5
- Empty state text: centered, font-size=10, fill=#adb5bd — e.g. "No medicines added"
- Content rows: font-size=10-11, fill=#495057
```

### 6e. Simple Info Card (no + header)
For non-expandable sections like "Assigned facility":
```
- rect: mx=18, w=284, h=52, rx=4, fill=white, stroke=#c8c8c8, stroke-width=0.75
- Label (bold): x=28, font-size=11, fill=#000, font-weight=bold
- Action link (right-aligned): font-size=10, fill=#495057 — e.g. "CHANGE"
- Value: x=28, font-size=10, fill=#495057, second line
```

### 6f. Buttons

**Default button:**
```
- rect: w=130, h=42, rx=2, fill=transparent, stroke=#000, stroke-width=1
- text: centered inside, font-size=12, fill=#000
```

**Primary button:**
```
- rect: w=130, h=42, rx=2, fill=#40c057, stroke=#495057, stroke-width=1
- text: centered inside, font-size=12, fill=#000
```

**Full-width CTA (e.g. SAVE bar):**
```
- rect: x=10 (full width to 310), h=43, rx=18 (only top or bottom corners as appropriate), fill=#495057
- Checkmark icon: two lines, stroke=white, stroke-width=1.5
- Text: centered, font-size=12, fill=white, font-weight=bold
```

**Toggle buttons (Yes/No):**
```
- Active: rect rx=3, fill=#495057, text fill=white
- Inactive: rect rx=3, fill=none, stroke=#c8c8c8, text fill=#adb5bd
```

### 6g. Input Fields

```
- rect: w=276, h=42, fill=transparent, stroke=#495057, stroke-width=1
- Label text above: font-size=12, fill=#000
- Placeholder text inside: font-size=12, fill=#495057
- Helper/error text below: font-size=9-10

States:
- Default: stroke=#495057
- Error: stroke=#c92a2a, error text fill=#c92a2a, ! icon circle
- Success: stroke=#2b8a3e, success text fill=#2b8a3e, checkmark icon
```

### 6h. Image Placeholder
```
- rect: desired size, fill=#ced4da, stroke=#000
- Two diagonal lines crossing corner-to-corner (X pattern): stroke=#383838
```

### 6i. Risk / Progress Bar
```
- Background rect: full width, h=8, rx=4, fill=#ced4da
- Filled segment: partial width rect, rx=4, fill=#868e96 (or segment fills for gradient effect)
- Indicator tick: narrow rect h=14, fill=#000, positioned at value point
- Badge: rx=10 (pill shape), fill=#868e96, white text, font-size=9
```

### 6j. Alerts / Toasts
```
- rect: full width, h=42, rx=2
  - Info: stroke=#495057, fill=#efefef
  - Success: stroke=#2b8a3e, fill=#efefef
  - Error: stroke=#c92a2a, fill=#efefef
- Icon circle: ellipse w=23 h=23, stroke matches type
  - Info: "i" text
  - Error: "!" text
  - Success: checkmark lines
- Message text: font-size=12, fill=#000 (info) / #087f5b (success) / #c92a2a (error)
- Close icon: two crossing lines, stroke=#495057
```

### 6k. Checkboxes
```
- Unchecked: rect w=23 h=23, stroke=#495057, fill=transparent
- Checked: rect w=23 h=23, stroke=#495057, fill=#ced4da, with checkmark lines inside
- Label text: x=32 from checkbox, font-size=12, fill=#495057
```

### 6l. Dropdowns / Select
```
- rect: w=163, h=101, fill=transparent, stroke=#495057
- Options as text rows inside: font-size=12, fill=#000
- Chevron arrow: small line pair at right edge
```

### 6m. Tabs (horizontal)
```
- Active tab: text fill=#000, underline stroke=#12b886, stroke-width=2
- Inactive tabs: text fill=#495057, no underline
- Separator line: full width, stroke=#495057, stroke-width=0.5
```

### 6n. Navigation / Sidebar
```
- Active item: rect fill=#ced4da, stroke=#999999, text fill=#000 font-weight=bold
- Default item: no fill, text fill=#495057
```

### 6o. Search Bar
```
- rect: full width, h=39, rx=4, fill=transparent, stroke=#999999
- Search icon (circle + line): ellipse + line, fill=#c8c8c8
- Placeholder text: "Search here...", font-size=12, fill=#495057
```

### 6p. Tags / Chips
```
- rect: w=auto, h=34, rx=4, fill=#ced4da, stroke=#495057
- Label: centered text, font-size=12, fill=#000
- Chevron: small arrow lines at right
```

---

## 7. Layout & Spacing

- **Horizontal margins**: cards start at x=18, width=284 (leaving 18px on each side within the 320px frame)
- **Vertical gap between cards**: 8–10px
- **Internal card padding**: 10–14px from card edges to content
- **Section header height**: ~28px within card
- **Row height for list items**: 24–28px
- **Consistent left alignment**: primary content at x=28 (10px inside card edge)
- **Right-aligned actions**: at x=294 (text-anchor="end") or x=280-290

---

## 8. Device Frames

### Mobile (default for app screens)
- viewBox: `0 0 320 680`
- max-width: 340px
- Outer frame: rx=18

### Tablet
- viewBox: `0 0 780 525`
- Outer frame rect, no rounded corners or mild rx=8

### Desktop
- viewBox: `0 0 1145 760`
- Outer frame rect, rx=4

---

## 9. Placeholder Patterns

When content is unknown or variable, use these conventions:

| Content type | Wireframe representation |
|---|---|
| Image | `#ced4da` rect with X lines through it |
| Body text block | 2–3 horizontal `#c8c8c8` rects of varying widths |
| Avatar / profile photo | Circle, fill=`#c8c8c8` |
| Chart | Axis lines + `#ced4da` bars or line |
| Icon | Small square, fill=`#ced4da` |
| Long text | "Body Text" label in muted gray |

---

## 10. What NOT to Do

- ❌ Do not use gradients or shadows
- ❌ Do not use bright, saturated colors for decoration
- ❌ Do not render realistic icons — use simple geometric approximations or placeholder squares
- ❌ Do not write full real content — use labels like "Title Text", "Body Text", "Item 1"
- ❌ Do not use external fonts or images
- ❌ Do not add visual flourishes — this is a wireframe, not a polished UI
- ❌ Do not skip the phone frame for mobile screens

---

## 11. Example Screen Composition (Android Patient Detail)

This is the reference screen. Use it as a template for similar medical/form-heavy Android screens.

```
[Status bar]          h=22, fill=#ced4da
[Nav bar]             h=44, fill=#495057 — back arrow left, EDIT button right
[Subheader band]      h=48, fill=#868e96 — patient name bold, location muted
[Risk card]           h=66 — pill badge top-right, segmented bar, recommendation text
[Section card × N]    h=64+ each — + circle, ALL CAPS title, divider, content or empty state
[Info card × N]       h=52 each — bold label, right action, value below
[SAVE bar]            h=43, fill=#495057 — pinned to bottom, checkmark + SAVE text
```

Gap between all cards: 8px. All cards: rx=4, stroke=#c8c8c8, stroke-width=0.75.

---

## 12. Quick Reference Checklist

Before outputting a wireframe SVG, verify:

- [ ] Correct viewBox for the device type
- [ ] Phone frame present for mobile screens
- [ ] Status bar and nav bar included
- [ ] All colors from the approved palette only
- [ ] No gradients, shadows, or decorative fills
- [ ] Cards have rx=4, stroke=#c8c8c8, stroke-width=0.75
- [ ] Section headers use the + circle pattern
- [ ] Font sizes follow the typography scale
- [ ] Placeholder text for unknown content
- [ ] SAVE / primary action button at bottom if it's a form screen
