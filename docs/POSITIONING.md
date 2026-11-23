# Professional Positioning — Software Engineer

> Owner direction received 2026-11-23 (D-029). **Amends** [MASTER_PROMPT.md](MASTER_PROMPT.md) §2 (vision),
> §3 (profile framing), §4 (services), §5 (featured project) and §7 (homepage). Where they conflict, this file wins.
> It changes positioning and content direction only: no rebuild, no architecture change.

---

## 1. Identity

| Item | Value | Status |
|---|---|---|
| Professional title | **Software Engineer** | Owner-provided |
| Headline | **Building Practical Software Solutions.** | Owner-provided |
| Introduction | "I design and develop modern websites, web applications, backend systems, APIs, and digital solutions that solve real-world problems." | Owner-provided (suggested wording) |

- Technology-flexible engineer, **not** a single-stack specialist. Do not use "Python Developer", "Django Developer"
  or similar as the title, headline or meta description.
- Python/Django remain visible as **verified skills and project evidence**, not as the identity.
- The title describes a profession, not an employer. Never imply employment that has not been confirmed.

## 2. Capability areas

Shown as the areas the owner works in. Each area may list only technologies from §3 that are **verified**.

1. Backend Development
2. Frontend Development
3. Web Application Development
4. API Development and Integration
5. Mobile Application Development
6. Database-Driven Applications
7. Business Software Solutions

An area with no verified technology behind it is shown without technology tags, or not shown at all (owner decides).
See CONTENT_CHECKLIST §F.

## 3. Skills: three tiers, never mixed

| Tier | Meaning | Public wording |
|---|---|---|
| **Use** | Can use now on real work | Listed normally; `level_label` "Basic" where true |
| **Learning** | Actively studying, not yet used in delivered work | Separate "Currently learning" group |
| **Interested** | Wants to work with, no hands-on claim | Separate "Interested in", or omitted |

Never present Learning/Interested items as expertise, in service copy, or in skill groups for capability areas.

Verified so far (MASTER_PROMPT §3), grouped by area. All in the **Use** tier:

| Area | Technologies |
|---|---|
| Backend | Python, Django, Django REST Framework, REST API development |
| Frontend | HTML, Bootstrap 5 |
| Mobile | Flutter (basic), Dart (basic) |
| Database | SQLite |
| Tools | Git & GitHub, Postman, Linux (basic) |

**Not verified:** PHP, CSS, JavaScript, MySQL/PostgreSQL, React/TypeScript (this site's stack is not by itself
proof of skill). **Learning** and **Interested** tiers: empty until the owner supplies them.

## 4. Services

Two separate categories, with one consistent visual system and a clearly visible hierarchy (DESIGN_SYSTEM principle 6).

**A. Software Development Services — Primary**

| # | Service | Maps from current content |
|---|---|---|
| 1 | Web Development | `website-development` (rename) |
| 2 | Web Application Development | split from `web-app-api-development` |
| 3 | Backend and API Development | split from `web-app-api-development` |
| 4 | Mobile Application Development | `mobile-app-development` (keep the honest "foundational Flutter" scope note) |
| 5 | Business and Custom Software Solutions | **new**: scope needed from owner |

**B. Digital Marketing Services — Secondary**

| # | Service | Maps from current content |
|---|---|---|
| 6 | Digital Marketing & Social Media Management | merges `social-media-management` + `social-media-advertising` |

Service 6 covers: social media page management; content planning and publishing; boosting and paid advertising;
advertising campaign management; audience targeting and campaign optimisation.

Rules: Software Development is always shown first and given more space. Marketing never appears inside
engineering capabilities or skills. Only services the owner confirms they can deliver are published.

## 5. Projects

- **BackgroundBridge** is an **independent selected project** under "Selected Projects" / "Independent Software
  Development Projects". Never framed as employment or a client engagement. Status stays **pre-launch**.
- It is one project among the selected work, **not** the homepage's defining element (see §6).
- Other projects are added only after their implementation and the owner's contribution have been verified.

## 6. Homepage direction

Order of priority: Software Engineer headline → short introduction → selected capabilities → selected projects →
contact/hiring CTAs. Not Django-centric. The current hero pairs the headline with a BackgroundBridge spec card
(D-012), which contradicts §5. Proposed replacement in D-032 (awaiting approval).

## 7. Implementation — done 2026-11-23 (approved D-030 to D-032)

1. ✅ Seed + local DB: headline/introduction, six services, skill areas/tiers. Local DB updated by a one-off script
   that changed only rows still equal to the old seed (backup kept outside the repo). Your earlier admin edit of the
   headline was preserved. `social-media-advertising` is **deactivated, not deleted**, so old inquiries keep their link.
2. ✅ `Skill.tier` + capability-area categories: migration `profiles/0002` (remaps existing rows), API, admin, types.
3. ✅ Page copy and meta descriptions no longer Django-centric.
4. ✅ Hero Capabilities card (D-032); `FeaturedProjectCard` removed; BackgroundBridge is a standard card.
5. ✅ Services page: "Software development" and "Digital marketing · secondary" headings.
6. ✅ Inquiry form picks up the new service slugs automatically.

**Draft copy awaiting owner review** (written from verified skills only, no experience claims): the descriptions,
inclusions and exclusions of *Web Application Development*, *Backend and API Development*, *Business and Custom
Software Solutions* and the merged *Digital Marketing & Social Media Management*.

Original backlog, for reference:

1. **Seed + database content:** headline, short bio/introduction, service set (rename, split, merge, new), skill
   tiers. `seed_content` only creates missing rows, so the **existing database will not pick up** new copy or
   renamed slugs. Needs admin edits or a one-off data migration (decide at implementation).
2. **Skill tiers:** the `Skill` model has no tier field. Needs a small model and API change (`tier`) plus a
   frontend type update (D-031).
3. **Hardcoded frontend copy:** `HomePage.tsx` (hero h1, meta description), `AboutPage.tsx`, `ProjectsPage.tsx`
   and `ServicesPage.tsx` meta descriptions use "Python and Django developer" wording.
4. **Homepage hero:** replace the BackgroundBridge spec card (D-032).
5. **Services page:** five primary cards + one secondary card, with category headings.
6. **Inquiry form:** service dropdown follows the new service slugs automatically (it reads active services).
