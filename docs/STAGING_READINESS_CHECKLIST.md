# Staging Readiness Checklist

Current status: `NO`

| Check | Status | Notes |
| ----- | ------ | ----- |
| Staging URL exists | MANUAL_VERIFICATION_REQUIRED | Verify Vercel preview/staging alias. |
| Staging database exists | MANUAL_VERIFICATION_REQUIRED | Verify Supabase staging project. |
| Staging migrations applied | MANUAL_VERIFICATION_REQUIRED | Requires real `DATABASE_URL`/`DIRECT_URL`. |
| Staging seed/admin user | MANUAL_VERIFICATION_REQUIRED | Must not use production credentials. |
| Staging R2 bucket | MANUAL_VERIFICATION_REQUIRED | Private bucket only. |
| Staging Resend/test mode | MANUAL_VERIFICATION_REQUIRED | Use verified test sender/domain. |
| Staging Inngest env | MANUAL_VERIFICATION_REQUIRED | Separate from production. |
| Staging Turnstile keys | MANUAL_VERIFICATION_REQUIRED | Separate site/secret keys. |
| Payment sandbox/mock | MANUAL_VERIFICATION_REQUIRED | Live payments disabled. |
| Invoice mock/sandbox | MANUAL_VERIFICATION_REQUIRED | No live invoice integration in this PR. |
| Auth callback URL | MANUAL_VERIFICATION_REQUIRED | Must match staging URL. |
| Staging smoke tests | MANUAL_VERIFICATION_REQUIRED | Public, auth, DB, API, Inngest, email. |
| Staging backup | MANUAL_VERIFICATION_REQUIRED | Confirm before migrations. |
| Staging monitoring | MANUAL_VERIFICATION_REQUIRED | 5xx, DB, jobs, email, webhook failures. |

