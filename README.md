# PRIVAZY

Repo prepared for remote development with:

```txt
GitHub Codespaces / github.dev -> GitHub -> Vercel Preview/Production -> Supabase
```

## Remote Development

Use **GitHub Codespaces** for full development work:

1. Open the repository on GitHub.
2. Click **Code -> Codespaces -> Create codespace on main**.
3. Add the required Codespaces secrets after the environment opens.
4. Copy `.env.example` to `.env.local`.
5. Fill in the values from Vercel, Supabase, GitHub, and OpenAI/Codex as needed.
6. Run the app with the package-manager command used by this repo.

```bash
npm run dev
```

Port `3000` is configured for preview in Codespaces.

## Quick Edits

For simple changes without a terminal, use `github.dev`:

```txt
Open the repo -> press .
```

Use Codespaces for migrations, terminal work, Prisma, tests, and application changes.

## Environment Variables

Keep only `.env.example` in git. Store real values separately in:

- **Vercel Environment Variables** - Production / Preview / Development,
- **GitHub Codespaces Secrets** - remote development,
- **GitHub Actions Secrets** - CI/CD automation when needed.

Never commit `.env`, `.env.local`, Supabase keys, Resend keys, Cloudflare R2 keys, database URLs, auth secrets, or `.vercel` project metadata.

Follow [docs/SETUP.md](docs/SETUP.md) to connect each service. See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for the environment variable reference.
Use [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) as the UI constitution and [docs/RESPONSIVE.md](docs/RESPONSIVE.md) as the viewport formula for landing, CRM, and every new component.

## Recommended Environments

```txt
main        -> Vercel production + Supabase production
staging     -> Vercel preview/staging + Supabase staging/dev
feature/*   -> Vercel preview + Supabase dev/staging
Codespaces  -> Supabase dev/staging, never production unless necessary
```

## Repo Structure

- `.env.example` - safe template for required environment variables.
- `docs/SETUP.md` - step-by-step service connection guide.
- `docs/ENVIRONMENT.md` - environment variable reference.
- `docs/DESIGN_SYSTEM.md` - PRIVAZY brand, token, layout, copy, and component constitution.
- `docs/RESPONSIVE.md` - responsive UI rules and viewport verification command.
- `AGENTS.md` - working instructions for Codex and future coding agents.
- `supabase/config.toml` - local Supabase CLI project config.
- `.github/` - GitHub issue, PR, and lightweight repo-check workflow files.
- `src/server/storage` - private Cloudflare R2 helpers and signed URL generation.
- `src/server/documents` - DOCX generation service and future PDF converter interface.
- `src/server/inngest` - background workflow functions.
- `prisma/schema.prisma` - database models for users, organizations, templates, jobs, generated documents, audit logs, and form submissions.
