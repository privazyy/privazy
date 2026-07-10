# Tenant Isolation Audit

| Scenario | Expected result | Test/manual command | Actual result | Decision |
| --- | --- | --- | --- | --- |
| CLIENT org A cannot see org B orders | 403/404 | Requires portal/order API | Order model/API missing | MISSING |
| CLIENT org A cannot see org B documents | 403/404 | Requires portal document API | No secure portal document API | MISSING |
| CLIENT org A cannot download org B file | 403/404 | Requires guarded download route | No download route exists | BLOCKED |
| CLIENT org A cannot see org B breach | 403/404 | Requires breach API | Breach model/API missing | MISSING |
| CLIENT org A cannot see org B DSR | 403/404 | Requires DSR API | DSR model/API missing on `main` | MISSING |
| CLIENT org A cannot see org B notifications | 403/404 | Requires notification API | Notification model/API missing | MISSING |
| CLIENT cannot force organizationId | Server derives org from session | Submit forged `organizationId` to portal/document endpoints | `/api/documents/generate` accepts caller-controlled `organizationId` | FAIL |
| Staff access follows role policy | STAFF read/write by role, READ_ONLY read only | CRM API route inspection | CRM read/write guards exist | PARTIAL |
| CRM serializers are safe | No password hashes/raw snapshots in lists | Serializer inspection | Lead/org serializers bounded | PARTIAL |

Decision: `STAGING_NO_GO`. Tenant isolation cannot be accepted until client portal, document input/download, orders, breach, DSR, and notifications are implemented and tested against two organizations.
