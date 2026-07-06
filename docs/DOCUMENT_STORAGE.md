# Document storage

Generated files are private Cloudflare R2 objects. The UI never renders raw `fileKey`.

Storage keys use the format:

```txt
organizations/{organizationId}/orders/{orderId}/order-items/{orderItemId}/documents/{generatedDocumentId}/{fileType}/{safeFileName}
```

`safeFileName` strips unsafe characters and does not include personal data or company names.

Uploads use `uploadPrivateObject` from `src/server/storage/r2.ts`. Downloads use `createPrivateDownloadUrl` only after ACL checks.

## Development template fallback

If no active R2 template exists and `NODE_ENV !== "production"`, Phase 6R can render a minimal development/sample DOCX from controlled variables. Production generation is blocked without a reviewed R2 DOCX template.

## Supabase note

These tables are accessed server-side through Prisma. If any table is later exposed through Supabase Data API, add reviewed `GRANT` SQL and RLS policies separately. New public tables may not be automatically exposed to Data API in current Supabase defaults.
