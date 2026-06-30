# AUTH TESTING CHECKLIST

Use this checklist before merging security-sensitive work and again before production deployment.

## Setup

- [ ] `.env.local` exists only locally and is not staged.
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set in the private environment.
- [ ] `DATABASE_URL` and `DIRECT_URL` point to the intended non-production database during local testing.
- [ ] `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` are set only in private env when seeding is needed.
- [ ] `npx prisma db seed` creates an admin only from private env values.

## Public Routes

- [ ] `/` loads without login.
- [ ] `/blog` and `/blog/*` load without login.
- [ ] `/sklep/polityka-prywatnosci` loads without login.
- [ ] `/login` loads without login.
- [ ] `/api/leads/iod` accepts valid public lead payloads in development with Turnstile fallback.
- [ ] `/api/leads/iod` rejects production submissions without a valid Turnstile secret and token.

## Login And Logout

- [ ] Valid admin credentials log in successfully.
- [ ] Invalid email/password shows a generic error.
- [ ] Failed login writes `auth.login_failed` without storing the password.
- [ ] Successful login writes `auth.login_success`.
- [ ] `ADMIN`, `LAWYER`, `OPERATOR`, and `READ_ONLY` redirect to `/admin`.
- [ ] `CLIENT` redirects to `/platforma`.
- [ ] Logout returns the user to `/login`.
- [ ] Logout writes `auth.logout` when a JWT token is available.

## Protected Pages

- [ ] Unauthenticated users cannot view `/admin`.
- [ ] Unauthenticated users cannot view `/dashboard`.
- [ ] Unauthenticated users cannot view `/documents`.
- [ ] Unauthenticated users cannot view `/platforma`.
- [ ] `CLIENT` cannot view `/admin`.
- [ ] `READ_ONLY` can view CRM but cannot generate documents.
- [ ] `OPERATOR` can view CRM and document operations, but not future system settings.

## Protected APIs

- [ ] Unauthenticated `GET /api/crm/leads` returns `401`.
- [ ] `CLIENT` `GET /api/crm/leads` returns `403`.
- [ ] `READ_ONLY` `GET /api/crm/leads` returns `200`.
- [ ] Unauthenticated `POST /api/documents/generate` returns `401`.
- [ ] `READ_ONLY` `POST /api/documents/generate` returns `403`.
- [ ] `CLIENT` can generate a document only for an organization linked by `ClientProfile`.
- [ ] `CLIENT` cannot generate a document for another organization.
- [ ] `ADMIN`, `LAWYER`, and `OPERATOR` can generate documents for CRM organizations.
- [ ] Blocked protected API attempts write `access.blocked` where the route handler can observe the request.

## Lead Anti-Spam

- [ ] Honeypot field `security.website` causes a silent block and does not create a lead.
- [ ] Repeated submissions from the same IP are rate limited.
- [ ] Repeated submissions for the same email are rate limited.
- [ ] Rate-limit blocks write `lead.rate_limit_blocked`.
- [ ] Invalid Turnstile writes `lead.turnstile_blocked`.
- [ ] Development fallback is documented and does not allow production bypass.

## Secrets And Repository Hygiene

- [ ] `git status --short` does not show `.env`, `.env.local`, `.vercel/`, or Supabase temp files.
- [ ] `git diff --cached` contains only placeholders for env values.
- [ ] No real password, API key, token, database URL, service-role key, or private R2 key appears in the staged diff.
- [ ] `.env.example` contains variable names and placeholder values only.

## Required Commands

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run responsive:check` after starting a local server, or document why it was not run.
