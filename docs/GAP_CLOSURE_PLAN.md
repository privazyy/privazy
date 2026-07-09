# GAP CLOSURE PLAN

Audit date: 2026-07-07
Decision basis: `docs/RELEASE_CANDIDATE_AUDIT.md`

## Summary

Current decision is **NO-GO**. The next work should be small, ordered PRs. Do not merge new business features until the security baseline and migration/release gate are green on `main`.

## Blockers and fixes

| Name | Risk | Priority | Owner | Files/modules | Proposed PR | Definition of done | Confirming test |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unmerged phase stack | Main does not contain the intended product. | P0 | Engineering Lead | GitHub PRs #3-#21 | PR-A: branch cleanup and merge order | Canonical PR stack chosen, stale duplicate PRs closed, merge order documented. | `gh pr list` shows only active canonical PRs; `main` commit history matches accepted phases. |
| Missing Phase 12R | No staging/production readiness phase exists. | P0 | Ops/Engineering | docs, scripts, env | PR-F: staging readiness | `STAGING_CHECKLIST`, `PRODUCTION_READINESS`, `RELEASE_RUNBOOK`, `ROLLBACK_PLAN`, `BACKUP_RESTORE`, `MONITORING_ALERTING` exist with evidence. | Manual checklist signed; staging smoke passes. |
| Private route/API auth gap | CRM/docs/private surfaces are public or return 500 instead of auth. | P0 | Security/Engineering | `src/proxy.ts`, `src/app/admin`, `src/app/documents`, `src/app/api/*` | PR-B: security baseline | Unauthenticated private pages redirect/401; role checks block CLIENT from CRM and READ_ONLY mutations. | Private route smoke: `/admin`, `/documents`, `/dashboard`, `/uploads`, private APIs return expected auth response. |
| Document generation ACL gap | Client can supply `createdById`; no protected download endpoint. | P0 | Security/Engineering | `src/app/api/documents/generate`, `src/server/documents`, `src/server/storage` | PR-B/PR-D: document ACL | Session drives actor; organization access checked; signed download endpoint records `DocumentDownload`. | Unit/permission tests and manual signed download smoke. |
| No QA gate on main | Release cannot be trusted. | P0 | QA/Engineering | `package.json`, `.github/workflows`, `tests`, `scripts` | PR-E: QA gate | `test`, `test:unit`, `test:integration`, `test:e2e`, `test:permissions`, `test:security`, `qa:ci` exist and run in CI. | `npm run qa:ci` and GitHub `Build and checks` pass. |
| Checkout/payment missing on main | Revenue flow cannot be tested. | P0 | Engineering/Business | `src/app/sklep`, `src/server/shop`, payment APIs | PR-D: shop/payment | Cart, checkout, sandbox payment, webhook idempotency and paid order status are on main. | Sandbox checkout E2E and webhook idempotency test. |
| Client portal missing on main | Customers cannot securely access documents/tasks. | P0 | Engineering | `/platforma`, `src/server/platform` | PR-D: portal | Org-scoped portal routes, documents, orders, messages, breaches and DSR screens exist. | CLIENT sees only own organization; internal role smoke passes. |
| CMS workflow missing on main | Published content cannot be governed. | P1 | Engineering/Content | `src/server/cms`, `/admin/blog`, blog routes | PR-D: CMS | Draft/review/publish roles enforced; public blog/sitemap only expose public content. | CMS permission tests and sitemap smoke. |
| Automations missing on main | Deadlines and notifications are not operational. | P1 | Engineering/Ops | `src/server/automations`, Inngest | PR-D: automations | EventLog/AutomationRun, document ready, breach/DSR/task reminders and email logs exist. | Workflow unit/integration tests and Inngest staging smoke. |
| Supabase RLS/Data API gap | Tables can be inaccessible or overexposed. | P1 | DB/Security | Prisma migrations, Supabase SQL | PR-C: database security | RLS/grants/Data API exposure decisions documented and applied; no accidental public table access. | Supabase advisors/manual SQL verification on staging. |
| Legal readiness missing | Legal launch risk. | P1 | Legal | legal docs/pages | PR-F: legal sign-off | Terms, sales terms, privacy, cookies, consents, complaints/withdrawal are approved or explicitly waived. | `LEGAL_RELEASE_CHECKLIST` signed. |
| Monitoring/backup/runbook missing | Incidents and data loss cannot be handled. | P1 | Ops | docs, Vercel/Supabase dashboards | PR-F: ops readiness | Monitoring, alert owners, backup/restore and rollback runbooks exist and are tested. | Restore drill evidence and alert smoke. |
| Prisma validate env fragility | CI/local audit can fail without real DB URL. | P2 | Engineering | `package.json`, scripts | PR-E small fix | `npm run prisma:validate` uses safe placeholders for schema-only validation. | `npm run prisma:validate` passes without private env. |
| Stale local `.next` after branch switches | Local typecheck can report false failures. | P2 | Engineering | scripts/docs | PR-E small fix | Audit docs instruct cleaning `.next`; CI uses clean checkout. | `Remove-Item .next; npm run typecheck` passes. |

## Repair order

1. **PR-A: Cleanup and canonical stack decision**
   - Close or supersede duplicate PRs #4-#10 where #12-#21 replace them.
   - Decide whether #3/#11 are merged or folded into readiness docs.
   - Publish a single merge order.

2. **PR-B: Security baseline**
   - Add central route/API protection.
   - Add role permission tests.
   - Block unauthenticated private routes.
   - Remove client-controlled actor IDs from private APIs.

3. **PR-C: Database and staging schema**
   - Reconcile migrations from open branches.
   - Verify migration order on staging.
   - Add or document RLS/grants/Data API decisions.
   - Add backup-before-migration evidence.

4. **PR-D: Business flows**
   - Merge shop/payment, document generator ACL, CRM, portal, CMS and automation phases after PR-B/PR-C.
   - Keep each domain separately reviewable.

5. **PR-E: QA/release gate**
   - Bring Phase 11R test harness to main.
   - Require `qa:ci` in GitHub Actions.
   - Add responsive and optional E2E smoke.

6. **PR-F: Staging/legal/ops readiness**
   - Complete Phase 12R.
   - Verify staging services.
   - Complete legal and operations sign-offs.

## Acceptance criteria before Phase 14R

- All P0 blockers closed and verified on `main`.
- No open critical draft PRs containing release-required code.
- `npm run qa:ci` green on `main`.
- Staging smoke and manual private-route flow tests green.
- Payment and invoice sandbox approved.
- R2 signed downloads verified.
- Supabase migration/RLS/grants verified.
- Legal and ops sign-offs complete.
