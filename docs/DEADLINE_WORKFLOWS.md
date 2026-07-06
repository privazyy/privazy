# DEADLINE_WORKFLOWS

The hourly `deadline-scanner` emits reminder events. It does not close, approve, reject, notify an authority, or answer a data subject automatically.

## Breaches

Active `BreachIncident` records with `authorityDueAt` are scanned. Closed and archived records are ignored.

Events:

- `breach.deadline.24h.v1`
- `breach.deadline.6h.v1`
- `breach.overdue.v1`

Automation creates CRM notifications and internal tasks. Reminder keys prevent duplicate reminders for the same incident/window.

## Data subject requests

Active `DataSubjectRequest` records with `dueAt` are scanned. Closed and archived records are ignored.

Events:

- `dsr.deadline.7d.v1`
- `dsr.deadline.2d.v1`
- `dsr.overdue.v1`

Automation creates CRM notifications and internal tasks for review.

## Tasks

Open CRM tasks due within 24h emit `crm.task.due_soon.v1`. Overdue tasks emit `crm.task.overdue.v1`.
