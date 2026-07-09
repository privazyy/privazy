# CRM API

All endpoints below require a staff CRM session. Read endpoints allow `READ_ONLY`; mutations require `ADMIN`, `LAWYER` or `OPERATOR`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET, POST | `/api/crm/leads` | Paginated list / manual create |
| GET, PATCH | `/api/crm/leads/:leadId` | Detail / validated update |
| PATCH | `/api/crm/leads/:leadId/status` | Status change |
| PATCH | `/api/crm/leads/:leadId/assign` | Staff assignment |
| POST | `/api/crm/leads/:leadId/notes` | Internal note |
| POST | `/api/crm/leads/:leadId/convert` | Safe conversion |
| GET, POST | `/api/crm/organizations` | Paginated list / create |
| GET, PATCH | `/api/crm/organizations/:organizationId` | Detail / update or archive |
| POST | `/api/crm/organizations/:organizationId/notes` | Internal note |
| GET | `/api/crm/users` | Operational assignee options |

Lead list filters: `q`, `status`, `source`, `assignedToId`, `cursor`, `limit`.

Organization list filters: `q`, `status`, `industry`, `ownerId`, `cursor`, `limit`.

Unknown query/body fields are rejected. Errors use stable codes and safe messages; Prisma errors and stack traces are not returned. List serializers are smaller than detail serializers and omit raw snapshots/source metadata.
## Tasks, notes and timeline

This PR adds the operational CRM endpoints:

- `GET /api/crm/leads/[leadId]/notes`
- `POST /api/crm/leads/[leadId]/notes`
- `GET /api/crm/organizations/[organizationId]/notes`
- `POST /api/crm/organizations/[organizationId]/notes`
- `PATCH /api/crm/notes/[noteId]`
- `GET /api/crm/tasks`
- `POST /api/crm/tasks`
- `GET /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]/status`
- `PATCH /api/crm/tasks/[taskId]/assign`
- `GET /api/crm/leads/[leadId]/timeline`
- `GET /api/crm/organizations/[organizationId]/timeline`

All endpoints require CRM read access. Mutations require CRM write access.
