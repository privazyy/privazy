# CRM production deployment

Status: `MANUAL_REQUIRED`; no production deployment is authorized by this PR.

Required production/staging variables are the validated names from `.env.example`, including database direct/runtime URLs, Auth.js secret/base URL, and only the R2/Resend variables needed by enabled workflows. Values must be configured in Vercel, never committed.

Preflight: back up the database, review `prisma migrate status`, validate additive migrations against staging, run all repository gates, deploy a preview, and execute the role matrix. This branch adds no schema migration. Seed commands are forbidden in production.

Vercel sequence: `vercel pull`, `vercel env pull .env.local`, `vercel build`, `vercel deploy --prebuilt`; after explicit approval and a green preflight, `vercel deploy --prebuilt --prod`. With GitHub integration, merge to `main` only after preview approval.

Post-deploy smoke: `/` returns successfully; `/crm` redirects unauthenticated users to login; `/admin` redirects to `/crm`; staff can read and mutate according to role; `CLIENT` is blocked; `READ_ONLY` receives 403 for writes; lead creation and task completion persist; logs contain no critical errors.

Rollback: stop promotion, roll back to the prior Vercel deployment, and restore the DB only if an approved migration runbook explicitly requires it. Go/no-go is NO-GO until env, backup, staging migration status, role smoke, persistence smoke, logs, and domain checks are confirmed.
