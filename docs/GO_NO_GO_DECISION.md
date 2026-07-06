# GO / NO-GO DECISION

Audit date: 2026-07-07
Current decision: **NO-GO**

## Who approves

| Area | Approver |
| --- | --- |
| Product scope | Product Owner / Founder |
| Security | Security owner / Lead engineer |
| Engineering | Engineering lead |
| Staging and operations | Ops owner |
| Database/Supabase | DB owner |
| Legal | Legal counsel / DPO reviewer |
| Payments/invoices | Business owner + finance owner |

## Conditions to move to Phase 14R

The project can move to Phase 14R only after all conditions below are true on `main`:

- Fazy 0R-12R required for launch are merged or explicitly marked out of launch scope.
- No P0 blocker remains open in `docs/RELEASE_CANDIDATE_AUDIT.md`.
- `npm ci`, `npm run qa:ci`, `npm run build`, `npm run responsive:check` and private route smoke pass.
- `npm run test:e2e` passes against a real staging/preview URL.
- Staging DB migration status is verified.
- Supabase RLS/Data API grants are reviewed.
- R2 signed downloads are verified.
- Payment sandbox and invoice sandbox/mock are verified.
- Legal release checklist is approved.
- Monitoring, alerting, rollback and backup/restore are approved.
- Production deploy owner gives explicit approval.

## Must be green

- GitHub `Build and checks` on `main`.
- Vercel preview/staging deployment.
- Supabase migration status on staging.
- Private route and API auth smoke.
- CRM role matrix tests: CLIENT blocked, READ_ONLY read-only.
- Lead -> CRM smoke.
- Cart -> checkout -> payment sandbox -> paid order smoke.
- Document form -> generation -> R2 -> signed download -> audit smoke.
- Portal organization isolation smoke.
- CMS draft/review/publish/public visibility smoke.
- Automation reminders and email log smoke.
- Backup restore drill or documented restore verification.

## Acceptable risks

These may be accepted only with owner approval:

- Non-critical UI polish issues without security or conversion impact.
- Non-blocking deprecated transitive dependency warnings with no high/critical advisory.
- Manual staging checks that are documented with date, owner and result.
- Payment/invoice provider remaining in sandbox for staging, not production.

## Non-acceptable risks

- Any private route returning public 200 without session.
- Any private API mutation without session and role check.
- Any raw service role key, DB URL, webhook secret or R2 secret in public env or repo.
- Payment live mode without explicit business approval.
- Production deploy with unverified rollback/backup.
- Missing legal approval for sales/privacy/cookies/withdrawal/complaints where applicable.
- Missing RLS/grant review for Supabase tables exposed through Data API.
- Document download exposing raw storage keys to the browser without protected signed URL flow.
- Unmerged release-required phase code sitting only in draft PRs.

## Current decision rationale

Decision remains **NO-GO** because `origin/main` does not contain the release candidate feature set or the release gate. It has unprotected private routes/API, missing tests, missing staging evidence, missing legal/ops readiness and open draft PRs containing most of the intended product.

Next decision checkpoint: after PR-A through PR-F from `docs/GAP_CLOSURE_PLAN.md` are complete and verified.
