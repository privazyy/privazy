# Controlled Launch Runbook

Status: **BLOCKED - launch must not be executed**

This runbook is a preparation document. The current release decision is not GO on `main`.

## A. Pre-launch

1. Confirm `GO_NO_GO_DECISION.md` is GO or CONDITIONAL GO with closed conditions.
2. Confirm P0 blockers are closed.
3. Confirm production environment checklist is signed.
4. Confirm DB backup and rollback plan.
5. Confirm monitoring and alert owners.
6. Confirm support owner availability.
7. Confirm payment and invoice approvals.

## B. Deploy

1. Deploy approved commit to production.
2. Verify build output and deployment status.
3. Confirm maintenance mode remains active until smoke owner approves.
4. Confirm health endpoint or public home loads.

## C. Smoke

- Public home loads.
- Robots and sitemap are correct.
- Admin login works.
- Client test login works.
- Checker lead writes and appears in CRM.
- Product page loads.
- Add to cart works only if `ENABLE_CHECKOUT=true`.
- Checkout test passes.
- Payment provider mode is verified.
- Document generation test passes if enabled.
- Signed download works and logs audit.
- CRM visibility respects role.
- Portal visibility respects organization.
- CMS public article visibility is correct.
- Automations run or stay disabled according to flag.

## D. Open limited access

1. Disable maintenance only after smoke pass.
2. Enable checkout only after approval.
3. Enable document generation only after approved smoke.
4. Enable live payments only after explicit manual business/finance approval.
5. Do not start broad marketing on launch day unless separately approved.

## E. Monitor

| Window | Focus |
| --- | --- |
| First hour | 5xx, auth, checkout, payments, document jobs, email, workflows. |
| First day | Conversion, support tickets, failed provider calls, latency. |
| First week | Recurring errors, customer friction, manual review results. |

## Abort conditions

- Auth or private-route breach.
- Payment mismatch or duplicate charge.
- Wrong document delivered.
- DB migration anomaly.
- Monitoring unavailable.
- Support owner unavailable.
