# Monitoring and Alerting

Status: `MANUAL_REQUIRED`. This PR defines the monitoring plan but does not configure production monitoring services.

## What to Monitor

| Signal | Threshold | First responder | Action |
| --- | --- | --- | --- |
| 5xx errors | Any sustained spike or more than 3 in 10 minutes | Technical owner | Check Vercel logs, enable maintenance if user-impacting |
| Auth failures spike | More than 10 failures in 10 minutes | Technical owner | Check auth callback/session errors |
| Failed document jobs | Any failed job during soft launch | Technical + legal owner | Disable generation until reviewed |
| R2 upload errors | Any during document flow | Technical owner | Disable generation/downloads |
| Download errors | Any permission or file-not-found spike | Technical owner | Verify tenant scope and signed URLs |
| Payment failures | Any live payment failure | Finance + technical owner | Disable checkout/live payments |
| Invoice failures | Any live invoice failure | Finance/legal owner | Disable invoices/live invoices |
| Email failures | More than 3 consecutive failures | Support + technical owner | Disable email sending |
| Breach/DSR deadline failures | Any missed deadline | Legal/privacy owner | Escalate severity |
| Queue/worker failures | Any sustained Inngest failure | Technical owner | Pause affected async flows |
| DB connection errors | Any repeated error | Technical owner | Enable maintenance if writes affected |

## Where to Look

- Vercel deployments, runtime logs and build logs.
- Supabase project dashboard for database/API/storage status.
- Inngest dashboard for async jobs.
- Email provider dashboard if email sending is enabled.
- Payment and invoice provider dashboards only after separate approval.
- Internal support issue log.

## Response Rules

- During `STAGING_NO_GO`, monitoring gaps block launch execution.
- During a conditional soft launch, all critical alerts must have a named responder.
- If a privacy/security alert is unclear, treat it as severity 1 until triaged.
