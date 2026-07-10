# API Security Audit

| Category | Auth required | Role check | Org scope | Zod validation | Public abuse protection | Safe errors | Secret/raw data risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public lead | No | No | Creates new org/lead | Yes | Missing limiter/Turnstile | Mostly safe response | Stores raw IP/user agent in `AuditLog` | PARTIAL |
| Newsletter | Expected public | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| CRM | Yes | Yes | Staff-wide, not tenant client | Yes | N/A | Safe wrapper | Serializers bounded | PARTIAL |
| Portal | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| Documents | No on `/api/documents/generate` | No | Caller controlled IDs | Yes | Missing | Validation safe; job errors persist raw message | Public job creation; raw file keys in audit metadata | BLOCKED |
| Downloads | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | R2 helper can sign URLs but no guarded route | MISSING |
| Payments | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| Invoices | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| Breach | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| DSR | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| CMS | Expected | MISSING on `main` | MISSING | MISSING | N/A | MISSING | MISSING | MISSING |
| Notifications | Expected | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |

Critical findings:

1. `/api/documents/generate` is release-blocking because it is public and creates jobs from caller-supplied identifiers.
2. Public lead intake needs durable rate limiting and Turnstile or equivalent before staging RC.
3. Missing API categories cannot be marked ready from draft branch assumptions.
4. No raw Prisma stack traces were observed in CRM wrappers, but public document generation is not protected by the same error wrapper.
