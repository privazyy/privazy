# CRM tasks, notes and timeline smoke checklist

Use a non-production database or a controlled preview environment.

## API permissions

- [ ] Unauthenticated `GET /api/crm/tasks` returns `401`.
- [ ] CLIENT cannot access notes, tasks or timeline.
- [ ] READ_ONLY can read notes, tasks and timeline.
- [ ] READ_ONLY cannot create/update notes.
- [ ] READ_ONLY cannot create/update/complete tasks.
- [ ] OPERATOR can create note and task.
- [ ] LAWYER can create note and task.
- [ ] ADMIN can create note and task.

## Notes

- [ ] Note requires body.
- [ ] Note body max length is enforced.
- [ ] Note author comes from session.
- [ ] Note creates `AuditLog` and `CrmActivity`.
- [ ] Note serializer does not return raw metadata.

## Tasks

- [ ] Task requires title.
- [ ] Task priority and status enums are validated.
- [ ] Task due date is validated.
- [ ] Task creator comes from session.
- [ ] Task completion sets `completedAt` server-side.
- [ ] Task cancellation sets `cancelledAt` server-side.

## Timeline

- [ ] Lead timeline includes notes, tasks, activity and audit events.
- [ ] Organization timeline includes notes, tasks, activity and audit events.
- [ ] Timeline uses limit/cursor.
- [ ] Timeline does not expose secrets, raw request body or storage keys.

## UI

- [ ] Lead detail shows note composer, task form, task list and timeline.
- [ ] Organization detail shows note composer, task form, task list and timeline.
- [ ] General CRM tasks module shows real task rows.
- [ ] READ_ONLY sees disabled/no mutation actions.
