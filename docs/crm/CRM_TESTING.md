# CRM Testing

No test runner exists in `package.json` on this base branch.

Validation required for this PR:

- `npm run prisma:generate`
- `npx prisma validate`
- `npx next typegen`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run responsive:check` if a local app server is running

Missing scripts:

- `npm run test`
- `npm run test:security`
- `npm run test:smoke`

Use `CRM_OPERATIONAL_SMOKE_CHECKLIST.md` until automated tests exist.
