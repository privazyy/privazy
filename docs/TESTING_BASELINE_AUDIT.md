# Testing Baseline Audit

Date: 2026-07-07

Scope: `main` plus this PR branch, focused on P1-004 and security/release smoke coverage.

| Area | Current status | Test exists | Gap | Recommendation |
| ---- | -------------- | ----------- | --- | -------------- |
| Test runner | Vitest added in this PR with node environment. | Yes | No browser/E2E runner. | Keep unit/integration tests mandatory; add Playwright only after stable auth fixtures. |
| Test scripts | `test`, `test:unit`, `test:security`, `test:smoke`, `test:watch` added. | Yes | No coverage threshold. | Add coverage thresholds after the security baseline stabilizes. |
| Test directories | `tests/helpers`, `tests/security`, `tests/smoke`, `tests/unit` added. | Yes | No E2E directory. | Keep route handler and policy tests first. |
| Auth permissions | Role matrix covered for ADMIN, LAWYER, OPERATOR, READ_ONLY, CLIENT, unauthenticated. | Yes | UI auth flows are not E2E-tested. | Add auth E2E after test login fixtures exist. |
| Private routes | Route classification helper covered. | Yes | Proxy is cookie-level only; server-side guards remain required. | Keep private route tests and add route-level auth smokes later. |
| CRM API | Read/mutation guards, query limits, serializer coverage added. | Yes | No live database route handler test. | Add route handler integration with mocked data layer later. |
| Document generation | Guard and actor-derived `createdById` covered. | Yes | Template lifecycle checks are still service/DB dependent. | Add mocked template lookup tests when service context is split further. |
| Tenant isolation | Organization access helper and document read assertions covered. | Yes | Full tRPC caller integration is not covered. | Add Prisma mock integration tests for document router. |
| Document serializers | Client serializers assert no raw file keys/internal errors. | Yes | Secure download endpoint still missing. | Add download authorization tests with the secure endpoint PR. |
| Env validation | Server/public env status and safe config errors covered. | Yes | No Vercel env pull automation test. | Keep secret-free CI validation; verify real env manually in staging. |
| Safe errors | 401/403/400/500 shapes and redaction covered. | Yes | Route handler snapshots are not included. | Add route handler integration tests after mocks are stable. |
| Release smoke | Critical imports/classifications/helpers covered. | Yes | No production/staging smoke. | Do not run smoke tests against production until staging is verified. |
| CI | `repo-check` runs security and smoke tests. | Yes | `test` full suite is local; CI runs focused mandatory groups. | Add full `npm run test` if duration remains low after more tests. |

Status: P1-004 is PARTIAL in audit language because a real harness and critical tests now exist, but the suite is not yet full E2E coverage.
