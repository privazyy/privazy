# Document Download API

## Endpoint

`POST /api/documents/files/[fileId]/download`

`GET` is also supported for simple browser integration, but UI code should prefer `POST`.

## `fileId`

`fileId` is a synthetic identifier:

```text
<generatedDocumentId>.<variant>
```

Allowed variants:

| Variant | Source key, server-side only |
| --- | --- |
| `docx` | `GeneratedDocument.docxFileKey` |
| `pdf` | `GeneratedDocument.pdfFileKey` |
| `zip` | `GeneratedDocument.zipFileKey` |

Clients must not pass raw storage keys.

## Success Response

```json
{
  "ok": true,
  "url": "https://signed-r2-url.example",
  "expiresAt": "2026-07-07T22:31:00.000Z",
  "file": {
    "fileId": "cmabc123.docx",
    "documentId": "cmabc123",
    "variant": "docx",
    "fileName": "polityka-v1.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "status": "GENERATED",
    "createdAt": "2026-07-07T22:30:00.000Z",
    "downloadUrlEndpoint": "/api/documents/files/cmabc123.docx/download",
    "size": null
  }
}
```

The response does not include storage keys, bucket names, stack traces, Prisma errors, or signed URL in error bodies.
Successful responses set `Cache-Control: private, no-store, max-age=0`.

## Error Responses

| Status | Meaning |
| --- | --- |
| `401` | Missing authenticated session. |
| `404` | Missing file or forbidden cross-tenant file. |
| `409` | File/document status is not ready for this actor. |
| `500` | Safe internal error. |

For `CLIENT`, organization ownership is checked before readiness. A document
outside the actor's organizations therefore returns `404` regardless of its
status.
