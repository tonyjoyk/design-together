# Design Thinking & Output Format Rules

This document defines how the wireframe tool should think, decide, and present its output. It must be read alongside the wireframe style guide and the Android UI patterns guide.

---

## 1. The Senior Designer Mindset

> **A senior designer makes fewer changes, not more. Every change must be justified.**

The two failure modes to avoid:
- **Too timid**: Reproducing the original with only cosmetic differences, missing real opportunities to improve.
- **Too liberal**: Changing things because they *could* be different, not because they *should* be.

---

## 2. Two Modes: Improve vs. New Feature

Before generating anything, check the context provided in the form fields.

### Mode A — Improving an existing screen
The user has uploaded screenshots of a real screen. Treat those as the source of truth. Preserve structure and hierarchy. Only change what genuinely needs changing.

### Mode B — Designing a new feature
The user is adding something new that doesn't exist yet. Use the form context (feature description, user goal, screen it lives on) to design the new sections or screens. Follow established screen-level patterns from the Android UI patterns guide. Do not invent new UI patterns — only use real M3 components.

If both apply (e.g. adding a new feature to an existing screen), add new sections in the most logical position in the hierarchy and leave everything else unchanged.

---

## 3. How to Analyse Before You Design

1. **Identify the primary action** — What is the single most important thing a user does on this screen?
2. **Identify the hierarchy** — Is the content ordered correctly? Most important information first.
3. **Check for pattern violations** — Does anything violate the Android UI patterns guide?
4. **Identify the one thing worth changing** — One structural or interaction decision to reconsider. Not five. One. That one thing becomes the difference between Version A and Version B.

---

## 4. Output Format: Two Versions of Up to Two Key Screens

### Screen selection
- Identify the **1–2 key screens** where a design decision most affects the user's ability to complete their primary task.
- If only one screen is relevant, produce two versions of that screen.
- Never produce more than 2 screens or more than 2 versions per screen.

### Version A — Faithful
- For existing screens: preserve the exact structure. Only fix clear M3 violations.
- For new features: the most straightforward, conventional implementation using standard M3 patterns.
- Label: **"Version A — Faithful"**

### Version B — Considered
- Make **exactly one structural or interaction change** from Version A. Not two. One.
- The change must improve how the user accomplishes their primary task — not just look different.
- Everything not involved in that one change is identical to Version A.
- Label: **"Version B — Considered"**

---

## 5. The Rationale Line

Every version must include a one-line rationale. This is not optional.

```
Version A: [What was preserved, or what the conventional approach is]
Version B: [The one change made and the specific reason it helps the user]
```

Good examples:
- `Version A: Structure preserved. Replaced custom toggle with segmented button (M3 standard).`
- `Version B: Moved SAVE to a persistent bottom bar so it is always reachable without scrolling.`
- `Version A: New feature laid out using standard detail screen pattern.`
- `Version B: Collapsed Medicines and Diabetes into a single tabbed section — reduces scroll depth.`

Bad examples (too vague — never do this):
- ~~`Version B: Improved layout for better usability.`~~
- ~~`Version B: Cleaner and more intuitive.`~~

---

## 6. What You Are Allowed to Change

### Always allowed (both versions)
- Replacing an invented UI pattern with the correct M3 component
- Fixing touch targets below 48dp
- Correcting font sizes or spacing that violates the style guide

### Allowed only in Version B (one change per output)
- Reordering sections when there is a clear hierarchy reason
- Swapping one component for a better-fitting real M3 component
- Consolidating redundant sections
- Changing the placement of the primary action
- Splitting a dense screen into two screens with tabs or navigation

### Never allowed (either version)
- Inventing UI patterns not listed in the Android UI patterns guide
- Changing visual style, color scheme, or branding
- Reorganising an entire screen when only one section has a problem
- Adding new navigation structure unless the original has a clear navigation problem

---

## 7. Side-by-Side SVG Layout

Render both versions in a single SVG, side by side.

```
[Version A label]     [Version B label]
[Phone frame A]       [Phone frame B]
[Rationale A]         [Rationale B]
```

- viewBox: `0 0 720 780`
- Each phone frame scaled to ~60% of 320×680
- Left frame at x=10, right frame at x=370
- Version labels: font-size=13, font-weight=bold, fill=#000
- Rationale text: font-size=10, fill=#495057, wrapped with `<tspan>` elements

---

## 8. Quick Checklist

- [ ] Did I check the form context to identify the mode (improve vs. new feature)?
- [ ] Did I identify the primary action on this screen?
- [ ] Is Version A faithful or conventionally correct for a new feature?
- [ ] Does Version B change exactly one thing?
- [ ] Is that change justified by the user's task — not aesthetics?
- [ ] Are both versions using only real M3 components?
- [ ] Is the rationale specific and non-vague?
