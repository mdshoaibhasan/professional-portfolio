# MASTER SETUP PROMPT — Premium Personal Portfolio & Freelance Website

> Source of truth for project scope. Saved verbatim during Milestone 1 (2026-11-23).
> Do not edit the specification below; record changes and clarifications in `docs/DECISIONS.md`.
>
> **Amended 2026-11-23 (D-029):** professional positioning is now **Software Engineer**. §2, the framing of §3, and
> §4, §5 and §7 (homepage) are superseded where they conflict with [POSITIONING.md](POSITIONING.md).

---

You are my Senior Software Architect, UI/UX Designer, Full-Stack Developer, Technical Auditor, and Project Manager.

Your responsibility is to help me build a premium, production-ready personal portfolio and freelance business website from the ground up.

You must work professionally, step by step, with careful planning, technical validation, and high-quality implementation.

This is a real portfolio project intended for professional use, job applications, freelance client acquisition, and future business growth.

---

# 1. FIRST: UNDERSTAND THE PROJECT

I have opened a new, initially empty project folder.

I do NOT want to manually create every configuration file, documentation file, folder, or project instruction.

Your first responsibility is to inspect the current workspace and prepare the project foundation yourself.

You are authorized to create the necessary initial setup files and documentation, but you are NOT authorized to start full application development before I approve the plan.

## Initial setup tasks

1. Inspect the current workspace.
2. Check whether the folder is empty or contains existing files.
3. Never overwrite or delete existing files without permission.
4. Create a professional project folder structure.
5. Create a comprehensive root-level `CLAUDE.md`.
6. Create a professional `README.md`.
7. Create a suitable `.gitignore`.
8. Create `.env.example` if needed.
9. Create a `docs/` directory.
10. Create the following documentation files:

- `docs/MASTER_PROMPT.md`
- `docs/PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTENT_CHECKLIST.md`
- `docs/DEPLOYMENT.md`
- `docs/DECISIONS.md`

11. Save this complete project specification in `docs/MASTER_PROMPT.md`.
12. Make sure future development follows the instructions in `CLAUDE.md`.

Do not create unnecessary application code during this initial setup.

---

# 2. PROJECT VISION

Build a premium personal portfolio website that combines:

A. Modern Software Developer Identity  
B. Creative Technology Studio

The website must primarily establish me as a professional Software Developer.

It should also present my freelance services in a professional way.

The website should communicate:

- Technical capability
- Real project experience
- Professional identity
- Problem-solving ability
- Trustworthiness
- Business communication
- Freelance service availability

The design must not look like a generic portfolio template.

I want a distinctive, premium, modern, sophisticated website.

---

# 3. MY PROFESSIONAL PROFILE

Use only verified information.

Known technical skills:

- Python
- Django
- Django REST Framework
- REST API Development
- HTML
- Bootstrap 5
- SQLite
- Git and GitHub
- Postman
- Basic Linux
- Basic Flutter and Dart

I am a Computer Science and Engineering student in Bangladesh.

My expected graduation is November 2026.

I have experience in team operations, customer handling, workflow coordination, and professional communication.

I also have a Python-based web application development certification.

Important:

Do not invent:
- Employment dates
- Educational qualifications
- Client numbers
- Project statistics
- Testimonials
- Revenue figures
- Professional achievements
- Technical skills
- Project functionality
- Company names or partnerships

If information is missing, use `TODO(content):` placeholders and list the missing information in `CONTENT_CHECKLIST.md`.

Do not publicly expose private personal information.

---

# 4. SERVICES

The website must support these five service categories:

1. Website Development
2. Web Application & API Development
3. Social Media Page Management
4. Social Media Boosting & Advertising
5. Mobile Application Development

Each service should have a professional description, appropriate benefits, clear scope, and a contact or inquiry CTA.

Do not exaggerate my technical expertise.

Present software development as my primary professional identity. Marketing and social media services should be secondary business offerings.

---

# 5. PRIMARY FEATURED PROJECT

## BackgroundBridge

BackgroundBridge must be the primary featured project on my portfolio.

It is a Python/Django-based background intelligence platform.

However, you MUST inspect its actual source code before writing technical claims about it.

I will provide its actual local folder path when requested.

Your inspection should identify:

- Project architecture
- Technologies used
- Main applications
- Actual implemented features
- REST API functionality
- Database structure
- User workflows
- Search and processing workflows
- Security considerations
- Deployment configuration
- Screenshots and available demonstrations

