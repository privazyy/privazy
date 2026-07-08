# Audit Gap Closure Plan

## Closed Or Reduced In This PR

| Gap | Result |
| --- | --- |
| No protected download endpoint | Added `/api/documents/files/[fileId]/download`. |
| No server-side permission check | Added `src/server/documents/download-permissions.ts`. |
| No download audit | Added `DocumentDownload` model and migration. |
| Raw keys in audit metadata | Removed `docxFileKey` from `document.generated` metadata. |
| Raw keys/cross-tenant IDs in CRM/TRPC document paths | Added safe serializers, scoped CLIENT job lists to linked organizations, and removed known raw-key response paths. |
| Long default signed URL TTL | Changed default private download TTL to 60 seconds with 300 second cap. |
| Cross-tenant status oracle | Tenant ownership is checked before readiness, so foreign documents always return a safe `404`. |
| Download audit exposure/retention | Enabled RLS, revoked Supabase Data API roles, and changed audit relations to restrictive deletion. |

## Remaining Gaps

| Gap | Recommended follow-up |
| --- | --- |
| No automated test runner on `main` | Add or merge test harness, then automate the smoke checklist. |
| No normalized `GeneratedDocumentFile` model | Add per-file status, size, checksum, and client visibility when the lifecycle expands. |
| Document generation endpoint still has broader security questions | Handle in a separate generation/auth PR, not in this download-focused PR. |
| Commerce/checkout still missing | Next recommended PR remains `[commerce] add sandbox checkout foundation`. |

## Supabase/Data API Note

`DocumentDownload` is created in Supabase `public`, but its migration enables
RLS and revokes all access from `anon` and `authenticated` when those roles
exist. It has no Data API policies. The app accesses the table through the
trusted server-side Prisma runtime connection, never a browser Supabase client.
