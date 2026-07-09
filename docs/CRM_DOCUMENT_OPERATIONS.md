# CRM document operations

Added:
- `GET /api/crm/documents/jobs`
- `GET /api/crm/documents/jobs/[jobId]`
- `POST /api/crm/documents/jobs/[jobId]/retry`
- `GET /api/crm/documents/generated`
- `GET /api/crm/documents/generated/[documentId]`
- `POST /api/crm/documents/generated/[documentId]/review`
- `POST /api/crm/documents/generated/[documentId]/approve`
- `POST /api/crm/documents/generated/[documentId]/reject`
- `GET /api/crm/documents/files/[fileId]/downloads`
- `GET /api/crm/documents/organizations/[organizationId]/downloads`

CRM document serializers return safe file metadata:
- id
- format
- fileName
- contentType
- sizeBytes
- secureDownloadAvailable

They do not return raw `fileKey`, provider payloads, or worker stack traces.

Retry and review actions are server-side role checked and audited.
