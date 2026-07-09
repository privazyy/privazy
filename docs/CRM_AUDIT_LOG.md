# CRM Audit Log

CRM mutations write `AuditLog` in the same Prisma transaction as the resource change.

Events include:

- `crm.lead.public_created`, `crm.lead.created`, `crm.lead.updated`
- `crm.lead.status_changed`, `crm.lead.assigned`, `crm.lead.note_added`
- `crm.lead.converted`
- `crm.organization.created`, `crm.organization.updated`, `crm.organization.archived`
- `crm.organization.note_added`

Metadata is allowlisted: changed field names, before/after status, assignee ID, source and related resource IDs. It never includes passwords, secrets, raw request bodies, full checker payloads or note contents. Public intake can record request IP/user-agent in the dedicated existing audit columns.
## Operational activity

Notes and tasks write formal `AuditLog` entries for mutation evidence and `CrmActivity` entries for the readable operational timeline.

Logged examples:

- `crm.note.created`
- `crm.note.updated`
- `crm.task.created`
- `crm.task.updated`
- `crm.task.assigned`

Activity examples:

- `NOTE_ADDED`
- `NOTE_UPDATED`
- `TASK_CREATED`
- `TASK_UPDATED`
- `TASK_ASSIGNED`
- `TASK_COMPLETED`
- `TASK_CANCELLED`

Metadata is minimized and must not include note bodies, raw request bodies, secrets or storage keys.
