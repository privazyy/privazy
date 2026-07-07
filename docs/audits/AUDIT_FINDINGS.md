# Audit Findings Delta

Date: 2026-07-07

## P0-004: Document query tenant scope

Status: `FIXED`

Resolved in this PR:

- `documents.listJobs` no longer trusts arbitrary `organizationId`.
- CLIENT organization access is checked through `ClientProfile`.
- CLIENT queries without an explicit organization are filtered to the user's linked organizations.
- CLIENT users with no organization scope are blocked.
- Staff document read access is explicit and role-based.
- `READ_ONLY` can read but is not granted mutation access.
- Document query responses use safe serializers and do not expose raw storage keys.
- Document list queries have Zod validation and a max limit.

Still open outside P0-004:

- Secure generated-document download ACL.
- Paid-order/document-input generation gate.
- Checkout/payment/order model.
- Staff assignment granularity for lawyer/operator access.

