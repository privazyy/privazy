# Document Query Security

Document query endpoints must enforce tenant isolation on the server. UI filtering is not a security boundary.

## Protected Query Policy

- Anonymous users cannot call document tRPC queries.
- CLIENT users can read only organizations linked through `ClientProfile`.
- `ADMIN`, `LAWYER`, `OPERATOR`, and `READ_ONLY` can read document query surfaces as staff.
- `READ_ONLY` remains read-only and must not be used for document mutations.
- Staff-wide read access is temporary because the schema does not yet contain lawyer/operator assignment tables.

## Current Query Behavior

`documents.listJobs`:

- validates `organizationId`, `status`, and `limit`,
- caps `limit` at 100,
- resolves organization scope before querying jobs,
- filters CLIENT queries to owned organizations,
- allows staff to optionally filter by organization,
- returns serialized job data without raw file keys.

`documents.activeTemplates`:

- validates `type` and `limit`,
- returns only `ACTIVE` templates,
- uses explicit Prisma `select`,
- returns serialized metadata without `fileKey` or `variablesSchema`.

## Error Policy

- Missing session returns tRPC `UNAUTHORIZED`.
- Role or organization mismatch returns `FORBIDDEN` for list queries.
- Resource detail helpers return `NOT_FOUND` for inaccessible resources to avoid confirming whether another tenant's resource exists.
- Raw Prisma errors and stack traces must not be returned by document query procedures.

