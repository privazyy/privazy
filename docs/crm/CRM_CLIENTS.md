# CRM clients

UI calls organizations “Klienci” and uses `/crm/clients`; the API and Prisma model remain `/api/crm/organizations` and `Organization`. The database-backed list/detail flow supports create, edit, archive, contacts, notes, tasks, related leads, and audit-backed timeline. `READ_ONLY` is read-only and `CLIENT` is denied. Note edit/archive and a dedicated server-rendered detail experience remain follow-up work.
