# QA Report: Milestone 9

Date: 2026-11-23. Re-run everything below before launch; the release gate is in §6.

## 1. Summary

| Area | Result |
|---|---|
| Automated page checks (30 page views: every page incl. each project/service and the 404 page, at 375 px and 1440 px) | ✅ 0 failures in Edge 150 and Chrome 157, on the dev server and on a production-like setup |
| Accessibility (axe-core 4.14, WCAG 2.0/2.1/2.2 A + AA rules) | ✅ 0 violations after one fix (§3) |
| Keyboard | ✅ First Tab reaches a visible "Skip to content" link; focus outline present |
| Performance (home, mobile, slow 4G + 4× CPU) | ✅ LCP 1.8–2.3 s (budget 2.5 s); initial JS 112 KB gzip (budget 200 KB) |
| Security headers | ✅ CSP + Permissions-Policy added (§4); nosniff, X-Frame-Options, Referrer-Policy, COOP already present |
| Dependency audit | ✅ `npm audit`: 0 vulnerabilities; `pip-audit`: none (requirement ranges and installed versions) |
| Backend tests | ✅ 79 tests, ruff clean, no missing migrations |
| Frontend tests | ✅ type-check, lint, Prettier, 32 tests, production build |
| Content | ❌ **20 placeholders remain**, all waiting on owner information (§5) |
| Firefox, Safari/iOS, Android, screen reader | ⏳ Not possible on this machine: owner checklist in §7 |

## 2. How it was tested

- `npm run qa` (`frontend/scripts/qa.mjs`) drives Chrome/Edge headlessly over every page from the live API. On each
  page it runs axe-core and checks console/browser errors, a single visible `<h1>`, no skipped heading levels, no
  horizontal overflow, alt text, named links/buttons, a single `<title>`, and placeholders. It also does a keyboard
  check. Reduced motion is forced so scroll-reveal content is visible to the checks.
- **Production-like run:** built files served directly and every other URL sent to Django, which renders the page
  shell with SEO tags and the Content-Security-Policy. That's how the CSP was proven not to break the site. The
  contact form was also submitted end to end under the CSP: stored as a genuine inquiry, no violations (test row
  deleted afterwards).
- `npm run qa:perf` measures the homepage on the production build (`npm run preview`): Largest Contentful Paint
  under emulated slow 4G (150 ms RTT, 1.6 Mbps) and 4× CPU slowdown, plus gzip size of all JavaScript loaded. Three
  runs: 2328 / 1832 / 1812 ms. The preview server sends files uncompressed, so this is pessimistic. Not Lighthouse:
  no extra tooling installed (D-040).

## 3. Issues found and fixed

| Issue | Fix |
|---|---|
| Links inside paragraphs were distinguishable only by colour (axe `link-in-text-block`, WCAG 1.4.1). The design system says they're always underlined, but Tailwind's reset removed it | Links inside paragraphs are underlined (`src/styles/index.css`) |
| No Content-Security-Policy or Permissions-Policy (ARCHITECTURE §7) | Added (§4) |
| A strict CSP would block the inline style on the `<noscript>` message | Moved to a CSS class |
| QA tooling couldn't see browser-level errors (CSP violations, failed loads) | `qa.mjs` now listens to them |

## 4. Security headers

Public pages: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`.
No inline scripts or styles are allowed. JSON-LD blocks are data, not scripts, so they're unaffected. `font-src data:` is
needed because Vite inlines one tiny self-hosted font file. If analytics are enabled, `CSP_TRACKERS` (`google`,
`meta`) adds exactly those hosts. The admin keeps Django's defaults without a CSP.

All responses: `Permissions-Policy` (camera, microphone, geolocation, payment, USB, topics off), `X-Content-Type-Options`,
`X-Frame-Options: DENY`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`. HSTS, secure cookies and the HTTPS redirect are
production-only (`check --deploy` clean).

## 5. Content placeholders (launch blockers)

Each needs information from the owner; see [CONTENT_CHECKLIST.md](CONTENT_CHECKLIST.md).

| Placeholder | Page(s) |
|---|---|
| 2–3 more projects | Home, Projects |
| Experience: role title, organization, dates | Home, Experience |
| Education: university, graduation status | Home, Experience |
| Certification: title, issuer, date | Home, Experience |
| Longer About text | About |
| BackgroundBridge: your role, repository link (or "available on request"), 2–3 lessons | Case study |
| Public email, reply time, WhatsApp (publish or not) | Contact |
| Privacy policy: publication date, owner review, contact email, retention period | Privacy |

Also not visible as placeholders but needed: **domain** (`SITE_URL`), review of the four draft service descriptions,
and the skill questions (PHP, CSS, JavaScript).

## 6. Release gate (before deploying)

1. `npm run check` and the backend checks pass.
2. `npm run qa -- --release` exits 0, meaning zero placeholders remain.
3. `npm run qa -- --browser chrome` exits 0.
4. `npm run build && npm run preview`, then `npm run qa:perf` within budget.
5. `npm audit` and `pip-audit` clean.
6. If tracker IDs are set: `CSP_TRACKERS` matches them, and the Privacy Policy and cookie banner were reviewed.

## 7. Manual checks for the owner

Automated checks can't cover these; please try each once before launch:

- [ ] **iPhone (Safari)** and **Android (Chrome)**: open every main page, the menu, and send a test inquiry.
- [ ] **Firefox** on a computer: same.
- [ ] **Screen reader** spot check (NVDA on Windows is free, or VoiceOver on iPhone): home page headings, menu,
      contact form errors and success message.
- [ ] **Zoom to 200 %** in a browser: nothing cut off or overlapping.
