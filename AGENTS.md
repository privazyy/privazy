# Codex Working Notes

## Project Context

This repo is intended to be deployed on Vercel, backed by Supabase, hosted on GitHub, and maintained with Codex.

## Operating Rules

- Do not commit real secrets. Use `.env.example` for variable names only.
- Prefer existing project patterns once the application framework is added.
- Keep Vercel and Supabase project metadata local unless explicitly asked otherwise.
- Before changing deployment, database, or auth behavior, inspect the current app structure and docs.
- If adding a framework later, update `README.md`, `docs/SETUP.md`, and `.github/workflows/repo-check.yml` with real build/test commands.

## Expected Local Files

These files may exist locally and must remain untracked:

- `.env`
- `.env.local`
- `.vercel/`
- `supabase/.temp/`

## Useful Commands

```bash
cp .env.example .env.local
vercel link
vercel env pull .env.local
supabase login
supabase link --project-ref "$SUPABASE_PROJECT_REF"
```
