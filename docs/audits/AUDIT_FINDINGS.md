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
| Static/partial blog | Static `src/lib/blog.ts`, no persisted workflow | Prisma CMS models, public `PUBLISHED` blog routes, `/admin/cms` | Improved |
| Missing newsletter consent | Mock newsletter UI, no consent event persistence | Subscriber model, consent events, required checkbox | Added |
| Missing unsubscribe | No public unsubscribe foundation | Token-hash unsubscribe API and page | Added foundation |
| Marketing automation | Missing | Unchanged | Out of scope |

The CRM audit moves from `PARTIAL` to `IMPROVED`, not complete. CMS/newsletter moves from `MISSING/SCAFFOLD` to `FOUNDATION/PARTIAL`. Documents/generators, portal, breach/DSR, advanced automation and production operations remain open.

CMS/newsletter residual risks:

1. Static articles are not automatically migrated into `BlogPost`.
2. Double opt-in email delivery is not implemented.
3. Campaign sending is intentionally absent.
4. Public newsletter abuse protection is limited to validation and honeypot until a reusable limiter/Turnstile path is added.
5. Staging migration and role-matrix smokes are still required before release.
