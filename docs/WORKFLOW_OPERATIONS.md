# Workflow Operations

Status: **BLOCKED - production automations not verified**

## Required before automations

- `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` set in production secrets.
- Workflow signing verified.
- Event idempotency tested.
- Retry policy documented.
- Alerting for failed runs configured.
- `ENABLE_AUTOMATIONS=false` remains default until smoke passes.

## Smoke test

1. Trigger non-destructive test event.
2. Verify workflow run starts once.
3. Verify success/failure status is visible.
4. Verify duplicate event is ignored or deduplicated.
5. Verify failed run alert reaches owner.

## Stop conditions

- Signing cannot be verified.
- Workflow loops or sends duplicate emails.
- Failed runs are not visible to the owner.
- Disable switch is missing.
