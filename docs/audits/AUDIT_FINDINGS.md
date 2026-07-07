# PRIVAZY - Audit Findings

## P0 - Release Blockers

| ID | Area | Finding | Evidence | Risk | Blocks staging | Blocks production |
| --- | --- | --- | --- | --- | --- | --- |
| P0-001 | Auth/CRM | `/admin` has no auth or role guard. | `src/app/admin/page.tsx`; no middleware/proxy. | Public CRM exposure. | YES | YES |
| P0-002 | API security | `/api/crm/leads` is public. | `src/app/api/crm/leads/route.ts`. | Lead/customer data exposure. | YES | YES |
| P0-003 | Document generation | `/api/documents/generate` is public and trusts `organizationId`, `templateId`, `createdById`. | `src/components/forms/document-request-form.tsx`, `src/server/documents/service.ts`. | IDOR/BOLA and forged creator. | YES | YES |
| P0-004 | Tenant isolation | tRPC document job list accepts arbitrary `organizationId` with only session check. | `src/server/trpc/routers/documents.ts`. | Authenticated users can target other tenants. | YES | YES |
| P0-005 | Private routes | No middleware/proxy protects private app surfaces. | No `middleware.ts` or `src/proxy.ts`. | Private pages are public/scaffolded. | YES | YES |
| P0-006 | Env/runtime readiness | `/admin` returns 500 without `DATABASE_URL`. | `responsive:check` and dev log. | Unsafe failure mode and no readiness gate. | YES | YES |
| P0-007 | File-key exposure | CRM/audit paths can expose raw storage keys. | `src/server/crm/data.ts`, `src/server/documents/service.ts`. | Storage internals leak. | YES | YES |

## P1 - Must Fix Before Launch

| ID | Area | Finding |
| --- | --- | --- |
| P1-001 | Public forms | IOD lead endpoint has no rate limit or Turnstile verification. |
| P1-002 | Checkout/payments | Product page promises payment/instant access, but cart/order/payment models and APIs are missing. |
| P1-003 | Invoicing | No invoice provider/model/workflow. |
| P1-004 | Tests | No test scripts or test directories are present. |
| P1-005 | Document generation | No paid-order or privileged-staff gate. |
| P1-006 | Downloads | No protected download endpoint or `DocumentDownload` audit. |
| P1-007 | Staging/ops | No complete staging, migration, backup, restore, monitoring or rollback runbook. |
| P1-008 | Legal | Public legal routes and approval workflow are missing. |
| P1-009 | CMS/newsletter | No persisted newsletter consent, unsubscribe or CMS approval workflow. |
| P1-010 | Supabase/RLS | RLS/Data API/grants were not verifiable from repo-only audit. |

## P2 - Should Fix Soon

| ID | Area | Finding |
| --- | --- | --- |
| P2-001 | Documentation | Docs cover setup/env/design/responsive/IOD spec, but not the full release/security/product operating model. |
| P2-002 | UX/accessibility | Full keyboard/a11y audit remains incomplete; blog uses raw palette classes outside the token system. |
| P2-003 | SEO | Sitemap/robots are missing. |
| P2-004 | Performance | CRM reads broad table slices without real pagination/filter APIs. |
| P2-005 | Dependencies | Deprecated packages appear during `npm ci`. |
| P2-006 | Error handling | API error handling is inconsistent and not centralized. |
| P2-007 | Privacy | IP/userAgent/referrer retention/minimization is undocumented. |

## P3 - Backlog

| ID | Area | Finding |
| --- | --- | --- |
| P3-001 | Refactor | Landing and CRM components are large and should be split after security baseline. |
| P3-002 | UI polish | Static product/blog views need consistency pass after real flows exist. |
| P3-003 | Analytics | Marketing event/CTA tracking is not implemented. |
