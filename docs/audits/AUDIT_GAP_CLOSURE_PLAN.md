# Audit Gap Closure Plan

Completed in this PR:

1. Dedicated Lead and related CRM schema.
2. Staff/role authorization on `/admin` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.
6. DSR foundation: data model, portal intake, CRM operations, identity verification and response preparation.
7. Next: notifications and event workflows for DSR deadlines, assignments and response preparation.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

Later phases should cover remaining CRM modules, task CRUD and activity timeline, controlled deduplication review UI, staging migration rehearsal, security smoke automation, portal isolation, breach/DSR workflows and production readiness gates.

The public IOD route still needs durable abuse protection (for example Turnstile plus a shared limiter) in a dedicated security change; this PR does not claim that gap is closed.
