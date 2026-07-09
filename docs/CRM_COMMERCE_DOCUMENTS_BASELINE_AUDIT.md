# CRM commerce/documents baseline audit

Date: 2026-07-09
Branch: `codex/crm-orders-payments-invoices-documents`
Base: `main`

This PR starts from the merged CRM lead/organization foundation. The tasks/notes/timeline draft PR is not assumed to be merged, so this PR uses `AuditLog` as the guaranteed history layer.

| Area | Current state | Target in this PR | Out of scope | Notes |
| ---- | ------------- | ----------------- | ------------ | ----- |
| Product | Missing on `main` | Added minimal `Product` model | Full shop catalog/CMS | Products use cents and VAT bps. |
| Order | Missing on `main` | Added `Order` with owner/status/payment/invoice/fulfillment fields | Client checkout | Totals are database fields, not frontend input. |
| OrderItem | Missing on `main` | Added `OrderItem` linked to Product/Order | Advanced packages | Tracks document type and fulfillment status. |
| Payment | Missing on `main` | Added Payment + PaymentEvent | Live payments | Provider is MOCK/SANDBOX only. |
| Invoice | Missing on `main` | Added mock/sandbox Invoice | Live invoice provider | Request/retry are staff operations only. |
| DocumentInput | Missing on `main` | Added model linked to order/order item | Client input portal | Client flow remains next PR. |
| DocumentGenerationJob | Exists | Extended with order/orderItem/input/retryCount | Live worker orchestration | Existing generation service remains foundation-only. |
| GeneratedDocument | Exists | Extended with order/orderItem/review fields | Full delivery workflow | Raw storage keys remain DB-only. |
| GeneratedDocumentFile | Missing on `main` | Added safe file metadata model | Public file serving | CRM serializers hide `fileKey`. |
| DocumentDownload | Missing on `main` | Added staff/client download history | Full client download UI | Secure download endpoint remains the only intended delivery path. |

Endpoint baseline before this PR:
- `/api/crm/leads`, `/api/crm/organizations`, `/api/crm/users`
- `/api/documents/generate`
- no `/api/crm/orders`, `/api/crm/payments`, `/api/crm/invoices`, or CRM document operations routes.

CRM views before this PR:
- `/admin` has CRM shell, lead/org views, documents based on `GeneratedDocument`, and orders mocked as document jobs.
- There are no real commerce/payment/invoice modules.

Data classification:
- Real: CRM leads, organizations, templates, generation jobs, generated documents, audit logs.
- New in this PR: commerce/document operation models and read/mutation APIs.
- Mock/sandbox: payments and invoices. Live providers are still disabled.

Readiness:
- Staging readiness: NO.
- Production readiness: NO.
