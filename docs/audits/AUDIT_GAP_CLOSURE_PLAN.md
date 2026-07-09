# Audit Gap Closure Plan

Completed in this PR:

1. Dedicated Lead and related CRM schema.
2. Staff/role authorization on `/admin` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

2026-07-10 breach module follow-up:

1. Run the breach migration only in the intended non-production environment first.
2. Smoke test CLIENT cross-tenant denial and READ_ONLY mutation denial.
3. Add secure breach attachments in a separate storage/ACL PR.
4. Keep production readiness at NO until staging migration, real auth smoke and rollback are verified.
5. Next recommended PR after this module: `[dsr] add data subject request module`.

Later phases should cover remaining CRM modules, task CRUD and activity timeline, controlled deduplication review UI, staging migration rehearsal, security smoke automation, portal isolation, breach/DSR workflows and production readiness gates.

The public IOD route still needs durable abuse protection (for example Turnstile plus a shared limiter) in a dedicated security change; this PR does not claim that gap is closed.
