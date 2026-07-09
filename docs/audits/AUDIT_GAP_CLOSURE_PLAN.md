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
## Gap closure added by CRM tasks/notes/timeline

This PR closes part of the operational CRM gap by adding internal notes, tasks and timeline surfaces for leads and organizations.

Remaining recommended sequence:

1. `[crm] add orders payments invoices and document operations`
2. `[crm] add task reminders and activity notifications`
3. `[security] complete authenticated staging smoke`
4. `[ops] rehearse migrations before production readiness`
