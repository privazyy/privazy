# Environment Variables

## Public Variables

These may be exposed to browser/client code.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Local or deployed app URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key, if used. |

## Server Secrets

These must not be exposed to browser/client code.

| Name | Purpose |
| --- | --- |
| `SUPABASE_PROJECT_REF` | Supabase project reference ID. |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI/API token. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin key. |
| `SUPABASE_DB_PASSWORD` | Database password. |
| `DATABASE_URL` | Pooled database connection string for runtime. |
| `DIRECT_URL` | Direct database connection string for migrations. |
| `VERCEL_TOKEN` | Vercel automation token. |
| `VERCEL_ORG_ID` | Vercel team or user ID. |
| `VERCEL_PROJECT_ID` | Vercel project ID. |
| `GITHUB_TOKEN` | GitHub automation token when needed locally. |
| `OPENAI_API_KEY` | Optional key for AI features in the application. |
| `AUTH_SECRET` | NextAuth secret for signing auth tokens. |
| `NEXTAUTH_URL` | Base application URL used by NextAuth locally or in deployment. |
| `INNGEST_EVENT_KEY` | Inngest event key for sending workflow events outside local dev. |
| `INNGEST_SIGNING_KEY` | Inngest signing key for webhook verification. |
| `RESEND_API_KEY` | Resend API key for transactional email. |
| `RESEND_FROM` | Verified sender address for transactional email. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID. |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for automation. |
| `CLOUDFLARE_ZONE_ID` | Cloudflare DNS zone ID when using DNS or Workers routes. |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | Cloudflare Pages project name, if used. |
| `CLOUDFLARE_R2_BUCKET` | Cloudflare R2 bucket name, if used. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare R2 S3-compatible access key ID. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 S3-compatible secret access key. |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Cloudflare KV namespace ID, if used. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Server-side Cloudflare Turnstile secret key. |

## Notes

- Use `.env.example` for names only.
- Use `.env.local` for local development.
- Use Vercel Project Settings for deployed environment values.
- Use GitHub repository secrets for GitHub Actions.
