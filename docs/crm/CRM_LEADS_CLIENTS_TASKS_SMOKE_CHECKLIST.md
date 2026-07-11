# CRM leads, clients and tasks smoke checklist

## Auth

- [ ] Unauthenticated user cannot open `/crm`.
- [ ] CLIENT cannot open `/crm`.
- [ ] CLIENT cannot use `/api/crm/*`.
- [ ] READ_ONLY can read lists/details.
- [ ] READ_ONLY cannot create/update/archive/complete.
- [ ] OPERATOR can create and mutate operational records.
- [ ] ADMIN can create, edit and archive.

## Dashboard

- [ ] Dashboard loads.
- [ ] KPI cards use DB values.
- [ ] Empty database shows controlled empty states.
- [ ] Alerts show unassigned leads and overdue tasks when present.

## Leads

- [ ] Add lead.
- [ ] Edit lead status, priority and assignee.
- [ ] Add note.
- [ ] Add task.
- [ ] Convert lead.
- [ ] Archive lead.
- [ ] Timeline shows mutation events.

## Clients and organizations

- [ ] Add organization.
- [ ] Edit organization status and owner.
- [ ] Add contact.
- [ ] Edit contact.
- [ ] Set primary contact.
- [ ] Add note.
- [ ] Add task.
- [ ] Archive organization.
- [ ] Timeline shows mutation events.

## Tasks

- [ ] Add task.
- [ ] Assign task.
- [ ] Mark task in progress.
- [ ] Complete task.
- [ ] Cancel task.
- [ ] Overdue and today counters update from DB.

## Security and errors

- [ ] API returns safe error payloads.
- [ ] API does not expose Prisma stack traces.
- [ ] Lists enforce `limit` and cursor pagination.
