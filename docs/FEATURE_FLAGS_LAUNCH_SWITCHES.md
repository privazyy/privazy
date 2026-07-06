# Feature Flags and Launch Switches

Status: **SPECIFICATION ONLY - runtime foundation is not implemented on main**

Because the current `main` branch is NO-GO, this document defines the required launch switch behavior. Do not claim these flags are active until implementation and tests exist on `main`.

| Flag | Safe production default | Purpose | Expected behavior |
| --- | --- | --- | --- |
| `ENABLE_CHECKOUT` | `false` | Controls cart/checkout entry points. | Product pages can remain public, but add-to-cart/checkout actions are disabled with a clear message. |
| `ENABLE_LIVE_PAYMENTS` | `false` | Separates live provider capture from checkout availability. | Checkout may run in sandbox/test while live capture stays disabled. |
| `ENABLE_DOCUMENT_GENERATION` | `false` | Emergency stop for DOCX/PDF generation. | Intake can be paused or queued; no new generation jobs should start. |
| `ENABLE_CLIENT_PORTAL` | `false` | Controls client portal availability. | If disabled, clients see maintenance/read-only notice; internal admin may still inspect data if safe. |
| `ENABLE_CMS_PUBLICATION` | `false` | Controls public publishing. | Draft/review can continue, but publish/schedule actions are blocked. |
| `ENABLE_NEWSLETTER_SIGNUP` | `false` | Controls marketing signup. | Existing pages load, but signup forms do not create subscriptions. |
| `ENABLE_AUTOMATIONS` | `false` | Controls background workflows. | Critical automations can be paused without taking the public site down. |
| `MAINTENANCE_MODE` | `true` until launch approval | Site-wide operational stop. | Public users see a maintenance page; private mutating APIs refuse critical writes. |

## Required implementation contract

- Flags must be read server-side from environment/config, not client trust.
- Live payments must require both `ENABLE_CHECKOUT=true` and `ENABLE_LIVE_PAYMENTS=true`.
- Document generation must be stoppable independently of portal read access.
- Maintenance mode must block critical mutations even if UI buttons are hidden.
- Admin bypass may exist only for authenticated internal roles and must be audited.
- Each flag must have tests or smoke steps before launch approval.

## Manual approval rules

- `ENABLE_LIVE_PAYMENTS=true` requires written business/finance approval.
- `ENABLE_CMS_PUBLICATION=true` requires content/legal approval.
- `ENABLE_AUTOMATIONS=true` requires workflow smoke and alerting.
- `MAINTENANCE_MODE=false` requires GO decision and active incident owner.
