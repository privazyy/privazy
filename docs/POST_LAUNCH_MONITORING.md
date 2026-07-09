# Post-Launch Monitoring

Status: **BLOCKED - monitoring must be configured before launch**

## Metrics and alerts

| Area | Signal | Owner | Required before launch |
| --- | --- | --- | --- |
| Uptime | Production availability | Ops | Yes |
| 5xx | App/API error rate | Ops/Engineering | Yes |
| Auth errors | Login/session failures | Security/Engineering | Yes |
| Checkout errors | Cart/checkout failures | Payments/Engineering | Before checkout |
| Payment failures | Failed/duplicate/missing events | Payments | Before live payments |
| Webhook failures | Signature or processing failures | Engineering | Before provider launch |
| Document generation | Failed jobs and retries | Engineering/Ops | Before generator |
| R2 failures | Upload/download/signing errors | Ops | Before generator |
| Email failures | Resend errors/bounces | Ops/Support | Before emails |
| Inngest failures | Failed or repeated runs | Engineering/Ops | Before automations |
| Lead form errors | Failed IOD leads | Sales/Engineering | Yes |
| CRM errors | Admin panel/API failures | Engineering | Yes |
| Portal errors | Client portal 4xx/5xx anomalies | Engineering/Support | Before portal |
| Database errors | Connection/migration/query failures | DB/Ops | Yes |
| Response time | p95/p99 latency | Ops | Yes |

## Hypercare windows

| Window | Cadence | Required action |
| --- | --- | --- |
| First 1 hour | Continuous | Watch dashboard, payment/provider logs, errors, support inbox. |
| First 24 hours | Hourly | Review incidents, failed jobs, lead/checkout/document outcomes. |
| First 7 days | Daily | Review trends, support themes, manual document/payment checks. |
| First 30 days | Weekly | Decide whether to scale marketing and reduce manual checks. |

## Launch cannot open real traffic until

- Alert routing is tested.
- Incident owner and backup are online.
- Test error reaches monitoring.
- Provider dashboards are accessible.
- Support process is active.
