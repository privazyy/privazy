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
# Leads, clients and tasks dashboard addendum

The `/crm` dashboard is DB-backed and now prioritizes daily CRM work:

- new leads
- unassigned leads
- qualified leads
- active clients
- open tasks
- today's tasks
- overdue tasks
- recent audit/activity events

No mock counters are used for these cards. Empty states are allowed when the database has no matching records.
