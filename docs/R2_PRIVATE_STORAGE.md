# R2 Private Storage

Generated documents remain private Cloudflare R2 objects.

## Rules

| Rule | Status |
| --- | --- |
| Do not make the R2 bucket public. | Preserved. |
| Do not expose `docxFileKey`, `pdfFileKey`, `zipFileKey`, or template `fileKey` to client/API responses. | Implemented for known document/CRM/TRPC paths. |
| Generate signed URLs only server-side after permission checks. | Implemented. |
| Use short TTL signed URLs. | Default 60 seconds, capped at 300 seconds. |
| Do not log signed URLs or raw storage keys. | Implemented for the new download flow and generation audit metadata. |

## Helper Behavior

`createPrivateDownloadUrl(key, ttl)` is server-only and defaults to `getPrivateDownloadUrlTtlSeconds()`.

`downloadPrivateObject` no longer includes the object key in the empty-object error message.

## Follow-up

If future code sends generated documents by email, the email should link to an authenticated app route, not to a long-lived signed URL.
