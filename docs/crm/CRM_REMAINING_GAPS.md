# CRM remaining gaps

The CRM is an operational application in code, not a static mock. This statement does not mean the system is production-ready.

## Implemented operational scope

1. Leads, organizations, contacts, notes, tasks, assignment, archive and audited conversion.
2. Orders, payments in mock/sandbox mode, invoices in mock/sandbox mode and document fulfillment.
3. Client document-input workflow, validation, locking, correction, job generation, review and download history.
4. Personal-data breach register with portal intake, risk assessment, status workflow, activity timeline and 72-hour deadline.
5. DSR register with portal intake, identity verification, statutory deadlines, response preparation and timeline.
6. Server-side role boundaries for `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY` and organization-scoped `CLIENT` access.
7. Audit logging and database-derived dashboard alerts.

## Remaining release work

- Rehearse migrations on disposable PostgreSQL and staging.
- Configure live providers, private storage and production environment variables.
- Execute authenticated browser role-matrix and end-to-end smokes against a real database.
- Configure observability, backups, rollback and incident response.
- Decide whether persistent notifications and note revision/archive are required for the first production release.

Production readiness remains `NO-GO` until those release gates are completed.
