# Security smoke checklist

Projekt nie ma jeszcze test runnera w `package.json`, wiec ten PR dodaje manualna checkliste dla zakresu private routes i CRM.

## Routes

| Check | Expected result |
| --- | --- |
| `/admin` as anonymous | Redirect to `/login?callbackUrl=/admin`; no CRM data query should run. |
| `/admin` as `CLIENT` | Redirect to `/platforma`; CRM remains unavailable. |
| `/admin` as `READ_ONLY` | CRM read surface loads when DB env is configured; mutations remain blocked by helper policy. |
| `/admin` as `OPERATOR` | CRM read surface loads when DB env is configured. |
| `/admin` as `LAWYER` | CRM read surface loads when DB env is configured. |
| `/admin` as `ADMIN` | CRM read surface loads when DB env is configured. |
| `/login` as anonymous | Public login page renders. |
| `/` as anonymous | Public landing page renders. |
| `/blog` as anonymous | Public blog page renders. |
| `/api/auth/*` | NextAuth route remains public. |
| Missing `DATABASE_URL` on `/admin` | Anonymous user is redirected before DB access; staff sees controlled configuration state. |
| Redirect loop check | `/admin` anonymous -> `/login`; `CLIENT` `/admin` -> `/platforma`; staff `/login` -> `/admin`. |

## Commands

Run before merging:

```bash
npm ci
npm run prisma:generate
npx prisma validate
npm run lint
npm run typecheck
npm run build
npm run responsive:check
```

If `npx prisma validate` fails because `DIRECT_URL` is missing, treat it as an environment prerequisite and do not mark staging readiness as green.
