# DSR Deadlines

## Default Deadline

On submit, the module calculates `dueAt` as one calendar month after `receivedAt`.

## Extension

CRM staff can store:

- `extensionUntil`
- `extensionReason`

When `extensionUntil` is later than the default deadline, the effective `dueAt` is updated to the extension date.

## Gaps

- No notification automation.
- No escalation workflow.
- No background job for overdue reminders.
