# Environment Inventory

Status terms: `required`, `optional`, `manual`, `not applicable`.

| Env | Public/private | Required local | Required staging | Required production | Used by | Mock allowed | Notes |
| --- | -------------- | -------------- | ---------------- | ------------------- | ------- | ------------ | ----- |
| `NODE_ENV` | private | optional | optional | optional | Next.js/runtime | no | Defaults through runtime. |
| `APP_ENV` | private | optional | required | required | env validation | no | Use `local`, `staging`, or `production`. |
| `NEXT_PUBLIC_APP_URL` | public | optional | manual | required | public links | no | Browser-safe URL. |
| `NEXT_PUBLIC_SITE_URL` | public | optional | manual | required | SEO/public links | no | Canonical URL. |
| `NEXT_PUBLIC_SITE_NAME` | public | optional | optional | optional | UI metadata | no | Defaults to PRIVAZY in template. |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | private | required for auth | required | required | NextAuth | no | Must be a strong random value. |
| `AUTH_URL` / `NEXTAUTH_URL` | private | optional | required | required | NextAuth callbacks | no | Must match deployment URL. |
| `DATABASE_URL` | private | required for private DB modules | required | required | Prisma runtime | no | Pooled runtime connection. |
| `DIRECT_URL` | private | required for migrations | required | required | Prisma migrate/status | no | Direct DB connection. |
| `SUPABASE_PROJECT_REF` | private | optional | required | required | Supabase CLI ops | no | Manual verification required. |
| `SUPABASE_ACCESS_TOKEN` | private | optional | manual | manual | Supabase CLI/API | no | Do not expose to client. |
| `SUPABASE_SERVICE_ROLE_KEY` | private | optional | manual | manual | server-only admin ops | no | Never use in browser code. |
| `NEXT_PUBLIC_SUPABASE_URL` | public | optional | manual | manual | future Supabase client | no | Repo currently uses Prisma for DB access. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | optional | manual | manual | future Supabase client | no | RLS/Data API must be verified before use. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | optional | manual | manual | future Supabase client | no | Alternative public key. |
| `INNGEST_EVENT_KEY` | private | optional | required | required | Inngest events | local only | Required outside local dev. |
| `INNGEST_SIGNING_KEY` | private | optional | required | required | Inngest webhook verification | no | Required outside local dev. |
| `INNGEST_ENV` | private | optional | manual | manual | Inngest environment label | no | Keep separated per env. |
| `RESEND_API_KEY` | private | optional | manual | required | transactional email | local only | Production requires verified sender. |
| `RESEND_FROM` | private | optional | manual | required | transactional email | local only | Must be verified. |
| `RESEND_DOMAIN` | private | optional | manual | manual | email domain readiness | no | Manual DNS verification. |
| `CLOUDFLARE_ACCOUNT_ID` | private | optional | manual | manual | R2/DNS automation | no | Required for R2 client path. |
| `CLOUDFLARE_R2_BUCKET` | private | optional | manual | manual | private document storage | no | Bucket must remain private. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | private | optional | manual | manual | private document storage | no | Server-only. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | private | optional | manual | manual | private document storage | no | Server-only. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | public | optional | manual | manual | Turnstile | no | Public site key. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | private | optional | manual | manual | Turnstile verify | no | Server-only. |
| `ENABLE_DEV_MOCKS` | private | optional | no | no | env policy | local only | Must be false outside local. |
| `MAINTENANCE_MODE` | private | optional | manual | manual | ops flag | no | See maintenance doc. |
| `ENABLE_CHECKOUT` | private | optional | manual | manual | feature gate | no | Keep false until checkout exists. |
| `ENABLE_LIVE_PAYMENTS` | private | optional | no | manual | payment gate | no | Keep false until verified. |
| `PAYMENT_PROVIDER` / `PAYMENT_MODE` | private | optional | manual | manual | payment foundation | sandbox/mock | No live payments in this PR. |
| `INVOICE_PROVIDER` / `INVOICE_MODE` | private | optional | manual | manual | invoice foundation | sandbox/mock | No invoice integration in this PR. |
| `SENTRY_DSN` | private | optional | manual | manual | monitoring | no | Missing until monitoring is selected. |
| `LOG_LEVEL` | private | optional | optional | optional | logging | no | Use conservative production level. |

