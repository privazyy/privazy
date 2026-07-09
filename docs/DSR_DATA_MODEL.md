# DSR Data Model

## Prisma Models

`DataSubjectRequest`

- `organizationId`: tenant boundary.
- `reportedById`: client user that created the request, nullable for future imports.
- `assignedToId`: CRM staff owner.
- requester fields: name, email, phone, relationship.
- request fields: type, status, priority, description, channel, additional info.
- deadline fields: receivedAt, dueAt, extensionUntil, extensionReason, closedAt.
- identity fields: verificationStatus, verificationMethod, verificationNote, verifiedAt.
- response fields: responseSummary, responseDraft, responseDecision, responsePreparedAt, responseSentAt, decisionRationale.

`DataSubjectRequestActivity`

- timeline entries for public and internal events.
- internal activity may include staff notes.
- audit metadata intentionally stores booleans, statuses and IDs instead of full request or response content.

`CrmTask`

- optional `dataSubjectRequestId` links a task to a DSR.
- parent check now accepts lead, organization or DSR.

## Supabase Postgres Security

The migration enables RLS on DSR tables and revokes direct `anon` / `authenticated` grants. Runtime access goes through server-side Prisma authorization.
