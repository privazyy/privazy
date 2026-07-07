# Staging Smoke Checklist

Status: `MANUAL_VERIFICATION_REQUIRED`

Run after staging env is configured:

| Check | Expected |
| ----- | -------- |
| `npm run env:check:staging` | pass with real staging env |
| `npm run prisma:generate` | pass |
| `npx prisma validate` | pass with staging datasource env |
| `npx prisma migrate status` | pass and show expected migration state |
| Public homepage | 200 |
| `/api/auth/session` | 200 |
| Staff `/admin` | 200 or controlled auth redirect/config state |
| CRM data load | no uncontrolled 500 |
| Document query smoke | tenant scoped |
| Inngest endpoint | configured and signed |
| Email test | delivered through staging/test sender |
| R2 private object smoke | upload/download via server-only path |
| Monitoring | receives test event |

