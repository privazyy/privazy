# Setup Guide

Use this guide after you provide the keys and project identifiers for Vercel, Supabase, GitHub, and OpenAI/Codex.

## 1. Local Environment

Copy the example file and fill in the local values:

```bash
cp .env.example .env.local
```

Do not commit `.env.local`.

## 2. Supabase

Install and log in to the Supabase CLI:

```bash
supabase login
```

Link the local repo to the hosted Supabase project:

```bash
supabase link --project-ref "$SUPABASE_PROJECT_REF"
```

Recommended variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `DATABASE_URL`
- `DIRECT_URL`

Use the service role key only on the server side.

## 3. Vercel

Install and log in to the Vercel CLI:

```bash
vercel login
vercel link
```

Pull the Vercel environment into your local file when the project is linked:

```bash
vercel env pull .env.local
```

Recommended variables:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

Store application secrets in Vercel Project Settings, not in `vercel.json`.

## 4. GitHub

Connect the repository to GitHub and add repository secrets only in GitHub Settings.

Recommended GitHub secrets when CI/deployment automation is added:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

The current workflow runs dependency install, Prisma client generation, lint, typecheck, and build.

## 5. Codex

Codex can work from this repo using `AGENTS.md` as its local instruction file. When application code is added, keep the setup docs updated so future Codex sessions can safely run tests, builds, migrations, and deployments.

## 6. Application Bootstrap

Install dependencies and generate the Prisma client:

```bash
npm install
npm run prisma:generate
```

Run a local migration after `DATABASE_URL` and `DIRECT_URL` point at the intended Supabase database:

```bash
npm run prisma:migrate
```

Start the app:

```bash
npm run dev
```

Run local verification before UI handoff:

```bash
npm run lint
npm run typecheck
npm run build
npm run responsive:check
```

`npm run responsive:check` expects the app to be available at `http://localhost:3000`. The responsive rules live in [RESPONSIVE.md](RESPONSIVE.md).
