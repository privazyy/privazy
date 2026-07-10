# CRM API

All endpoints below are staff CRM endpoints. `CLIENT` must not use them.

## Leads

- `GET /api/crm/leads`
- `POST /api/crm/leads`
- `GET /api/crm/leads/[leadId]`
- `PATCH /api/crm/leads/[leadId]`
- `PATCH /api/crm/leads/[leadId]/status`
- `PATCH /api/crm/leads/[leadId]/assign`
- `POST /api/crm/leads/[leadId]/notes`
- `POST /api/crm/leads/[leadId]/contacts`
- `POST /api/crm/leads/[leadId]/tasks`
- `GET /api/crm/leads/[leadId]/timeline`
- `POST /api/crm/leads/[leadId]/convert`

## Organizations

- `GET /api/crm/organizations`
- `POST /api/crm/organizations`
- `GET /api/crm/organizations/[organizationId]`
- `PATCH /api/crm/organizations/[organizationId]`
- `POST /api/crm/organizations/[organizationId]/contacts`
- `POST /api/crm/organizations/[organizationId]/notes`
- `POST /api/crm/organizations/[organizationId]/tasks`
- `GET /api/crm/organizations/[organizationId]/timeline`

## Tasks And Activity

- `GET /api/crm/tasks`
- `POST /api/crm/tasks`
- `GET /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]/status`
- `GET /api/crm/activity`
- `GET /api/crm/users`

All writes are Zod-validated and use safe CRM error responses.
