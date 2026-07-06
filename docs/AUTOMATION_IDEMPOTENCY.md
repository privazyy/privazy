# AUTOMATION_IDEMPOTENCY

Idempotency helpers live in `src/server/automations/idempotency.ts`.

## Event keys

Examples:

- `order-created:{orderId}`
- `payment-succeeded:{paymentId}`
- `payment-failed:{paymentId}`
- `invoice-issue:{orderId}`
- `document-generate:{jobId}`
- `document-succeeded:{generatedDocumentId}`
- `breach-reminder:{breachId}:24h`
- `dsr-reminder:{requestId}:7d`
- `task-reminder:{taskId}:overdue`
- `email:{template}:{resourceId}:{recipient}`

## Enforcement

- `EventLog.idempotencyKey` is unique.
- `AutomationRun.idempotencyKey` is unique.
- `EmailLog.idempotencyKey` is unique.
- Existing dispatched/processed events are not sent to Inngest again by `emitEvent`.
- Notifications and tasks check for an existing entity/type pair before creating another record.

## Retry

Retries use a new manual retry event key, but the new event payload is derived from the original stored event log. This gives an explicit retry trail instead of mutating history.