Do not assume a feature exists simply because its name appears in documentation.

Create a professional case study based on verified implementation.

Never expose:
- API keys
- Passwords
- Private user data
- Internal credentials
- Sensitive database records
- Confidential source information

---

# 6. TECHNOLOGY STACK

Proposed architecture:

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- React Hook Form
- Zod
- Motion for subtle animations when useful

## Backend

- Python
- Django
- Django REST Framework
- SQLite initially

## Backend architecture

Keep the backend modular and maintainable.

Potential Django apps:

- profiles
- projects
- services
- experience
- education
- achievements
- inquiries

Do not create unnecessary apps.

Use a clean API structure, appropriate validation, and secure configuration.

Do not introduce Docker, Redis, Celery, microservices, or paid external services unless I explicitly approve them.

---

# 7. WEBSITE PAGES

Plan the following pages:

1. Home
2. About
3. Projects
4. BackgroundBridge Case Study
5. Services
6. Individual Service Pages
7. Experience
8. Contact
9. Privacy Policy
10. Custom 404 Page

Consider adding a blog later if it provides genuine professional value.

## Homepage sections

- Premium navigation
- Hero section
- Professional introduction
- Technical highlights
- About section
- Featured projects
- Technical skills
- Services
- Work process
- Professional experience
- Education and certification
- Contact CTA
- Footer

Avoid unnecessary sections.

The homepage must communicate my identity and strongest project within a few seconds.

---

# 8. DESIGN DIRECTION

Design concept:

Modern Developer Identity + Creative Technology Studio.

Preferred design tokens:

- Background: #080D18
- Surface: #111827
- Primary: #2563EB
- Accent: #8B5CF6
- Main text: #F8FAFC
- Muted text: #94A3B8

Typography direction:

- Space Grotesk
- Inter
- JetBrains Mono

These are initial design references, not restrictions. Validate contrast and readability.

Design requirements:

- Premium dark-first design
- Excellent typography
- Strong visual hierarchy
- Sophisticated spacing
- Modern card layouts
- Subtle motion
- Responsive navigation
- Professional project presentations
- Beautiful mobile experience
- Fast loading
- Accessible interactions

Avoid:

- Generic templates
- Excessive gradients
- Excessive glassmorphism
- Too many animations
- Fake skill percentage bars
- Unnecessary visual clutter
- Fake testimonials
- Fake statistics

Respect `prefers-reduced-motion`.

---

# 9. CONTACT AND INQUIRY SYSTEM

Create a professional inquiry system.

Potential fields:

- Name
- Email
- Company (optional)
- WhatsApp (optional)
- Interested service
- Project description
- Budget (optional)
- Timeline (optional)

Requirements:

- Server-side validation
- Spam protection
- Honeypot field
- Rate limiting
- Secure database storage
- Email notification
- Proper error handling
- Success confirmation

Save inquiry data first.

Email notification failure must not cause the inquiry submission to fail.

Do not automatically send promotional emails.

Provide fallback contact options such as email and WhatsApp.

Never send contact form personal information to advertising platforms.

---

# 10. ADMIN DASHBOARD

Admin dashboard is Phase 2.

Initially, use Django Admin where appropriate.

Do not build a custom React admin dashboard during the initial public website development unless I approve it.

Plan for future content management:

- Profile information
- Projects
- Services
- Experience
- Education
- Achievements
- Inquiries

Keep the architecture ready for future expansion.

---

# 11. SEO AND MARKETING

The website should be ready for professional search visibility and future advertising.

Plan for:

- SEO-friendly URLs
- Page titles and descriptions
- Open Graph metadata
- Canonical URLs
- Sitemap
- Robots.txt
- Structured data
- Optimized images
- Social sharing previews

Future advertising integrations:

- Google Analytics 4
- Meta Pixel
- Google Ads Conversion Tracking

Analytics and advertising pixels must be consent-aware.

Do not activate tracking without appropriate consent configuration.

Do not send personal form data to advertising platforms.

The website should work as a professional landing page for future paid campaigns.

---

# 12. HOSTING AND DEPLOYMENT

My hosting environment is not yet confirmed.

Do not assume the hosting provider supports a particular Python version, Node.js, SSH, or deployment architecture.

Before deciding deployment architecture, ask me for:

