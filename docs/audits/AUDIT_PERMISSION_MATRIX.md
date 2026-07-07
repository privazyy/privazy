# PRIVAZY - Audit Permission Matrix

| Action | ADMIN | LAWYER | OPERATOR | READ_ONLY | CLIENT | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Read CRM | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BROKEN | `/admin` has no auth/role guard, so CLIENT/anonymous are not blocked. |
| Read CRM leads API | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BROKEN | `/api/crm/leads` is public. |
| Mutate lead | N/A | N/A | N/A | N/A | N/A | MISSING | No CRM lead mutation API. |
| Mutate order | N/A | N/A | N/A | N/A | N/A | MISSING | No order model/API. |
| Mark order paid | N/A | N/A | N/A | N/A | N/A | MISSING | No payment/order workflow. |
| Review document | N/A | N/A | N/A | N/A | N/A | MISSING | No `DocumentReview`. |
| Retry document job | N/A | N/A | N/A | N/A | N/A | MISSING | No retry endpoint/UI. |
| Request document generation | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BROKEN | Public endpoint accepts `createdById` and `organizationId`. |
| Download document | N/A | N/A | N/A | N/A | N/A | MISSING | No permission-checked download route. |
| Read client portal | N/A | N/A | N/A | N/A | PARTIAL | SCAFFOLD | `/client` is public placeholder; `/platforma` missing. |
| Create breach | N/A | N/A | N/A | N/A | N/A | MISSING | No breach model/API/UI. |
| Create DSR | N/A | N/A | N/A | N/A | N/A | MISSING | No DSR model/API/UI. |
| Publish blog post | N/A | N/A | N/A | N/A | N/A | MISSING | Static blog only. |
| Manage users | N/A | N/A | N/A | N/A | N/A | MISSING | User table exists, but no admin mutations. |
| Manage settings | N/A | N/A | N/A | N/A | N/A | MISSING | CRM settings is read-only/scaffold. |
| View audit logs | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BROKEN | Audit rows would be visible through public CRM. |
| Retry automation | N/A | N/A | N/A | N/A | N/A | MISSING | No `AutomationRun`. |

Conclusion: roles exist as an enum, but there is no enforceable role/permission layer on current `main`.
