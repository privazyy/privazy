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
| Public `/admin` and CRM lead API | No server gate on `main` baseline | Staff-only page and per-handler role checks | Fixed in scope |
| No operational Lead | IOD `FormSubmission` projection only | Dedicated Lead linked to raw intake | Added |
| No CRM mutations | Shell actions were scaffold | Lead/org CRUD, notes, assignment and conversion | Improved |
| No audit trail | CRM writes did not exist | Transactional allowlisted events | Added |
| Unbounded list semantics | No reusable paging contract | Cursor, defaults and max 100 | P2-004 partial |
| Public IOD abuse protection | No durable limiter/Turnstile enforcement on `main` | Existing route behavior retained | P1 open |
| Remaining CRM modules | Mostly scaffold | Unchanged | Open |

The CRM audit moves from `PARTIAL` to `IMPROVED`, not complete. Documents/generators, portal, breach/DSR, CMS, automation and production operations remain open.
