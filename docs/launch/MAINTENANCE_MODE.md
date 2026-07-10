# Maintenance Mode

Maintenance mode is required before controlled soft launch can move beyond internal-only checks.

## Feature Flags

| Variable | Purpose | Current PR status |
| --- | --- | --- |
| `MAINTENANCE_MODE` | Blocks normal product usage during incidents or preflight | Documented; exposed in `/api/health` and `/api/launch/status` |
| `MAINTENANCE_ALLOWED_EMAILS` | Allows named accounts through maintenance | Documented only |
| `MAINTENANCE_ALLOWED_ROLES` | Allows staff roles through maintenance | Documented only |

## Required Behavior Before Launch

- Public maintenance page is available.
- Admin/staff can still access incident and support surfaces.
- Allowed emails can access required routes.
- Health endpoint remains available.
- Auth callback routes are not broken by maintenance gating.
- Webhooks needed for rollback/reconciliation are either allowed or intentionally disabled.

## Current Status

This PR does not implement global proxy/middleware enforcement. It adds env placeholders and read-only status endpoints so operators can see maintenance state without exposing secrets.

Launch impact: `BLOCKER` for public soft launch. Conditional/internal-only rehearsal can proceed only if traffic is manually restricted and the operator confirms that no external users are invited.

## Follow-up Implementation Notes

- Implement `src/proxy.ts` only after route allowlist and auth callback behavior are verified.
- Keep authorization checks inside route handlers and server components; proxy must not be the only security layer.
- Add smoke tests for maintenance enabled/disabled states.
