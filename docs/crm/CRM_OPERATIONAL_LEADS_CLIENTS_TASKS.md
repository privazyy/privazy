# CRM operational leads, clients and tasks

This PR changes the CRM from a mostly create-form workflow into a stronger operational foundation for staff work.

## Connected in this PR

- Lead archive action and endpoint.
- Organization archive action and endpoint.
- Contact list and contact edit endpoints.
- Task assign, complete and cancel endpoints.
- Shared safe error, pagination, audit and activity helpers.
- Dashboard KPIs focused on daily CRM work.
- UI actions for archiving, editing contacts, setting a primary contact and assigning/completing/cancelling tasks.

## Status

| Area | Status | Notes |
| --- | --- | --- |
| Leads | READY foundation | List/detail/create/edit/status/assign/notes/tasks/timeline/convert/archive are connected. |
| Clients/organizations | READY foundation | List/detail/create/edit/archive/contacts/notes/tasks/timeline are connected. |
| Tasks | READY foundation | List/detail/create/edit/assign/status/complete/cancel are connected. |
| Notes | PARTIAL | Add note works; edit/archive note policy remains open. |
| Timeline | READY foundation | Uses `AuditLog` as CRM activity feed. |
| Production readiness | NO | This is not a production-readiness PR. |
