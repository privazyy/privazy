# Post-Launch Monitoring Schedule

Use this schedule only after a launch decision changes from `DO_NOT_LAUNCH`.

| Window | What to check | Owner | Metrics | Decision |
| --- | --- | --- | --- | --- |
| First 15 minutes | Homepage, auth, `/api/health`, `/api/launch/status`, logs | Technical owner | 5xx, auth errors, latency | Continue or maintenance |
| First hour | First user flows, CRM lead visibility, document job, download | Technical + support | failed jobs, support tickets, download errors | Continue, pause or rollback |
| First 4 hours | Email, storage, DB connections, support volume | Technical + support | email failures, R2 errors, DB errors, tickets | Keep scope or freeze invites |
| First day | Legal/support feedback, unresolved incidents, monitoring gaps | Product + legal + support | open SEV1/SEV2, response time | Decide next users |
| First 3 days | Repeated bugs, user completion rate, manual workload | Product + support | task completion, tickets/user | Expand, hold or rollback |
| First week | Risk register, legal/commercial readiness, backlog | Product + technical + legal | blocker count, incident count | Decide next launch phase |

If any SEV1 occurs, stop expansion immediately and follow `INCIDENT_RESPONSE_RUNBOOK.md`.
