# Client Portal Baseline Audit

| Area | Current state on `main` | Target in this PR | Out of scope | Notes |
| --- | --- | --- | --- | --- |
| `/platforma` | MISSING | ADDED protected portal | Full support/impersonation | CLIENT only. Staff redirects to CRM/admin. |
| `/client` | Public placeholder | Redirects to `/platforma` | Separate legacy portal | Keeps old link usable. |
| `/documents` | Public document-generation demo | Left unchanged | Public portal | Still separate risk to harden later. |
| Client orders | MISSING | ADDED minimal `PortalOrder` view | Live checkout/payments | Partial until commerce PR merges. |
| Client document inputs | MISSING on `main` | ADDED minimal `PortalDocumentInput` status view | Full form editor | Document-input flow remains previous phase dependency. |
| Generated documents | Existing `GeneratedDocument` with raw keys server-side | Portal serializer hides keys | Full file model | Uses secure endpoint over existing keys. |
| Secure download | R2 signed URL helper existed | ADDED portal download endpoint | Full access policy suite | Logs download and never returns raw key. |
| Organization view | Organization model existed | ADDED own org page and limited update | Critical data review workflow | Client can edit contact/address fields only. |
| API client surface | MISSING | ADDED `/api/portal/*` | Billing/live payments | All routes require CLIENT auth. |
| CRM data exposure | CRM exists separately | BLOCKED for CLIENT by existing guards | CRM rebuild | Portal uses separate service/serializers. |

Remaining risks:
- No production migration was run.
- Portal models are minimal because previous commerce/document-input PRs are still draft/open.
- `/api/documents/generate` remains a separate legacy hardening target.
- Full generated-file model and final privacy-policy generator remain partial.
