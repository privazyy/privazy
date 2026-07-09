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
| Breach incident register | Visual scaffold only | `DataBreachIncident`, `DataBreachActivity`, portal/CRM API and 72h tracking | Added / partial |
| Breach production readiness | Missing workflow and migration rehearsal | Foundation only, no prod deploy and no PUODO automation | NO |

The CRM audit moves from `PARTIAL` to `IMPROVED`, not complete. Documents/generators, portal, breach/DSR, CMS, automation and production operations remain open.

2026-07-10 breach update: the breach module is now a real foundation, but secure attachments, production migration, automatic authority submission and final legal automation remain out of scope.
