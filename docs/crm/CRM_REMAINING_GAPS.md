# CRM remaining gaps

This PR is an operational foundation, not a production-readiness claim.

## Remaining gaps

1. `CrmTask` does not have `cancelledAt`; cancellation is status plus audit event.
2. Notes can be created but not edited or archived.
3. Timeline is `AuditLog`-backed, not a dedicated `CrmActivity` table.
4. Dedicated URL routes like `/admin/leads/[leadId]` are not separate Next.js pages yet; the current CRM uses an in-app detail state inside `/admin`.
5. Orders, payments, invoices, breach and DSR modules remain separate follow-up work.
6. Automated CRM permission tests should be added once a test runner is introduced.

## Next recommended PR

`[crm] connect operational CRM with orders documents and payments`
