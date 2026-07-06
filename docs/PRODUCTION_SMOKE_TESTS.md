# Production Smoke Tests

Status: **BLOCKED until GO decision**

Run after production deploy and before opening real traffic. Record tester, timestamp, environment and result.

| Scenario | Expected result | Status |
| --- | --- | --- |
| Public site loads | Home returns 200 with correct branding. | NOT_RUN |
| SEO critical pages load | Key pages, robots and sitemap are correct. | NOT_RUN |
| Login works | Admin and client test users authenticate. | NOT_RUN |
| CRM protected | Unauthenticated user cannot access CRM. | NOT_RUN |
| Portal protected | CLIENT sees only own organization. | NOT_RUN |
| Checker lead writes | Lead persists and appears in CRM. | NOT_RUN |
| Checkout flag | Disabled/enabled according to `ENABLE_CHECKOUT`. | NOT_RUN |
| Payment mode | Sandbox/live mode confirmed in provider dashboard. | NOT_RUN |
| Document generation mode | Disabled/enabled according to flag; no surprise jobs. | NOT_RUN |
| R2 signed download | Download uses protected signed URL; no raw key exposure. | NOT_RUN |
| Email log | Email send or dry-run is logged. | NOT_RUN |
| Automation run | Workflow run is logged or disabled by flag. | NOT_RUN |
| Monitoring test error | Test error appears in monitoring. | NOT_RUN |
| Backup visible | Latest backup visible and restorable. | NOT_RUN |

Fail rule: any failed critical smoke keeps maintenance mode on and stops launch.
