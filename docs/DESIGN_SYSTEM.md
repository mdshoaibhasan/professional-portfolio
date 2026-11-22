# Design System

Status: **Approved 2026-11-23 (Milestone 2).** Visual preview: open [design/preview.html](design/preview.html) in a browser.
Tokens here become the Tailwind CSS v4 `@theme` in Milestone 3. Components must use tokens, never raw hex values.

---

## 1. Direction — "Engineering Spec × Studio"

Concept: the precision of an engineering spec sheet, presented with the confidence of an editorial studio.
It reads **developer first** (structured, factual, verifiable), with studio polish (big type, generous space, one
controlled glow).

### Signature elements (what makes it not-a-template)
1. **Spec-sheet metadata** — JetBrains Mono key/value lists (`STACK`, `ROLE`, `STATUS`) on projects and services,
   instead of skill bars or vague badges. Mirrors how engineers read information.
2. **Numbered section labels** — `01 / Selected work`, `02 / Services` in mono caps; gives rhythm and navigability.
3. **Hairline grid** — a faint 12-column guide pattern behind the hero, faded out with a radial mask (opacity ≤ 5%).
4. **One glow rule** — exactly one soft primary→violet radial glow per page, behind the focal element (hero project card).
   No gradient text, no gradient buttons, no glass panels.
5. **Status chip** — `● Available for freelance work` with a gently pulsing dot (static under reduced motion).
6. **Primary vs secondary service hierarchy built into layout** — development services get full cards; social-media
   services appear in a compact "Also offered" row. The identity hierarchy is visible, not just written.

### Alternative considered — "Editorial Studio"
Oversized display type, asymmetric layout, fewer structural details, more photography. Feels more "agency", less
"engineer". Shown as Concept B in the preview. **Recommendation: Concept A (Engineering Spec)** because the primary
goal is credibility as a software developer; B can borrow its larger type on the About page.

## 2. Color tokens

All ratios computed with the WCAG 2.x formula (not estimated). Thresholds: body text ≥ 4.5, large text (≥ 24 px or
≥ 18.66 px bold) and UI component boundaries ≥ 3.0.

| Token | Hex | Role | on `bg` | on `surface` | on `raised` | Verdict |
|---|---|---|---|---|---|---|
| `bg` (code: `canvas`) | `#080D18` | Page background | — | — | — | |
| `surface` | `#111827` | Cards, sections | — | — | — | |
| `surface-raised` | `#172033` | Hover cards, menus, inputs | — | — | — | |
| `text` | `#F8FAFC` | Headings, body | 18.57 | 16.96 | 15.55 | ✅ AAA |
| `text-secondary` | `#CBD5E1` | Long-form body copy | 13.08 | 11.95 | 10.96 | ✅ AAA |
| `muted` | `#94A3B8` | Meta, captions, labels | 7.58 | 6.92 | 6.34 | ✅ AA+ |
| `subtle` | `#64748B` | Decorative only; **form-field borders** | 4.08 | 3.73 | 3.42 | ⚠️ not for text; ✅ as UI boundary |
| `primary` | `#2563EB` | Button fills, active indicators | 3.76 | 3.43 | 3.15 | ❌ text · ✅ fill/boundary |
| `primary-hover` | `#1D4ED8` | Button hover fill | — | — | — | white on it 6.70 ✅ |
| `primary-text` | `#60A5FA` | Links, interactive text | 7.64 | 6.98 | 6.40 | ✅ |
| `accent` | `#8B5CF6` | Glow, decorative highlights | 4.59 | 4.19 | 3.84 | ⚠️ decorative / large only |
| `accent-strong` | `#7C3AED` | Violet fill *with* white text | — | — | — | white on it 5.70 ✅ |
| `accent-text` | `#A78BFA` | Violet text accents (e.g. mono labels) | 7.14 | 6.52 | 5.98 | ✅ |
| `success` | `#34D399` | Success text/icons | 10.10 | 9.23 | 8.46 | ✅ |
| `warning` | `#FBBF24` | Warning text/icons | 11.64 | 10.63 | 9.75 | ✅ |
| `error` | `#F87171` | Error text/icons | 7.02 | 6.41 | 5.88 | ✅ |
| `focus` | `#93C5FD` | Focus ring | 10.77 | 9.84 | 9.02 | ✅ |
| `border` | `#1F2A3D` | Decorative card/section dividers | 1.35 | — | — | decorative only |
| `border-strong` | `#334155` | Hover borders, separators | 1.88 | — | — | decorative only |

