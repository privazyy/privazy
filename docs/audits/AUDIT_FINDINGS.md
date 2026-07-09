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
## CRM tasks, notes and timeline update

Improved in this PR:

- CRM notes: ADDED for typed internal notes and update flow.
- CRM tasks: ADDED for create/list/detail/update/status/assign foundation.
- CRM activity timeline: ADDED as an internal operational timeline.
- CRM mutations: IMPROVED for note/task modules with Zod validation and role checks.

Still not fixed:

- Full CRM automation.
- Client portal messaging.
- Breach/DSR modules.
- Commerce, payments and invoices.
- Production readiness.
