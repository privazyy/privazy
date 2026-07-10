# CRM Tasks, Notes And Timeline

## Notes

Lead and organization notes persist in `CrmNote` and are audit logged.

## Tasks

Tasks persist in `CrmTask` and support:

- list,
- detail,
- create,
- update,
- status change,
- due date,
- assigned user,
- lead/organization relationship,
- overdue dashboard state.

## Timeline

Timeline endpoints are backed by `AuditLog`:

- `GET /api/crm/activity`
- `GET /api/crm/leads/[leadId]/timeline`
- `GET /api/crm/organizations/[organizationId]/timeline`

Dedicated `CrmActivity` remains a future improvement.
