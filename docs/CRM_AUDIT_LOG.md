# CRM_AUDIT_LOG

CRM Phase 7R writes operational changes to two tables:

- `AuditLog` for compliance-grade event history.
- `CrmActivity` for CRM timeline/activity views.

The shared writer is `src/server/crm/audit.ts`.

## Covered mutations

The current server actions write audit entries for:

- lead status changes,
- lead owner assignment,
- note creation,
- task creation,
- task status changes,
- admin-only order status changes,
- document job retry,
- generated document status changes,
- breach incident status changes,
- data subject request status changes.

## Metadata rules

Audit metadata should stay small and operational:

- include target status, target entity and reason where needed,
- do not include raw payment payloads,
- do not include raw document `fileKey`,
- do not include full generated document input snapshots,
- avoid unnecessary personal data.

Manual order status change requires an ADMIN role and a reason. The reason is stored in audit metadata.

## Access policy

The audit-log viewer is part of the CRM admin surface. `ADMIN` has full access. `LAWYER`, `OPERATOR`, and `READ_ONLY` can see audit-derived operational context only through routes allowed by `src/server/crm/permissions.ts`.

`CLIENT` has no CRM access.

## Follow-up

Phase 8R should add request-context capture for `ipAddress` and `userAgent` in server actions. Route handlers already have direct access to request headers, but React server actions need a deliberate wrapper.
