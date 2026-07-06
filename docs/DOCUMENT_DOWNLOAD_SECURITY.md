# Document download security

Download endpoint:

```txt
GET /api/documents/[documentId]/download/[fileId]
```

Security rules:

- authentication is required,
- client users can access only their organization documents,
- internal roles can access organization-scoped documents,
- `READ_ONLY` is blocked from downloads in Phase 6R policy,
- the endpoint returns `404` for missing or unauthorized documents where possible,
- every successful download creates `DocumentDownload`,
- every successful download writes an audit log,
- raw `fileKey` is never returned to the browser,
- signed URLs expire quickly.

`DocumentDownload` stores user, organization, generated document, file, timestamp, and request IP/user agent when available.
