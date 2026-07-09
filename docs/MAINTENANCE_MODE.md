# Maintenance Mode

Status: **BLOCKED - not implemented on main**

Maintenance mode must exist before production launch. Current `main` does not provide a verified runtime switch, so launch remains blocked.

## Required behavior

- Public users see a clear service maintenance message.
- Public read-only pages may stay online if safe.
- Checkout, live payments, document generation and newsletter signup can be disabled separately.
- Private APIs must reject critical mutations when maintenance is active.
- Admin bypass is allowed only for authenticated internal roles and must be logged.
- Maintenance mode must not expose stack traces, secrets, storage keys or raw provider errors.

## Required tests

| Scenario | Expected result |
| --- | --- |
| `MAINTENANCE_MODE=true` and public home | Page loads or shows planned maintenance message. |
| Checkout action during maintenance | Action is blocked; no order/payment is created. |
| Document generation during maintenance | No generation job starts. |
| Client portal read-only mode | Client can view permitted data if enabled, but cannot mutate. |
| Admin bypass | Only authorized internal users can bypass, with audit log. |
| Private API mutation | Returns controlled 503/423/403 response, not raw error. |

## Launch rule

Do not set `MAINTENANCE_MODE=false` in production until:

- GO decision is approved,
- rollback plan is reviewed,
- monitoring is active,
- support owner is online,
- production smoke test owner is ready.