- Hosting provider
- Hosting plan
- Available Python versions
- SSH availability
- Domain status
- cPanel or other control panel
- Python application support
- Static hosting support

Preferred deployment direction:

- Build React frontend locally.
- Serve the production frontend as static files.
- Run Django through the hosting provider's supported Python application environment.
- Prefer same-domain API routing where feasible.

If the host cannot support this architecture, propose a compatible alternative.

Do not purchase a domain, hosting plan, or paid service.

Do not deploy anything without explicit approval.

---

# 13. DEVELOPMENT RULES

Follow these rules strictly:

1. One milestone at a time.
2. Inspect before changing.
3. Plan before implementation.
4. Ask for approval before starting each major milestone.
5. Never overwrite existing work without permission.
6. Never delete files without permission.
7. Do not install unnecessary dependencies.
8. Explain important technical decisions.
9. Use maintainable code.
10. Follow security best practices.
11. Test before claiming something works.
12. Never claim a feature is implemented without verifying it.
13. Never expose secrets.
14. Keep documentation updated.
15. Do not push code to GitHub without approval.
16. Do not merge branches without approval.
17. Do not purchase services or run paid advertisements.
18. Do not deploy without approval.

Use Git checkpoints between major milestones.

Before every commit, inspect `git status` and ensure secrets, databases, uploaded media, and private files are excluded.

---

# 14. MILESTONES

Organize the project into these milestones:

## Milestone 1 — Project Audit and Planning

- Inspect workspace
- Inspect existing project paths when provided
- Understand hosting constraints
- Validate architecture
- Prepare folder structure
- Prepare project documentation
- Prepare content checklist
- Identify risks and missing information

## Milestone 2 — Design System

- Design tokens
- Typography
- Components
- Responsive layout system
- UI/UX direction

## Milestone 3 — Frontend Foundation

- React setup
- Routing
- Layout
- Navigation
- Footer
- Responsive foundation

## Milestone 4 — Public Website

- Homepage
- About
- Projects
- BackgroundBridge case study
- Services
- Experience
- Contact

## Milestone 5 — Django Backend

- Django configuration
- Models
- REST APIs
- Validation
- Security

## Milestone 6 — Contact System

- Inquiry API
- Spam protection
- Email notification
- Frontend integration
- Error handling

## Milestone 7 — Admin and Content Management

- Django Admin
- Content management
- Project management
- Inquiry management

## Milestone 8 — SEO and Analytics

- SEO
- Metadata
- Sitemap
- Structured data
- Consent-aware analytics

## Milestone 9 — Quality Assurance

- Responsive testing
- Accessibility
- Security checks
- Performance
- Browser testing
- API testing

## Milestone 10 — Deployment

- Production configuration
- Hosting compatibility
- SSL
- Domain configuration
- Deployment documentation
- Backup strategy

---

# 15. YOUR FIRST TASK — DO NOT SKIP

Start with Milestone 1 only.

Do the following:

1. Inspect the current workspace.
2. Check whether any existing files need protection.
3. Ask me for the local paths of BackgroundBridge and any other projects you need to inspect.
4. Ask me for hosting details.
5. Create the initial project documentation and setup files.
6. Prepare a detailed technical audit and project roadmap.
7. Validate whether the proposed stack and architecture are suitable.
8. Identify technical risks, missing information, and possible improvements.
9. Prepare a content checklist showing what information I must provide.

You may create the initial setup and documentation files, but do not begin application implementation.

## IMPORTANT APPROVAL GATE

After completing Milestone 1:

Present a clear report containing:

- Workspace audit
- Files created
- Recommended architecture
- Folder structure
- Technology decisions
- Hosting compatibility findings
- BackgroundBridge inspection status
- Missing content
- Risks
- Milestone roadmap
- Recommended next steps

Then STOP and wait for my explicit approval.

Do not automatically begin Milestone 2.

---

# FINAL EXPECTATION

I want a professional, premium, production-ready personal portfolio that can genuinely help me:

1. Apply for software development jobs.
2. Demonstrate my technical capabilities.
3. Showcase BackgroundBridge professionally.
4. Acquire freelance clients.
5. Promote my development services.
6. Build a long-term personal technology brand.

Think like a senior software architect and professional product designer.

Prioritize quality, accuracy, maintainability, security, and real-world usability over unnecessary complexity.

**Begin with Milestone 1 only.**
