# Audit Findings

| Finding | Before | After this PR | State |
| --- | --- | --- | --- |
| Public `/crm` and CRM lead API | No server gate on `main` baseline | Staff-only page and per-handler role checks | Fixed in scope |
| No operational Lead | IOD `FormSubmission` projection only | Dedicated Lead linked to raw intake | Added |
| No CRM mutations | Shell actions were scaffold | Lead/org CRUD, notes, assignment and conversion | Improved |
| No audit trail | CRM writes did not exist | Transactional allowlisted events | Added |
| Unbounded list semantics | No reusable paging contract | Cursor, defaults and max 100 | P2-004 partial |
| Public IOD abuse protection | No durable limiter/Turnstile enforcement on `main` | Existing route behavior retained | P1 open |
| Remaining CRM modules | Mostly scaffold | Unchanged | Open |

The CRM audit moves from `PARTIAL` to `IMPROVED`, not complete. Documents/generators, portal, breach/DSR, CMS, automation and production operations remain open.

## 2026-07-10 operational CRM update

| Finding | Before | After this PR | State |
| --- | --- | --- | --- |
| Tasks shown as missing despite model existing | `CrmTask` existed but UI module was controlled empty state | Task APIs, dashboard queue and detail-level task creation added | Improved |
| Timeline/activity | Audit existed but no CRM activity endpoint | Audit-backed activity and resource timeline endpoints added | Partial |
| Contacts | Model existed, create API missing | Lead/org contact create endpoints added | Partial |
| Raw template storage key in CRM product row | Template list used `fileKey` as secondary text | Replaced with safe template identifier | Fixed in scope |
| Commerce/breach/DSR | No dedicated models on this base | Documented as missing/partial instead of mocked as ready | Open |

The CRM moves toward an operational core. It is still not a complete CRM and is not production-ready.
