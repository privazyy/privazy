# PRIVAZY Security Model

This document describes the Phase 1 authentication and authorization baseline for the current Next.js App Router application.

## Goals

- Keep public marketing and lead capture surfaces public.
- Protect CRM, document generation, platform placeholders and operational APIs before feature expansion.
- Make authorization decisions on the server, not only in the route proxy.
- Avoid committing secrets or seed credentials.
- Keep audit logs useful without logging passwords or full sensitive payloads.

## Authentication

PRIVAZY uses NextAuth v5 with the Credentials provider and the existing Prisma `User` model.

- `User.email` is the login identifier.
- `User.passwordHash` is verified with `bcryptjs`.
- JWT sessions include the user id, email, name and role.
- The login route is `/login`.
- After login, role-based redirect is handled server-side by `/login/continue`:
  - `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY` -> `/admin`
  - `CLIENT` -> `/platforma`

The server auth helpers live under `src/server/auth`:

- `getCurrentUser()`
- `requireUser()`
- `requireRole()`
- `assertCanAccessOrganization()`
- `assertCanAccessAdmin()`

## Roles

| Role | Intended access |
| --- | --- |
| `ADMIN` | Full operational access, system settings and all CRM/data modules. |
| `LAWYER` | CRM, documents, review, requests and sensitive legal operations. |
| `OPERATOR` | Leads, clients, orders and documents, without system settings. |
| `READ_ONLY` | CRM read-only access. No document generation mutations. |
| `CLIENT` | Client platform and data for organizations linked through `ClientProfile`. |

## Route Access

Public routes:

- `/`
- `/blog/*`
- `/sklep/*`
- `/login`
- `/api/leads/iod`
- `/api/inngest/*` when Inngest signature verification is configured by Inngest
- `/api/auth/*`

Protected pages:

- `/admin/*`: `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY`
- `/dashboard/*`: authenticated users
- `/documents/*`: `ADMIN`, `LAWYER`, `OPERATOR`, `CLIENT`
- `/platforma/*`: authenticated users
- `/client/*`: authenticated users

The project uses `src/proxy.ts`, the Next.js 16 route interception file, as the equivalent of middleware. It redirects unauthenticated page requests to `/login` and returns JSON `401` or `403` for protected APIs.

Proxy is only the first gate. Sensitive pages and route handlers also call server-side auth helpers.

## API Access

Protected operational APIs:

- `/api/crm/*`: `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY`
- `/api/documents/*`: `ADMIN`, `LAWYER`, `OPERATOR`, `CLIENT`
- `/api/orders/*`: `ADMIN`, `LAWYER`, `OPERATOR`
- `/api/payments/*`: `ADMIN`, `OPERATOR`
- `/api/platform/*`: authenticated platform roles

Current concrete handlers:

- `/api/crm/leads` requires CRM read role and writes a low-volume audit event.
- `/api/documents/generate` requires document generation role and ignores any client-supplied `createdById`; the authenticated user id is used instead.
- `/api/leads/iod` remains public but is protected by honeypot, rate limiting and Turnstile verification.

## Organization Access

Organization access is enforced by `assertCanAccessOrganization()`.

- CRM roles can access organizations operationally.
- `CLIENT` users can access only organizations linked through `ClientProfile`.
- If a `CLIENT` tries to generate a document for an unrelated organization, the request is blocked and audited.

Future production work should add row-level database policies or equivalent Supabase/Postgres controls so application guards are backed by database-level protection.

## Document Access

Document generation is protected as a mutation.

- `READ_ONLY` cannot call `/api/documents/generate`.
- `CLIENT` can request generation only for an organization linked to their profile.
- `ADMIN`, `LAWYER`, and `OPERATOR` can generate documents for operational CRM organizations.
- Each accepted generation request writes `document.generation_requested` to `AuditLog`.

The async worker still writes:

- `document.generated`
- `document.generation_failed`

## R2 And Signed URLs

Generated document objects should remain private in R2/S3-compatible storage.

Rules for later implementation:

- Never expose raw private object keys to public clients.
- Use short-lived signed URLs for downloads.
- Scope signed URL creation through the same role and organization helpers.
- Audit signed URL creation for sensitive documents.
- Avoid storing signed URLs in durable records; store object keys only.

## Audit Log

Current audit events:

- `auth.login_success`
- `auth.login_failed`
- `auth.logout`
- `access.blocked` for protected API access failures where the route handler can see the request
- `crm.leads_accessed`
- `document.generation_requested`
- existing document worker events for generated and failed documents
- lead anti-spam events: honeypot, rate limit and Turnstile blocks

Audit logs intentionally avoid passwords and full form payloads. IP address and user-agent are recorded when a `Request` object is available.

## Lead Anti-Spam

`/api/leads/iod` remains public.

The endpoint now supports:

- `security.website` honeypot field
- `security.turnstileToken`
- in-memory rate limiting by IP and email
- development fallback when `CLOUDFLARE_TURNSTILE_SECRET_KEY` is absent
- production failure when Turnstile secret or token is absent

The in-memory limiter is a Phase 1 baseline. Before production scale, replace or back it with durable shared storage such as Redis, Vercel KV, Supabase, or another central rate-limit service.

## Admin Seed

Admin seed is configured through Prisma seed:

```bash
npx prisma db seed
```

It creates or updates an `ADMIN` user only when all private env variables are set:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

If any value is missing or still set to `replace_in_private_env`, the seed skips safely and prints which variable names are needed. Real passwords must never be committed.

## Environment And Secrets

Rules:

- Keep `.env`, `.env.local`, `.vercel/` and Supabase temp metadata untracked.
- Commit only placeholders in `.env.example`.
- Do not expose service-role or storage secret keys in `NEXT_PUBLIC_*`.
- Rotate `AUTH_SECRET`, storage keys and database credentials before production if any local secret was ever shared.
- Use production-only Turnstile secret for real submissions.

## Remaining Production Work

Before production launch:

- Add durable rate limiting.
- Add password reset / invite flow.
- Add account lockout and monitoring for repeated failed login.
- Add CSRF review for custom mutating forms beyond NextAuth protected flows.
- Add database-level authorization/RLS strategy for Supabase-hosted Postgres.
- Add signed URL download route with document-level authorization.
- Add explicit system-settings routes and enforce `ADMIN` only.
- Add end-to-end auth tests with seeded users for every role.
