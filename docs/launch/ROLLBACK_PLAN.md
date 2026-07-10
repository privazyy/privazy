# Rollback Plan

Rollback is required when a launch, staging rehearsal or controlled user flow creates material risk to privacy, payments, documents, legal compliance or system availability.

## Decision Owner

| Role | Responsibility |
| --- | --- |
| Incident commander | Declares rollback and coordinates status |
| Technical owner | Executes deployment, flags, database and storage actions |
| Legal/privacy owner | Decides user/legal notifications |
| Support owner | Handles affected users and ticket log |

## Immediate Rollback Actions

1. Set `MAINTENANCE_MODE=true`.
2. Disable risky features: `ENABLE_CHECKOUT=false`, `ENABLE_LIVE_PAYMENTS=false`, `ENABLE_INVOICES=false`, `ENABLE_LIVE_INVOICES=false`, `ENABLE_DOCUMENT_GENERATION=false`, `ENABLE_EMAIL_SENDING=false`.
3. Stop marketing or onboarding invites.
4. Preserve logs and affected IDs.
5. Roll back Vercel deployment only after new writes are stopped or understood.
6. Freeze database migrations; do not run destructive fixes during incident triage.
7. Inform support and legal/privacy owner.

## Deployment Rollback

- Use the Vercel dashboard or CLI rollback to promote the previous known-good deployment.
- Confirm `/api/health` and `/api/launch/status` after rollback.
- Keep `MAINTENANCE_MODE=true` until smoke checks pass.

## Data Protection

- Snapshot affected records before manual correction.
- Do not delete generated documents, orders, leads or audit logs during first response.
- Export incident evidence into the incident record.
- If cross-tenant exposure is suspected, treat it as severity 1 until disproven.

## Scenario Playbooks

| Scenario | Stop action | Recovery gate |
| --- | --- | --- |
| Auth broken | Enable maintenance, block onboarding, preserve auth logs | Login/logout/callback smoke passes |
| CRM exposed | Disable CRM access, preserve request logs | Role matrix passes for ADMIN/LAWYER/OPERATOR/READ_ONLY/CLIENT |
| Cross-tenant leak | Maintenance on, freeze affected modules | Root cause fixed, tenant tests pass, legal review complete |
| Payment issue | Disable checkout and live payments | Provider reconciliation and test charge/refund approved |
| Document generation corrupt | Disable generation | Template and generated output manually reviewed |
| R2 download issue | Disable downloads or document module | Guarded download smoke passes |
| Email spam/duplicate | Disable email sending | Deduplication/idempotency confirmed |
| DB migration issue | Stop deploy/migrations | Restore or forward-fix plan approved |
| Legal docs missing | Disable paid/public launch | Legal approval complete |
| Severe performance issue | Maintenance on or feature-specific flags off | Error/latency back below threshold |

## User Communication

Use `docs/launch/COMMUNICATION_TEMPLATES.md`. Do not over-explain internals, do not expose affected users to each other, and involve legal/privacy owner before any data incident message.
