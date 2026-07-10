# CRM Document Operations

Status: `PARTIAL`.

Current real sources:

- `DocumentTemplate`
- `DocumentGenerationJob`
- `GeneratedDocument`

Current gaps:

- no dedicated `DocumentInput`,
- no guarded CRM retry endpoint,
- no approval/reject workflow,
- no `DocumentDownload` history,
- no file API that returns downloads without raw `fileKey`.

Serializers and future APIs must never expose raw storage keys or signed URLs.
