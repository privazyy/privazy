# Environment and Secrets Staging Verification

No real secrets were read or committed. This audit used `.env.example` and repo scripts only.

| Area | Variables | Repo status | Staging status |
| --- | --- | --- | --- |
| App URLs | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`, `NEXTAUTH_URL` | Documented | MANUAL_REQUIRED |
| Auth secrets | `AUTH_SECRET`, `NEXTAUTH_SECRET` | Documented placeholders | MANUAL_REQUIRED |
| Supabase public | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Documented | MANUAL_REQUIRED |
| Supabase private | `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD` | Documented | MANUAL_REQUIRED |
| Database | `DATABASE_URL`, `DIRECT_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` | Documented | MANUAL_REQUIRED |
| Turnstile | `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Documented | MANUAL_REQUIRED; no code enforcement found |
| R2 | `CLOUDFLARE_R2_*`, `R2_*` | Documented | MANUAL_REQUIRED |
| Resend | `RESEND_API_KEY`, `RESEND_FROM` | Documented | MANUAL_REQUIRED |
| Inngest | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Documented | MANUAL_REQUIRED |
| Payment mode flags | Expected | Missing from `.env.example` | MISSING |
| Invoice mode flags | Expected | Missing from `.env.example` | MISSING |
| Live payments disabled | Expected | No payment implementation/flags | MANUAL_REQUIRED |
| Live invoices disabled | Expected | No invoice implementation/flags | MANUAL_REQUIRED |

Script evidence:

- `npm run env:check`: MISSING.
- `npm run env:check:staging`: MISSING.

Decision: `BLOCKED` for staging RC until real non-production env values are configured and verified outside repo.
