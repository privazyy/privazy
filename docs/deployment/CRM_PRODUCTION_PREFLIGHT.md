# CRM production preflight

- [ ] `lint`, `typecheck`, `build`, `test`, `test:security`, and `test:smoke` pass.
- [ ] `/crm` exists; UI contains no `/admin` links; legacy `/admin` redirects.
- [ ] No prototype values are presented as database data.
- [ ] `/crm` and `/api/crm/*` are private; `CLIENT` is blocked; `READ_ONLY` cannot mutate.
- [ ] Errors expose no Prisma stack, storage key, or provider payload.
- [ ] Migrations and `prisma validate` are reviewed; backup and rollback owner are assigned; seed is disabled.
- [ ] `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, Auth.js URL/trust configuration, and enabled R2/Resend variables exist in the correct Vercel environments.
- [ ] Vercel project, production branch, domain, logs, and alerts are confirmed.
- [ ] Preview smoke covers `/`, `/crm`, login, dashboard, lead list/create, task complete, `READ_ONLY` write denial, and `CLIENT` denial.

Until every item is evidenced, production deployment is `MANUAL_REQUIRED` and release status is NO-GO.
