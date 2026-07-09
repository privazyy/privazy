# Incident Response Runbook

Status: **BLOCKED - owners and tooling not confirmed**

For every incident, record timestamp, owner, severity, customer impact, mitigation, rollback/disable action and postmortem link.

| Scenario | Detection | Severity | Owner | Immediate action | Customer communication | Rollback/disable switch | Postmortem |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Payment failure | Payment/webhook alert, support ticket | SEV1/SEV2 | Payments/Engineering | Disable live payments, keep checkout sandbox or pause checkout | Notify affected buyers | `ENABLE_LIVE_PAYMENTS=false`, maybe `ENABLE_CHECKOUT=false` | Required |
| Duplicate payment | Reconciliation mismatch | SEV1 | Payments/Finance | Stop live payments, identify affected orders | Direct customer contact and refund path | `ENABLE_LIVE_PAYMENTS=false` | Required |
| Document generation outage | Failed job alert | SEV2 | Engineering/Ops | Disable generation, queue/manual fallback | Inform affected clients | `ENABLE_DOCUMENT_GENERATION=false` | Required |
| R2 outage | Upload/download/sign URL errors | SEV2 | Ops | Disable downloads/generation if unsafe | Inform clients about delay | `ENABLE_DOCUMENT_GENERATION=false` | Required |
| Email outage | Resend failures/bounces | SEV2/SEV3 | Ops/Support | Pause email-dependent flows, use manual contact if critical | Status update if user-visible | Disable email sends if available | Required if customer impact |
| Auth outage | Login error spike | SEV1 | Security/Engineering | Enable maintenance for private app, investigate provider/config | Status page/support update | `MAINTENANCE_MODE=true` | Required |
| Database outage | DB connection/error alert | SEV1 | DB/Ops | Maintenance mode, stop writes, contact provider | Status update | `MAINTENANCE_MODE=true` | Required |
| Data access incident | Report or anomaly | SEV1 | Security/DPO | Freeze affected access, preserve logs, assess breach notification | Legal/DPO-approved only | Disable affected module | Required |
| Wrong document delivered | Customer/support report | SEV1 | Legal/Engineering | Disable downloads/generation, investigate org ACL | Direct legal-approved contact | `ENABLE_DOCUMENT_GENERATION=false` | Required |
| Public site outage | Uptime alert | SEV2 | Ops | Rollback deployment or maintenance page | Status update if prolonged | Vercel rollback | Required if prolonged |
| Automation spam/loop | Inngest/email/event spike | SEV1/SEV2 | Engineering/Ops | Disable automations, stop provider sends | Notify affected users if needed | `ENABLE_AUTOMATIONS=false` | Required |

## Severity guide

- SEV1: security, payments, data access, full outage or wrong document.
- SEV2: major module unavailable or customer-impacting failures.
- SEV3: degraded operation with manual workaround.

## Communication rule

No customer-facing admission, legal promise, refund promise or breach notice without assigned business/legal approval.
