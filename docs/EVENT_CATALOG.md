# EVENT_CATALOG

All application events use version suffix `v1` and minimal payloads. Workers fetch sensitive details from the database by ID.

## Lead

- `lead.iod.submitted.v1`
- `lead.contact.submitted.v1`
- `lead.assigned.v1`
- `lead.status.changed.v1`

## Checkout and order

- `order.created.v1`
- `order.payment.pending.v1`
- `order.payment.succeeded.v1`
- `order.payment.failed.v1`
- `order.cancelled.v1`

## Payments and invoices

- `payment.webhook.received.v1`
- `payment.reconciliation.failed.v1`
- `invoice.issue.requested.v1`
- `invoice.issued.v1`
- `invoice.failed.v1`

## Documents

- `document.input.saved.v1`
- `document.input.submitted.v1`
- `document.generate.requested.v1`
- `document.generate.succeeded.v1`
- `document.generate.failed.v1`
- `document.review.required.v1`
- `document.review.approved.v1`
- `document.downloaded.v1`

## CRM

- `crm.task.created.v1`
- `crm.task.due_soon.v1`
- `crm.task.overdue.v1`
- `crm.note.created.v1`

## Breaches

- `breach.created.v1`
- `breach.deadline.24h.v1`
- `breach.deadline.6h.v1`
- `breach.overdue.v1`
- `breach.status.changed.v1`

## Data subject requests

- `dsr.created.v1`
- `dsr.deadline.7d.v1`
- `dsr.deadline.2d.v1`
- `dsr.overdue.v1`
- `dsr.status.changed.v1`

## Portal and messages

- `client.message.created.v1`
- `client.task.completed.v1`

## CMS and newsletter

- `blog.post.published.v1`
- `newsletter.subscriber.created.v1`
- `newsletter.double_opt_in.requested.v1`
- `newsletter.unsubscribe.v1`

## Reports

- `report.daily_crm.requested.v1`
- `report.weekly_operations.requested.v1`

## Critical events

Critical: payment settlement follow-up, invoice issue request, document generation request, document generation success/failure.

Fire-and-forget: CRM notes/tasks, CMS publish notifications, newsletter double opt-in foundation, aggregate reports.
