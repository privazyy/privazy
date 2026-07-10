# Incident Response Runbook

## Severity Levels

| Severity | Definition | Example |
| --- | --- | --- |
| SEV1 | Privacy, security, payment, legal or cross-tenant risk | Data leak, CRM exposure, document exposure |
| SEV2 | Major user-impacting outage without confirmed data exposure | Auth unavailable, DB connection failures |
| SEV3 | Degraded feature or isolated operational issue | Single failed document job |
| SEV4 | Cosmetic or non-urgent support issue | Copy issue, minor UI glitch |

## Roles

| Role | Owner |
| --- | --- |
| Incident commander | Assigned technical lead |
| Technical owner | Engineer/operator on duty |
| Legal/privacy owner | DPO/legal approver |
| Communications owner | Support/product owner |

## First 15 Minutes

1. Assign incident commander.
2. Classify severity.
3. Enable `MAINTENANCE_MODE=true` if there is security, privacy or data integrity risk.
4. Disable risky feature flags.
5. Preserve logs, request IDs, user IDs and affected record IDs.
6. Open incident record.

## First Hour

1. Confirm scope and affected users/organizations.
2. Decide rollback, forward fix or extended maintenance.
3. Notify legal/privacy owner for any suspected data incident.
4. Prepare user communication if impact is visible.
5. Record timeline and decisions.

## Evidence Preservation

- Do not delete audit logs, generated documents, leads, orders or support tickets.
- Export relevant provider logs where retention is short.
- Keep screenshots or command output for release decisions.

## User Communication

Use approved templates from `COMMUNICATION_TEMPLATES.md`. For suspected data breach, legal/privacy owner must approve wording and timing.

## Data Breach Assessment

Assess:

- categories of data,
- number of affected users/organizations,
- whether data was accessed by another tenant or public party,
- containment time,
- notification obligations,
- remediation steps.

## Postmortem

Every SEV1/SEV2 requires a postmortem with root cause, timeline, impact, what worked, what failed, owners and follow-up deadlines.

## Incident Types

| Incident | Immediate response |
| --- | --- |
| Data leak | Maintenance on, legal/privacy owner involved, preserve evidence |
| CRM exposure | Disable CRM access, verify role matrix |
| Document exposure | Disable downloads/generation, audit object access |
| Payment issue | Disable checkout/live payments, reconcile provider data |
| Email issue | Disable email sending, check duplicate/spam blast scope |
| Auth issue | Maintenance on if accounts are unsafe, check callback/session logs |
| Database issue | Stop writes if integrity risk, prepare restore/forward fix |
| Generator issue | Disable document generation, review templates/output |
