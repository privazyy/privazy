# CRM Dashboard

Dashboard now uses database data from `src/server/crm/data.ts`.

Current real sources:

- lead counters and pipeline value from `Lead`,
- organization counters from `Organization`,
- task counters from `CrmTask`,
- document job counters from `DocumentGenerationJob`,
- generated document counters from `GeneratedDocument`,
- audit activity from `AuditLog`.

Partial sections:

- orders use document generation jobs as a proxy,
- commerce/payments/invoices are missing dedicated tables,
- breach and DSR are controlled empty states until modules exist.
