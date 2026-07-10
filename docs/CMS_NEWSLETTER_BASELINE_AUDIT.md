# CMS and Newsletter Baseline Audit

Baseline: `main` at `f58b905`.

| Area | Current state | Target in this PR | Out of scope | Notes |
| --- | --- | --- | --- | --- |
| Blog content | Static array in `src/lib/blog.ts` | Database-backed `BlogPost` list/detail | Content migration from old static posts | Static posts are no longer the public data source |
| Blog public routes | `/blog` and `/blog/[slug]` rendered static content | Public routes read only `PUBLISHED` posts | Full editorial search engine | Empty state is allowed before content seeding |
| Post model | Missing | `BlogPost` with status, SEO fields and author/reviewer refs | WYSIWYG editor, media library | Content is markdown/plain text and rendered without raw HTML |
| Category/tag model | Static category constants only | `BlogCategory`, `BlogTag`, join tables | Nested taxonomy | Slugs are unique |
| CMS admin | Missing for blog | `/admin/cms` staff surface | Full workflow dashboard | READ_ONLY can view but cannot mutate |
| Workflow | No persisted draft/review/published state | `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED` | Approval SLA, notifications | Public queries force `PUBLISHED` |
| Newsletter form | Mock/static client state in blog UI | Public consent form posting to API | Campaign sending | Consent checkbox is required and unchecked by default |
| Consent persistence | Missing | `NewsletterSubscriber` plus `NewsletterConsentEvent` | Double opt-in email delivery | Double opt-in remains a follow-up |
| Unsubscribe | Missing | Public token endpoint and page foundation | Sending unsubscribe links in campaigns | Raw token is not stored |
| Audit/activity | CRM/doc audit existed | CMS and newsletter mutation events | Central event bus | No full IP or user agent values are logged |

Real after this PR: Prisma models, services, API routes, admin CMS surface, public blog queries, consent events, unsubscribe hash handling, SEO metadata and sitemap foundation.

Partial after this PR: seeding/migrating old static articles, double opt-in, real campaign delivery, rich editor, reusable public rate limiter.

Production readiness remains `NO`.
