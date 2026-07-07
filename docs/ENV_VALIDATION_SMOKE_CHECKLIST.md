# Env Validation Smoke Checklist

| Check | Expected |
| ----- | -------- |
| `npm run env:check` with `AUTH_SECRET` and `DATABASE_URL` set | pass |
| `npm run env:check:staging` without private staging env | fail with missing names only |
| `npm run env:check:production` without private production env | fail with missing names only |
| `ENABLE_DEV_MOCKS=true npm run env:check:staging` | fail |
| Missing `DATABASE_URL` on `/admin` with authenticated staff | controlled configuration state |
| Missing `DATABASE_URL` on public `/` | page still loads |
| Missing R2 env | runtime status marks R2 as false |
| Missing Resend env | runtime status marks email as false |
| Safe config error | never prints secret values or connection strings |

