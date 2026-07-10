# CRM tasks workflow

## Statuses

- `OPEN`
- `IN_PROGRESS`
- `DONE`
- `CANCELLED`

## Workflow

1. Create a task linked to a lead or organization.
2. Assign it to a staff user.
3. Filter by status, priority, assignee, due date, overdue/today/upcoming, lead or organization.
4. Move to `IN_PROGRESS`.
5. Complete task through `POST /api/crm/tasks/[taskId]/complete`.
6. Cancel task through `POST /api/crm/tasks/[taskId]/cancel`.

## Notes

`DONE` sets `completedAt` server-side. `CANCELLED` is represented by status plus audit log because the schema does not yet include `cancelledAt`.
