# CRM Commerce Operations

Status: `MISSING/PARTIAL`.

Current CRM can show document generation jobs as an operational queue, but there are no dedicated `Order`, `Payment` or `Invoice` models on this base branch.

Rules for future implementation:

- no client-controlled price,
- no raw provider payload in API responses,
- no live payments without approval,
- no live invoices without approval,
- READ_ONLY cannot mutate,
- sandbox/crm overrides must be explicit and audited.
