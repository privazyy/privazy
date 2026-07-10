# Automation and Notification Audit

| Area | Actual on `main` | Decision |
| --- | --- | --- |
| Event log | `AuditLog` exists; no generic event log | PARTIAL |
| Notification creation | No Notification model/API | MISSING |
| EmailLog | No EmailLog model/API | MISSING |
| Mock/disabled/resend mode | Resend helper exists; no mode flag | PARTIAL |
| Idempotency | `/api/documents/generate` forwards optional Inngest ID | PARTIAL |
| Order paid notification | Missing order/payment flow | MISSING |
| Document ready notification | Resend helper exists, no integrated flow evidence | PARTIAL |
| Breach deadline reminder | Missing breach flow | MISSING |
| DSR deadline reminder | Missing DSR flow | MISSING |
| Staff notification scope | Missing | MISSING |
| Client notification scope | Missing | MISSING |
| No marketing email without consent | Newsletter missing on `main` | MANUAL_REQUIRED |
| No duplicate emails | No EmailLog/idempotency table | MISSING |
| No sensitive payload in event logs | Not broadly verifiable | MANUAL_REQUIRED |

Decision: `STAGING_NO_GO`.
