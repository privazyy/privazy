# Document Input Flow Update - 2026-07-09

| Finding | Status after PR | Evidence |
| --- | --- | --- |
| Document input model missing | ADDED / PARTIAL | `DocumentInput`, `Order`, `OrderItem`, `Product` added as minimal additive schema. |
| Client document input missing | ADDED / PARTIAL | Protected `/platforma/dokumenty` list and privacy-policy form added. |
| CRM document input visibility missing | ADDED / PARTIAL | CRM list `Formularze dokumentów` and CRM input API added. |
| Paid order -> input flow missing | ADDED / PARTIAL | Client creation requires `Order.paymentStatus = PAID` and document `OrderItem`. |
| Generation after submit | ADDED / CONTROLLED_PENDING | Submit creates `DocumentGenerationJob`, but does not emit a live worker event. |
| Production readiness | NOT FIXED | No production migration/deploy, no live payment flow, no final DOCX guarantee. |

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
| Breach incident register | Visual scaffold only | `DataBreachIncident`, `DataBreachActivity`, portal/CRM API and 72h tracking | Added / partial |
| Breach production readiness | Missing workflow and migration rehearsal | Foundation only, no prod deploy and no PUODO automation | NO |

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

## CRM commerce/document operations update

Status after `[crm] add orders payments invoices and document operations`:

- CRM orders: ADDED / PARTIAL. Database models, CRM list/detail, API reads, notes, owner assignment, internal status, and sandbox cancel were added.
- CRM payments: ADDED / PARTIAL. Mock/sandbox payments and safe events were added. Live payments remain out of scope.
- CRM invoices: ADDED / PARTIAL. Mock/sandbox invoice request/retry/cancel were added. Live invoices remain disabled.
- CRM document operations: ADDED / PARTIAL. Job retry, generated document review, file metadata, and download history were added.
- CRM operational visibility: IMPROVED. Order timeline uses `AuditLog` because activity timeline is not guaranteed on `main`.

Still open:
- Live payments.
- Live invoices.
- Full client document input flow.
- Full client portal delivery.
- Full document generator orchestration.
- Breach/DSR/CMS/newsletter.
- Staging readiness.
- Production readiness.

2026-07-10 breach update: the breach module is now a real foundation, but secure attachments, production migration, automatic authority submission and final legal automation remain out of scope.
