# CRM operational workflow

This PR turns lead and organization records into daily work surfaces:

1. Staff opens a lead or organization detail.
2. Staff adds an internal note with a controlled type.
3. Staff creates a task linked to that record.
4. Staff assigns the task or changes its status.
5. CRM writes `AuditLog` and `CrmActivity`.
6. The timeline shows what happened without exposing raw payloads.

## Still out of scope

- E-mail reminders.
- Inngest automation.
- Client-visible notes or messages.
- Calendar sync.
- Reporting dashboards.
- Production launch readiness.

Next recommended PR: `[crm] add orders payments invoices and document operations`.
