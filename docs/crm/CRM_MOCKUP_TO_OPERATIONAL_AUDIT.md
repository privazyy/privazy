# CRM mockup-to-operational audit

Audit base: `main` plus the operational core incorporated by this branch. The old single `/admin` shell was database-backed for leads and organizations but mixed real records with prototype-only modules and lacked first-class task/contact/archive operations and canonical detail URLs.

| Area | Current route | Target route | Data source | Mock/real | Missing operations | Security status | Required fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | legacy `/admin` | `/crm` | Prisma | Real core KPIs | Some adjacent-module queues | Staff guard | Keep partial modules explicit |
| Leads | in-shell | `/crm/leads` | `Lead` | Real | Dedicated server-rendered detail remains partial | Guarded API | QA and performance |
| Clients | in-shell | `/crm/clients` | `Organization`, `ContactPerson` | Real | Note edit/archive | Guarded API | Follow-up policy |
| Tasks | partial shell | `/crm/tasks` | `CrmTask` | Real | Dedicated task detail UX is partial | Guarded API | QA detail flow |
| Notes | record detail | nested in lead/client | `CrmNote` | Real | Edit/archive policy | Guarded mutation | Follow-up |
| Timeline | record detail | nested in lead/client | `AuditLog` | Real | Dedicated `CrmActivity` model | Bounded read | Optional model |
| Orders | shell module | `/crm/orders` | document-job proxy | Partial | Real order model/workflow | Staff guard | Separate PR |
| Documents | shell module | `/crm/documents` | document tables | Partial | Full review workflow | Staff guard | Separate PR |
| Settings/audit | shell module | `/crm/settings`, `/crm/audit` | `AuditLog`/controlled state | Partial | IAM/settings workflows | Staff/admin split partial | Harden |

Real DB mutations exist for lead create/edit/status/assign/note/task/convert/archive, organization create/edit/archive/contact/note/task, and task create/edit/assign/status/complete/cancel. They use Zod, service-level role assertions, bounded reads, safe errors, and `AuditLog` activity. `CLIENT` is denied; `READ_ONLY` can read and cannot mutate.

Prototype arrays remain in `crm-data.ts` only as legacy design-reference constants; server output is built in `src/server/crm/data.ts`. They are not presented as DB truth. Modules without durable models render controlled partial/empty states. Remaining blockers are live role-matrix smoke, disposable-DB persistence testing, staging env verification, and production preflight.