Button text: white on `primary` = **5.17** ✅. White on `accent` (#8B5CF6) = 4.23 ❌ → use `accent-strong`.

Rules
- Links are `primary-text` and underlined on hover/focus; in body copy they're underlined always.
- Never convey meaning with color alone (errors get icon + text).
- Form inputs: background `surface-raised`, border `subtle` (meets 3:1), focus ring `focus`.

## 3. Typography

| Family | Use | Weights |
|---|---|---|
| **Space Grotesk** | Display, headings, nav, buttons | 500, 600, 700 |
| **Inter** | Body, UI text, forms | 400, 500, 600 |
| **JetBrains Mono** | Section labels, spec sheets, code, tags | 400, 500 |

Self-hosted variable fonts (D-010), `font-display: swap`, preload only the hero heading + body weights.
Fallbacks: `ui-sans-serif, system-ui, sans-serif` / `ui-monospace, monospace`.

Fluid scale (clamp between 360 px and 1280 px viewports):

| Token | Size | Line height | Tracking | Family |
|---|---|---|---|---|
| `display` | `clamp(2.75rem, 1.6rem + 4.8vw, 5rem)` | 1.02 | -0.035em | Space Grotesk 600 |
| `h1` | `clamp(2.25rem, 1.6rem + 2.8vw, 3.5rem)` | 1.08 | -0.03em | Space Grotesk 600 |
| `h2` | `clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)` | 1.15 | -0.02em | Space Grotesk 600 |
| `h3` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` | 1.3 | -0.01em | Space Grotesk 600 |
| `body-lg` | `1.125rem` | 1.7 | 0 | Inter 400 |
| `body` | `1rem` | 1.65 | 0 | Inter 400 |
| `small` | `0.875rem` | 1.55 | 0 | Inter 400/500 |
| `label` | `0.75rem` | 1.4 | 0.08em, uppercase | JetBrains Mono 500 |

Rules: body max width `65ch`; one `h1` per page; headings never below 600 weight; no all-caps except `label`.

## 4. Space, layout & shape

- **Spacing:** 4 px base (Tailwind default scale). Section vertical padding `clamp(4rem, 3rem + 5vw, 8rem)`.
- **Container:** max `72rem` (1152 px) content, `80rem` for wide media; gutters `1.25rem` → `2rem` (≥ 768 px).
- **Grid:** 4 columns mobile, 8 tablet, 12 desktop; gap `1.5rem` → `2rem`.
- **Breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280` (Tailwind defaults). Design mobile-first; test at 360 px.
- **Radius:** `sm 6px` (tags, inputs), `md 10px` (buttons), `lg 16px` (cards), `xl 24px` (feature panels), `full` (chips).
- **Elevation:** dark UIs read depth from *lightness + borders*, not shadows. Level 0 `bg`; level 1 `surface` + `border`;
  level 2 `surface-raised` + `border-strong`. Real shadows only on overlays (menus, dialogs).
- **Touch targets:** ≥ 44 × 44 px.

## 5. Motion

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 150 ms | hover, color, focus |
| `duration-base` | 250 ms | menus, accordions |
| `duration-slow` | 450 ms | section entrance |
| `ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | default |

Rules
- Entrance: fade + 12 px rise, **once**, triggered at 15% visibility; stagger ≤ 60 ms; never on above-the-fold LCP text.
- No parallax, scroll-jacking, cursor followers, typing effects, or looping animations (except the status dot).
- `prefers-reduced-motion: reduce` → no transforms; opacity transitions ≤ 150 ms; status dot static.
- Motion library (`motion`) only where CSS can't do it (e.g., mobile menu presence, layout transitions).

## 6. Components (inventory & spec)

| Component | Variants / states | Notes |
|---|---|---|
| Skip link | — | First focusable element; visible on focus |
| Navbar | desktop / mobile drawer; scrolled (adds `surface` bg + border) | `aria-current="page"`; drawer traps focus, closes on Esc |
| Button | `primary` (fill), `secondary` (border), `ghost`; sizes md/lg; hover, focus, disabled, loading | Icon optional (Lucide 18 px); loading keeps width |
| Text link | inline, standalone with arrow | Underline on hover; external links get icon + `rel="noopener"` |
| Section header | label (`01 / …`) + h2 + optional intro | |
| Status chip | available / unavailable | Wording from profile data |
| Tag | tech tag (mono), neutral | Not clickable unless it filters |
| Spec list | key/value rows | `dl` semantics |
| Project card | featured (large, with glow) / standard | Whole card clickable via stretched link; status shown honestly |
| Service card | primary (full card) / secondary (compact row) | Ends in inquiry CTA |
| Timeline item | experience / education / certification | Dates in mono; "present" supported |
| Process step | number + title + text | 4 steps max |
| Form field | text, email, select, textarea; default, focus, error, disabled | Label always visible; error text + icon, `aria-describedby` |
| Alert | success / error / info | `role="status"` or `role="alert"` |
| Footer | nav, contact, socials, legal | |
| Empty/placeholder | `TODO(content)` marker (dev only) | Build check fails if any remain in production |

## 7. Homepage structure (proposed — D-012)

The spec lists 13 homepage sections; several overlap. Proposed 8, in order:

1. **Hero** — name, role, one-line value statement, status chip, CTAs (*View work* / *Start a project*), plus a
   **BackgroundBridge spec card** beside it so identity *and* strongest project are visible in the first viewport
   (on mobile, where the card falls below the fold, a one-line "Featured: BackgroundBridge →" link sits under the CTAs).
   Absorbs "professional introduction" and "technical highlights".
2. **01 / Selected work** — BackgroundBridge large, other projects as standard cards.
3. **02 / Services** — 3 development services as full cards; social media services as a compact secondary row.
4. **03 / About & stack** — short bio + skills grouped by category (Languages, Frameworks, Tools) with honest
   level wording ("basic" where true). No percentages.
5. **04 / Process** — 4 steps (Discover → Plan → Build → Launch & support).
6. **05 / Experience & education** — one combined timeline incl. certification.
7. **Contact CTA** — short prompt + button + email fallback.
8. **Footer.**

## 8. Accessibility checklist (applies to every component)

- WCAG 2.2 AA: text contrast per §2; non-text contrast ≥ 3:1 for inputs/focus.
- Visible focus: 2 px `focus` ring, 2 px offset, never removed.
- Semantic landmarks (`header`, `nav`, `main`, `footer`), logical heading order.
- All interactive elements keyboard-operable; no hover-only content.
- Images: meaningful `alt`; decorative images `alt=""`.
- Respect reduced motion (§5) and text resize to 200% without loss.
