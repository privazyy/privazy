# Environment Variables

Do not commit real secrets. Keep real values in `.env.local`, Vercel Environment Variables, GitHub Secrets, or the relevant provider dashboard.

## Runtime Modes

| Mode | Source | Requirements |
| ---- | ------ | ------------ |
| local | `.env.local` or shell env | `AUTH_SECRET` and `DATABASE_URL` for private modules; mocks only with `ENABLE_DEV_MOCKS=true`. |
| staging | Vercel Preview/staging env | Auth, database, migrations, Inngest, storage, email/test providers, and smoke checks must be manually verified. |
| production | Vercel Production env | All critical env and provider integrations must be configured. Production readiness remains `NO`. |

## Public Variables

These may be exposed to browser/client code.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public app URL used by client-visible links. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL. |
| `NEXT_PUBLIC_SITE_NAME` | Public site name. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL if a browser Supabase client is added. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key, if used instead of anon key. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key. |

## Server Secrets

These must not be exposed to browser/client code.

| Name | Purpose |
| --- | --- |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | NextAuth secret for signing tokens. |
| `AUTH_URL` / `NEXTAUTH_URL` | Base auth URL. |
| `DATABASE_URL` | Runtime pooled database connection string. |
| `DIRECT_URL` | Direct database connection string for Prisma migrations/status. |
| `SUPABASE_PROJECT_REF` | Supabase project reference ID. |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI/API token. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin key. |
| `SUPABASE_DB_PASSWORD` | Database password. |
| `VERCEL_TOKEN` | Vercel automation token. |
| `VERCEL_ORG_ID` | Vercel team or user ID. |
| `VERCEL_PROJECT_ID` | Vercel project ID. |
| `GITHUB_TOKEN` | GitHub automation token when needed locally. |
| `OPENAI_API_KEY` | Optional key for AI features in the application. |
| `INNGEST_EVENT_KEY` | Inngest event key. |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing key. |
| `INNGEST_ENV` | Inngest environment label. |
| `RESEND_API_KEY` | Resend API key for transactional email. |
| `RESEND_FROM` | Verified sender address. |
| `RESEND_DOMAIN` | Verified Resend domain, if used. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID. |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for automation. |
| `CLOUDFLARE_ZONE_ID` | Cloudflare DNS zone ID. |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | Cloudflare Pages project name, if used. |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Cloudflare KV namespace ID, if used. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Server-side Cloudflare Turnstile secret key. |
| `CLOUDFLARE_R2_BUCKET` / `R2_BUCKET` | Private R2 bucket name. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` / `R2_ACCESS_KEY_ID` | R2 S3-compatible access key ID. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` / `R2_SECRET_ACCESS_KEY` | R2 S3-compatible secret access key. |
| `R2_ACCOUNT_ID` | R2 account ID alias. |
| `R2_ENDPOINT` | R2 S3-compatible endpoint alias. |
| `R2_PUBLIC_URL` | Optional public URL; do not use for private generated documents. |
| `PAYMENT_PROVIDER` | Payment provider selector. |
| `PAYMENT_MODE` | Payment mode, for example mock/sandbox/live. |
| `PAYMENT_WEBHOOK_SECRET` | Payment webhook secret. |
| `INVOICE_PROVIDER` | Invoice provider selector. |
| `INVOICE_MODE` | Invoice mode. |
| `SENTRY_DSN` | Monitoring DSN if Sentry or equivalent is used. |
| `LOG_LEVEL` | Runtime log level. |

## Feature Flags

| Name | Default | Notes |
| --- | --- | --- |
| `ENABLE_DEV_MOCKS` | `false` | Local-only. Must not be enabled in staging or production. |
| `ENABLE_CHECKOUT` | `false` | Checkout remains disabled until the flow is built and verified. |
| `ENABLE_LIVE_PAYMENTS` | `false` | Live payments remain disabled. |
| `ENABLE_DOCUMENT_GENERATION` | `false` | Document generation requires separate security gates. |
| `ENABLE_CLIENT_PORTAL` | `false` | Client portal readiness is separate. |
| `ENABLE_CMS_PUBLICATION` | `false` | CMS publishing readiness is separate. |
| `ENABLE_NEWSLETTER_SIGNUP` | `false` | Newsletter signup readiness is separate. |
| `ENABLE_AUTOMATIONS` | `false` | Automations readiness is separate. |
| `MAINTENANCE_MODE` | `false` | Operational flag documented in `docs/MAINTENANCE_MODE.md`. |

## Validation

Run:

```bash
npm run env:check
npm run env:check:staging
npm run env:check:production
```

The staging and production checks intentionally fail without real private env. They do not print secret values.
