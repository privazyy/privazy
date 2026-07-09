# CRM notes

CRM notes are internal-only notes for staff work on leads and organizations.

## Access

- `ADMIN`, `LAWYER`, `OPERATOR`: read, create and update notes.
- `READ_ONLY`: read notes only.
- `CLIENT`: no access.

## Types

- `GENERAL`
- `CALL`
- `EMAIL`
- `MEETING`
- `LEGAL`
- `INTERNAL`

`visibility` is locked to `INTERNAL`. Note body is plain text with a server-side length limit.

## API

- `GET /api/crm/leads/[leadId]/notes`
- `POST /api/crm/leads/[leadId]/notes`
- `GET /api/crm/organizations/[organizationId]/notes`
- `POST /api/crm/organizations/[organizationId]/notes`
- `PATCH /api/crm/notes/[noteId]`

Note authors are taken from the authenticated session, never from client payload.
