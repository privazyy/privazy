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
| `source` | `CLIENT_PORTAL`, `CRM`, or `API`. |
| `downloadedAt` | Time signed URL was issued. |
| `ipHash` | Salted hash of request IP. |
| `userAgentHash` | Salted hash of user agent. |

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
