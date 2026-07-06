# INNGEST_WORKFLOWS

Inngest is served from `/api/inngest` and loads `src/server/inngest/functions.ts`.

## Functions

- `order-created` handles `order.created.v1`.
- `payment-succeeded-follow-up` handles `order.payment.succeeded.v1`.
- `payment-failed-follow-up` handles `order.payment.failed.v1`.
- `invoice-issue-requested` handles `invoice.issue.requested.v1`.
- `generate-document` handles `document.generate.requested.v1`.
- `document-succeeded-follow-up` handles `document.generate.succeeded.v1`.
- `document-failed-follow-up` handles `document.generate.failed.v1`.
- `newsletter-subscriber-created` handles `newsletter.subscriber.created.v1`.
- `blog-post-published` handles `blog.post.published.v1`.
- `daily-crm-report-requested` and `weekly-operations-report-requested` create internal aggregate notifications.

## Schedules

- `deadline-scanner`: hourly, emits breach, DSR and task reminder events.
- `daily-crm-report`: weekdays at 07:00, emits `report.daily_crm.requested.v1`.
- `weekly-operations-report`: Mondays at 08:00, emits `report.weekly_operations.requested.v1`.

## Failure mode

Workers call `runAutomation`, which writes `AutomationRun`. Errors mark a run as `RETRY_PENDING` until max attempts are exhausted, then `FAILED`. Technical details are visible internally in CRM, not in portal client copy.
