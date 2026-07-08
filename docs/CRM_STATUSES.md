# CRM Statuses

Lead statuses:

- `NEW`, `TO_CONTACT`, `CONTACTED`
- `QUALIFIED`, `UNQUALIFIED`
- `PROPOSAL_SENT`
- `CONVERTED`
- `WON`, `LOST`
- `ARCHIVED`

Lead priorities: `LOW`, `NORMAL`, `HIGH`, `URGENT`.

Organization statuses: `PROSPECT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`.

Task statuses: `OPEN`, `IN_PROGRESS`, `DONE`, `CANCELLED`. Task workflow is schema-only in this PR.

Status values are validated by Zod and Prisma enums. Conversion alone owns the combined organization link, `convertedAt` timestamp and `CONVERTED` transition.
