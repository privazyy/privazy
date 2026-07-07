# Audit Findings

## Scope

Security review for public lead intake and adjacent CRM lead access.

## Findings

| ID | Area | Severity | Status | Notes |
| --- | --- | --- | --- | --- |
| PF-001 | Public IOD lead endpoint | High | Closed in this branch | Added strict schema, body cap, rate limits, honeypot, Turnstile, safe errors, and duplicate suppression. |
| PF-002 | Public payload trust boundary | High | Closed in this branch | Unknown fields are rejected and IOD result is recomputed server-side. |
| PF-003 | CRM leads API boundary | High | Closed in this branch | `/api/crm/leads` now requires authenticated CRM read role. |
| PF-004 | Abuse logging privacy | Medium | Closed in this branch | Logs use hashed IP markers and static event names only. |
| PF-005 | Distributed rate limiting | Medium | Open | Current limiter is in-memory and must be replaced with shared storage for production-grade distributed enforcement. |
| PF-006 | Automated security tests | Medium | Open | `main` has no test runner; checklist coverage is documented in `docs/IOD_LEAD_SECURITY_SMOKE_CHECKLIST.md`. |
