# AUTOMATION_RUNBOOK

Use this runbook when a workflow fails.

## Diagnosis

1. Open CRM -> Automatyzacje.
2. Check `EventLog.status`.
3. Check matching `AutomationRun.status`, attempts, `errorMessage` and `nextRetryAt`.
4. Check `EmailLog` if the failure is mail-related.
5. Check the target record in CRM or `/platforma`.

## Retry policy

- Retry only `FAILED` or `RETRY_PENDING` runs.
- `READ_ONLY` cannot retry.
- Payment status must not be changed from a retry event. Use provider/webhook reconciliation.
- Breach/DSR retries may create reminders and tasks only; legal decisions require human review.

## Dead letter handling

If the same workflow exhausts attempts:

- leave `AutomationRun.status = FAILED`,
- create or update the internal CRM task,
- keep client-facing status generic,
- escalate to ADMIN/LAWYER depending on owner role.

## Production checklist

- Review Supabase RLS and explicit grants/Data API exposure for new tables.
- Configure Inngest signing and environment variables.
- Configure Resend.
- Add test runner and integration tests in Phase 11R.
- Decide whether manual retry needs a dedicated UI beyond the CRM list foundation.
