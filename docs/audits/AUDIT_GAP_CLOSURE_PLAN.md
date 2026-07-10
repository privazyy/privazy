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

## Launch preparation update

Completed in the controlled soft launch runbook PR:

1. Soft launch scope and launch decision record.
2. Go-live, production smoke and post-launch monitoring checklists.
3. Rollback, maintenance mode, incident response and support runbooks.
4. Feature flag audit and `.env.example` placeholders for launch gates.
5. Public status endpoints `/api/health` and `/api/launch/status` without secret values.

Still open before any launch execution:

1. Convert `STAGING_NO_GO` into `STAGING_CONDITIONAL_GO` or `STAGING_GO` with evidence.
2. Verify tenant isolation, secure downloads, document generation and CRM role matrix on staging.
3. Complete Supabase RLS/Data API exposure review.
4. Approve legal, payment and invoice gates.
5. Configure monitoring/alerting and execute backup restore plan.
6. Implement and test global maintenance enforcement if public users will be invited.

Next recommended PR: `[launch] execute controlled soft launch checks`.
