# Audit findings delta

This file records the audit delta for PR `[security] protect private routes and CRM access`.

## Status

- Overall go/no-go: NO-GO remains.
- Staging readiness: NO.
- Production readiness: NO.

## Updated findings

| ID | Finding | Status after PR | Notes |
| --- | --- | --- | --- |
| P0-001 | `/admin` has no auth/role guard | FIXED | `/admin` is guarded by `src/proxy.ts` and `requireCrmAccess()` before CRM data load. |
| P0-005 | No central guard for private routes | PARTIAL | `src/server/auth/routes.ts` and `src/proxy.ts` classify and guard private route families. Future private APIs still need route-level reviews. |
| P0-006 | Missing env causes private route 500 | PARTIAL | Anonymous `/admin` no longer triggers CRM DB access; staff receives a controlled configuration state when `DATABASE_URL` is missing. Full env readiness remains separate. |
| P0-002 | `/api/crm/leads` is public | PARTIAL | Current GET endpoint has `requireCrmAccess()` and proxy coverage, but the broader CRM API hardening PR is still required. |
| P0-003 | `/api/documents/generate` is public and trusts client IDs | NOT FIXED | Intentionally left for `[security] gate document generation by auth and organization`. |
| P0-004 | tRPC document queries are not tenant scoped | NOT FIXED | Intentionally left for `[security] enforce organization scope in document queries`. |
| P0-007 | Raw storage keys can appear in CRM/audit metadata | NOT FIXED | Requires separate storage/download and metadata review. |
