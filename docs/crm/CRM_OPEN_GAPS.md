# CRM Open Gaps

Current state after the operational-system integration. These gaps do not turn the active CRM navigation into a mock, but they block a production-readiness claim.

| Gap | Severity | Status | Required follow-up |
| --- | --- | --- | --- |
| Production migration rehearsal | P0 | Blocked by missing database environment | Run all migrations against a disposable PostgreSQL/Supabase database, then staging |
| Live payment and invoice providers | P1 | Intentionally disabled | Configure providers, webhook verification, idempotency and reconciliation |
| Secure generated-file storage | P1 | Environment dependent | Configure private storage, signed downloads and retention |
| Public IOD abuse protection | P1 | Open | Add Turnstile and rate limiting |
| Persistent staff notification inbox | P2 | Open | Add notification/read-state model if computed dashboard alerts are insufficient |
| Note edit/archive lifecycle | P2 | Open | Add immutable revision/archive operations if required by policy |
| Production observability and rollback | P0 | Open | Configure monitoring, alerting, backup/restore and rollback drill |

The active sidebar contains only database-backed modules: core CRM, commerce, document operations, breaches, DSR and audit log.
