# Audit Gap Closure Plan

Completed in this PR:

1. Dedicated Lead and related CRM schema.
2. Staff/role authorization on `/admin` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

Later phases should cover remaining CRM modules, task CRUD and activity timeline, controlled deduplication review UI, staging migration rehearsal, security smoke automation, portal isolation, breach/DSR workflows and production readiness gates.

The public IOD route still needs durable abuse protection (for example Turnstile plus a shared limiter) in a dedicated security change; this PR does not claim that gap is closed.

Completed in `[cms] add blog CMS and newsletter foundation`:

1. Blog CMS models, category/tag models and workflow statuses.
2. Public blog routes backed by database reads filtered to `PUBLISHED`.
3. Staff-only `/admin/cms` with create/edit, taxonomy, workflow actions and read-only subscriber list.
4. Newsletter subscriber and consent event persistence.
5. Unsubscribe token-hash foundation and public unsubscribe page.
6. Blog SEO metadata, robots and sitemap foundation.
7. CMS/newsletter documentation and smoke checklist.

Next recommended PR after this CMS/newsletter foundation: `[ops] perform staging verification and release candidate audit`.

The next PR should not add marketing automation. It should apply migrations to staging, seed or migrate representative blog content, verify the full role matrix, verify unsubscribe with generated links, and produce an updated GO/NO-GO decision. Production readiness remains `NO`.
