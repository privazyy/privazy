# Release Runbook

Status: **BLOCKED**

This is the release index for controlled launch preparation. Do not execute production release steps until GO approval exists.

## Required documents

- `docs/FINAL_PRE_LAUNCH_CHECKLIST.md`
- `docs/PRODUCTION_ENV_CHECKLIST.md`
- `docs/FEATURE_FLAGS_LAUNCH_SWITCHES.md`
- `docs/MAINTENANCE_MODE.md`
- `docs/PRODUCTION_MIGRATION_RUNBOOK.md`
- `docs/CONTROLLED_LAUNCH_RUNBOOK.md`
- `docs/PRODUCTION_SMOKE_TESTS.md`
- `docs/PAYMENT_LIVE_SWITCH_RUNBOOK.md`
- `docs/INVOICE_LIVE_SWITCH_RUNBOOK.md`
- `docs/LEGAL_LAUNCH_APPROVAL.md`
- `docs/POST_LAUNCH_MONITORING.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK.md`
- `docs/SUPPORT_OPERATIONS.md`
- `docs/SOFT_LAUNCH_PLAN.md`
- `docs/MARKETING_LAUNCH_GATE.md`
- `docs/ROLLBACK_DRILL.md`

## Release rule

The release owner must stop if any P0 blocker, missing approval, missing backup, missing monitoring, failed smoke test or unresolved legal/payment approval remains.
