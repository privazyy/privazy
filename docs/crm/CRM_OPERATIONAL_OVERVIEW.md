# CRM Operational Overview

This PR moves CRM from a partial shell toward an operational staff tool by using existing database models instead of mock rows.

Ready in this PR:

- guarded staff `/crm`,
- DB-backed dashboard,
- leads and organizations core CRUD,
- notes,
- tasks,
- contacts create foundation,
- audit-based activity/timeline endpoints,
- bounded list queries and Zod validation for new APIs.

Partial or missing:

- commerce, payments and invoices,
- breach and DSR operations,
- notifications,
- document review/retry/download history,
- full automated tests.

Production readiness remains `NO`.
