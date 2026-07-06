# Final Pre-Launch Checklist

Status: **BLOCKED - launch preparation only**
Date: 2026-07-07

Production launch must not start until the release decision is GO or CONDITIONAL GO with every condition closed. On `main`, the required `docs/GO_NO_GO_DECISION.md` is missing and Phase 13R PR #22 records NO-GO. This checklist is therefore a blocker list, not proof of readiness.

| Check | Required result | Current status | Owner | Evidence required |
| --- | --- | --- | --- | --- |
| Release candidate approved | GO or CONDITIONAL GO | BLOCKED | Product/Engineering | Approved `GO_NO_GO_DECISION.md` on `main` |
| P0 blockers closed | Zero open P0 | BLOCKED | Engineering Lead | Updated gap closure and passing checks |
| P1 blockers accepted or closed | Written approval | BLOCKED | Product/Security/Ops | Risk acceptance table |
| Tests pass | `qa:ci` green | BLOCKED | QA | GitHub check plus local command log |
| Staging smoke pass | All required smoke tests pass | MANUAL_VERIFICATION_REQUIRED | QA/Ops | `STAGING_SMOKE_TESTS.md` evidence |
| Backup verified | Restorable backup exists | MANUAL_VERIFICATION_REQUIRED | Ops/DB | Backup ID, restore drill result |
| Env verified | Production env names present, no values in repo | MANUAL_VERIFICATION_REQUIRED | Ops | Vercel/Supabase dashboard verification |
| Migrations reviewed | Ordered, reversible or backed up | BLOCKED | DB/Engineering | Migration runbook sign-off |
| Legal docs approved | All required legal docs approved | BLOCKED | Legal | `LEGAL_LAUNCH_APPROVAL.md` signed |
| Monitoring active | Alerts and owners configured | BLOCKED | Ops | Test alert received |
| Payment sandbox approved | Sandbox flow completed | BLOCKED | Payments/Engineering | Sandbox transaction evidence |
| Live payment approval | Explicit manual approval | BLOCKED | Business/Finance | Written approval; do not infer |
| Invoice approval | Provider, numbering, VAT approved | BLOCKED | Finance/Legal | Invoice test and approval |
| Resend domain verified | Production sender verified | MANUAL_VERIFICATION_REQUIRED | Ops | Provider dashboard screenshot/log |
| R2 private bucket verified | No public listing/read | MANUAL_VERIFICATION_REQUIRED | Ops/Security | Bucket policy verification |
| Inngest production env verified | Signing/event keys present | MANUAL_VERIFICATION_REQUIRED | Ops/Engineering | Production app env check |
| Support owner assigned | Named owner and backup | BLOCKED | Operations | Escalation roster |
| Rollback plan reviewed | Reviewed before deploy | BLOCKED | Engineering/Ops | Rollback drill record |

Decision: **NO LAUNCH** until every BLOCKED row is closed or explicitly accepted where allowed.
