# Audit Findings

| Finding | Before | After this PR | State |
| --- | --- | --- | --- |
| Public `/admin` and CRM lead API | No server gate on `main` baseline | Staff-only page and per-handler role checks | Fixed in scope |
| No operational Lead | IOD `FormSubmission` projection only | Dedicated Lead linked to raw intake | Added |
| No CRM mutations | Shell actions were scaffold | Lead/org CRUD, notes, assignment and conversion | Improved |
| No audit trail | CRM writes did not exist | Transactional allowlisted events | Added |
| Unbounded list semantics | No reusable paging contract | Cursor, defaults and max 100 | P2-004 partial |
| Public IOD abuse protection | No durable limiter/Turnstile enforcement on `main` | Existing route behavior retained | P1 open |
| Remaining CRM modules | Mostly scaffold | Unchanged | Open |

The CRM audit moves from `PARTIAL` to `IMPROVED`, not complete. Documents/generators, portal, breach/DSR, CMS, automation and production operations remain open.

## Release candidate audit update - 2026-07-10

| Finding | Current evidence | State | Release impact |
| --- | --- | --- | --- |
| Local build quality | `npm ci`, Prisma generate/validate, lint, final typecheck and build pass | FIXED/PARTIAL | Supports code review, not release readiness |
| Test automation | `test`, `test:security`, `test:smoke` scripts are missing | STILL_OPEN | Blocks staging RC |
| Staging env verification | No staging secrets or staging DB were available | MANUAL_REQUIRED | Blocks staging RC |
| Public document generation | `/api/documents/generate` is public and caller-controlled | STILL_OPEN | P0 blocker |
| Tenant isolation | Portal/document/download/order/breach/DSR cross-org tests cannot run | MANUAL_REQUIRED/STILL_OPEN | P0 blocker |
| Supabase RLS/Data API | CRM migration enables RLS for selected tables; initial tables need manual dashboard verification | MANUAL_REQUIRED | Blocks staging RC |
| Commerce/payments/invoices | Missing models/APIs/flows on `main` | STILL_OPEN | Blocks staging RC |
| Portal | `/client` is placeholder; `/platforma/*` missing | STILL_OPEN | Blocks staging RC |
| Breach/DSR/notifications/CMS/newsletter | Missing on audited `main` | STILL_OPEN | Blocks staging RC |
| Legal release docs | Incomplete/missing approval metadata | STILL_OPEN | Blocks production and staging RC |

Release candidate decision: `STAGING_NO_GO`.
Production decision: `PRODUCTION_NO`.
