# Monitoring and Alerting Readiness

Status: `MISSING`

| Area | Required alert | Status |
| ---- | -------------- | ------ |
| App errors | 5xx rate and unhandled exceptions | MISSING |
| API errors | Route handler 5xx spikes | MISSING |
| Auth errors | sign-in/session callback failures | MISSING |
| Database errors | Prisma initialization/query failures | MISSING |
| Document jobs | failed or stuck generation jobs | MISSING |
| Payments | failed payment/webhook events | NOT_APPLICABLE until payments exist |
| Emails | Resend send failures | MISSING |
| Inngest | failed runs/retries exhausted | MISSING |
| R2 | upload/download/signing failures | MISSING |
| Lead forms | form submission failures | MISSING |
| Breach/DSR | overdue breach/DSR tasks | NOT_APPLICABLE until models exist |

Recommended minimum:

- Sentry or equivalent for server errors.
- Vercel runtime logs and alerting for 5xx.
- Inngest failure alerts.
- Supabase database health/connection alerts.
- Operational dashboard for failed document jobs and email failures.

