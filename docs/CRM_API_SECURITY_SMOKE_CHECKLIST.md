# CRM API security smoke checklist

The current `package.json` has no `test` script, so this PR uses manual/API smoke checks plus build checks.

## Required checks

| Check | Expected result |
| --- | --- |
| GET `/api/crm/leads` without session | 401 with `{ ok: false, error: ... }` |
| GET `/api/crm/leads` as `CLIENT` | 403 |
| GET `/api/crm/leads` as `READ_ONLY` | 200 with safe serialized lead list |
| GET `/api/crm/leads` as `OPERATOR` | 200 with safe serialized lead list |
| GET `/api/crm/leads` as `LAWYER` | 200 with safe serialized lead list |
| GET `/api/crm/leads` as `ADMIN` | 200 with safe serialized lead list |
| GET `/api/crm/leads?limit=500` | 400 validation error |
| POST/PATCH/DELETE `/api/crm/leads` as `READ_ONLY` | 403 |
| POST/PATCH/DELETE `/api/crm/leads` as `ADMIN` | 405 controlled not implemented |
| POST `/api/leads/iod` | Still public lead-form endpoint |
| Response body | No stack trace, raw Prisma error, raw storage key, raw form JSON, or contact payload |

## Commands

```bash
npm run prisma:generate
npx prisma validate
npm run lint
npm run typecheck
npm run build
npm run responsive:check
```

If `npx prisma validate` fails because `DIRECT_URL` is missing, document it as an environment prerequisite rather than marking release readiness as green.
