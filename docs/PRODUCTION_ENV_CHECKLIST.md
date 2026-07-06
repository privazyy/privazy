# Production Environment Checklist

Status: **BLOCKED - do not store values in repo**

This checklist lists environment variable names only. Real values must live in Vercel, Supabase, provider dashboards, or GitHub Actions secrets.

| Category | Env name | Required | Environment | Owner | Verification method |
| --- | --- | --- | --- | --- | --- |
| App URLs | `NEXT_PUBLIC_SITE_URL` | Yes | Production | Ops | Open production URL and canonical links |
| App URLs | `NEXT_PUBLIC_APP_URL` | Yes, fallback | Production | Ops | Verify app uses production domain |
| Auth | `AUTH_URL` | Yes | Production | Ops | Auth callback matches production domain |
| Auth | `AUTH_SECRET` | Yes | Production | Ops/Security | Present as secret, not public |
| Auth | `NEXTAUTH_URL` | Compatibility | Production | Ops | Matches `AUTH_URL` if used |
| Auth | `NEXTAUTH_SECRET` | Compatibility | Production | Ops/Security | Present only if runtime uses it |
| Database | `DATABASE_URL` | Yes | Production | DB/Ops | Pooled production DB connection tested |
| Database | `DIRECT_URL` | Yes for migrations | Production | DB/Ops | Direct migration connection tested |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` | Yes if client used | Production | Ops | Public project URL only |
| Supabase | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes if client used | Production | Ops/Security | Public anon/publishable key only |
| Supabase | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preferred if used | Production | Ops/Security | Public publishable key only |
| Supabase | `SUPABASE_PROJECT_REF` | Yes | Production | Ops | Matches production project |
| Supabase | `SUPABASE_ACCESS_TOKEN` | Automation only | CI/Ops | Ops/Security | Stored as secret |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Server only | Production | Security | Not exposed as `NEXT_PUBLIC_*` |
| Cloudflare R2 | `R2_ACCOUNT_ID` | Yes | Production | Ops | Account verified |
| Cloudflare R2 | `R2_ACCESS_KEY_ID` | Yes | Production | Ops/Security | Restricted key present |
| Cloudflare R2 | `R2_SECRET_ACCESS_KEY` | Yes | Production | Ops/Security | Secret present |
| Cloudflare R2 | `R2_BUCKET` | Yes | Production | Ops | Private bucket verified |
| Cloudflare R2 | `R2_ENDPOINT` | Yes | Production | Ops | S3 endpoint verified |
| Cloudflare R2 | `CLOUDFLARE_R2_BUCKET` | Compatibility | Production | Ops | Align with app code if used |
| Resend | `RESEND_API_KEY` | Yes if email enabled | Production | Ops | Domain and sender verified |
| Resend | `RESEND_FROM` | Yes if email enabled | Production | Ops/Legal | Approved sender address |
| Inngest | `INNGEST_EVENT_KEY` | Yes if automations enabled | Production | Ops/Engineering | Event send test |
| Inngest | `INNGEST_SIGNING_KEY` | Yes if automations enabled | Production | Ops/Security | Webhook signature test |
| Payment provider | `PAYMENT_PROVIDER` | Yes if checkout enabled | Production | Payments | Must not be live without approval |
| Payment provider | `PAYMENT_LIVE_SECRET_KEY` | Conditional | Production | Payments/Security | Manual approval required |
| Payment provider | `PAYMENT_WEBHOOK_SECRET` | Conditional | Production | Payments/Security | Signature verification test |
| Invoice provider | `INVOICE_PROVIDER` | Conditional | Production | Finance | Provider selected |
| Invoice provider | `INVOICE_API_KEY` | Conditional | Production | Finance/Security | Secret present |
| Turnstile | `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Conditional | Production | Security | Public site key only |
| Turnstile | `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Conditional | Production | Security | Server-side verification test |
| Monitoring | `SENTRY_DSN` or provider equivalent | Conditional | Production | Ops | Test error received |
| Maintenance mode | `MAINTENANCE_MODE` | Yes before launch | Production | Ops | Toggle tested in staging |
| Feature flags | `ENABLE_CHECKOUT` | Yes before launch | Production | Product/Engineering | Disabled by default until approved |
| Feature flags | `ENABLE_LIVE_PAYMENTS` | Yes before launch | Production | Business/Finance | Disabled by default |
| Feature flags | `ENABLE_DOCUMENT_GENERATION` | Yes before launch | Production | Engineering | Disabled until smoke passes |
| Feature flags | `ENABLE_CLIENT_PORTAL` | Yes before launch | Production | Engineering | Disabled until portal smoke passes |
| Feature flags | `ENABLE_CMS_PUBLICATION` | Yes before launch | Production | Content/Legal | Disabled until legal/content approval |
| Feature flags | `ENABLE_NEWSLETTER_SIGNUP` | Conditional | Production | Marketing/Legal | Disabled until consent/legal review |
| Feature flags | `ENABLE_AUTOMATIONS` | Conditional | Production | Ops/Engineering | Disabled until workflow smoke passes |
| Admin seed | `SEED_ADMIN_EMAIL` | Conditional | One-time secure run | Security/Ops | Placeholder-safe seed only |
| Admin seed | `SEED_ADMIN_PASSWORD` | Conditional | One-time secure run | Security/Ops | Rotate after bootstrap |

Verification rule: each required production value needs date, owner, environment and verification result before go-live.
