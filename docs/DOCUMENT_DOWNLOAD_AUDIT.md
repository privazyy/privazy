# Document Download Audit

## Model

`DocumentDownload` records successful signed URL issuance.

| Field | Purpose |
| --- | --- |
| `fileId` | Synthetic file identifier, not a storage key. |
| `generatedDocumentId` | Generated document record. |
| `organizationId` | Organization resolved from the generated document. |
| `userId` | Authenticated actor. |
| `actorRole` | Role from the database user record. |
| `source` | Constrained enum: `CLIENT_PORTAL`, `CRM`, or `API`. |
| `downloadedAt` | Time signed URL was issued. |
| `ipHash` | Salted hash of request IP. |
| `userAgentHash` | Salted hash of user agent. |

`AUDIT_LOG_HASH_SALT` is preferred for request metadata hashing. `AUTH_SECRET`
or `NEXTAUTH_SECRET` is used as the existing server-secret fallback. If none is
configured, request hashes are omitted rather than generated with a public,
predictable salt.

The migration enables RLS on `DocumentDownload` and revokes all table access
from `PUBLIC` plus Supabase `anon` and `authenticated` roles when they exist. There are no
Data API policies: the table is server-only through the trusted Prisma runtime
connection. Foreign keys use `RESTRICT` deletion behavior so deleting a user,
organization, or generated document cannot silently erase download history.

## Not Stored

The audit record must not store:

| Data | Reason |
| --- | --- |
| Signed URL | It is bearer access to the private object. |
| Raw storage key | It reveals bucket structure and object identity. |
| R2 credentials or tokens | Secrets must never enter audit metadata. |
| Raw IP/full user agent | Not needed for current operational audit. |

## Existing AuditLog Fix

`document.generated` previously stored `docxFileKey` in `AuditLog.metadata`. This PR replaces that with safe file variant metadata.
