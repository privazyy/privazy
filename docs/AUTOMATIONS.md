# AUTOMATIONS

Phase 10R adds a controlled event-driven automation layer for PRIVAZY. It does not deploy production, start newsletter campaigns, or move trusted payment/legal decisions into background workers.

## Architecture

- `src/server/events/event-types.ts` is the event catalog.
- `src/server/events/emit-event.ts` writes `EventLog` and sends the event to Inngest.
- `src/server/automations/run.ts` writes `AutomationRun` and records attempts, failure and retry state.
- `src/server/automations/idempotency.ts` centralizes keys for events, reminders and e-mail.
- `src/server/automations/notifications.ts` writes CRM and portal notifications.
- `src/server/email/send-email.ts` writes `EmailLog` and uses Resend only when env is configured.
- `src/server/inngest/functions.ts` contains workers and schedules.

## Rules

Automations are additive. Payment provider/webhook remains the source of truth for payment status. Breach and data-subject workflows create reminders and tasks, but do not make legal decisions for the lawyer/IOD.

Every important workflow has:

- owner role,
- trigger event,
- minimal payload,
- idempotency key,
- `EventLog`,
- `AutomationRun`,
- notification, task, e-mail log or audit trace.

## CRM

The CRM `automations` module now reads:

- `EventLog`,
- `AutomationRun`,
- `EmailLog`,
- `Notification`.

`READ_ONLY` can read according to CRM route policy, but cannot retry. Manual retry is server-side only and re-emits a known event from the stored event log.

## Production limits

Before production:

- apply the migration on the reviewed Supabase project,
- review RLS and Data API grants for all new tables,
- configure Inngest signing/env,
- configure Resend env,
- decide the manual retry UI and escalation policy,
- add integration tests in Phase 11R.
