# CRM tasks

CRM tasks are internal operational work items linked to a lead or organization.

## Access

- `ADMIN`, `LAWYER`, `OPERATOR`: read, create and update tasks.
- `READ_ONLY`: read tasks only.
- `CLIENT`: no CRM task access.
- Unauthenticated requests receive `401`.

## Data model

`CrmTask` stores title, optional description, status, priority, due date, assignee, creator and completion/cancellation timestamps. Tasks must be linked to a lead or organization.

## Statuses

- `OPEN`
- `IN_PROGRESS`
- `DONE`
- `CANCELLED`

`completedAt` and `cancelledAt` are set server-side.

## API

- `GET /api/crm/tasks`
- `POST /api/crm/tasks`
- `GET /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]`
- `PATCH /api/crm/tasks/[taskId]/status`
- `PATCH /api/crm/tasks/[taskId]/assign`

Lists are limited and cursor-capable. Filters include status, priority, assignee, lead, organization, due dates and search.
