# Launch Decision Record

| Field | Value |
| --- | --- |
| Decision date | 2026-07-10 |
| Release candidate audit reference | `[ops] perform staging verification and release candidate audit`; latest known draft result: `STAGING_NO_GO` |
| Base branch | `main` |
| Staging decision | `STAGING_NO_GO` |
| Production decision | `NO` |
| Launch decision | `DO_NOT_LAUNCH` |

## Reasons

- Release candidate audit is not a public launch approval.
- This branch is based on `main`; latest RC audit artifacts are not merged into this base, so readiness must be treated as unapproved.
- Staging verification, tenant isolation, Supabase/RLS/Data API verification, smoke tests and legal approval remain required gates.
- Live payments and live invoices are not approved for production use.

## Blockers

| Blocker | Launch impact |
| --- | --- |
| `STAGING_NO_GO` release gate | No soft launch execution |
| Legal docs not approved | No public paid launch |
| Live payments disabled/not approved | No real paid launch |
| Live invoices disabled/not approved | No production paid launch |
| Security blockers open | No launch |
| Monitoring partial/manual | No unattended launch |
| Backup restore not tested | No production data-risk acceptance |

## Accepted Risks

- Preparing runbooks before readiness is acceptable.
- Manual support is acceptable for an internal-only rehearsal.
- Feature flags may exist as env-controlled gates before full admin UI support exists.

## Rejected Risks

- Launching while `STAGING_NO_GO` is active.
- Treating sandbox commerce as real paid commerce.
- Running marketing traffic before monitoring and support are staffed.
- Allowing public document generation or downloads without role and tenant checks.

## Approvers

| Role | Required before changing decision | Status |
| --- | --- | --- |
| Product owner | Yes | Pending |
| Technical owner | Yes | Pending |
| Legal/privacy owner | Yes | Pending |
| Support owner | Yes | Pending |

## Required Follow-ups

1. Merge or repeat release candidate audit artifacts on the target base.
2. Close P0/P1 security and tenant isolation blockers.
3. Complete staging smoke plan and production preflight checklist.
4. Approve legal documents.
5. Approve or keep disabled live payments and live invoices.
6. Execute controlled soft launch checks in a separate PR/runbook execution.
