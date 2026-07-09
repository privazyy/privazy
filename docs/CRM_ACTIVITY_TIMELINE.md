# CRM activity timeline

The CRM timeline is an internal operational history for a lead or organization.

## Sources

Timeline combines:

- `CrmActivity` operational events,
- `CrmNote` entries,
- `CrmTask` entries,
- relevant `AuditLog` events.

## CrmActivity vs AuditLog

- `AuditLog` is formal/security evidence for mutations.
- `CrmActivity` is a readable operational stream for staff.

This avoids putting full note bodies, request payloads, secrets or storage keys into audit metadata.

## API

- `GET /api/crm/leads/[leadId]/timeline`
- `GET /api/crm/organizations/[organizationId]/timeline`

Timeline supports `limit`, `cursor` and optional type filtering. Serializers redact metadata and expose only allowlisted fields.
