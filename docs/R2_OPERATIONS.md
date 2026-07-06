# R2 Operations

Status: **BLOCKED - production bucket not verified**

## Required before document launch

- Production R2 bucket is private.
- Access keys are scoped and stored only as secrets.
- Signed URL expiry is short and tested.
- Raw storage keys are not exposed in UI or public API.
- Download audit is recorded.
- Restore/export procedure exists for generated documents.

## Smoke test

1. Upload a test private object.
2. Confirm public direct access fails.
3. Generate signed URL through protected server path.
4. Confirm URL expires.
5. Confirm audit/download log exists.

## Stop conditions

- Bucket or object is public.
- Signed URLs do not expire.
- Raw file keys appear in browser-visible response.
- Download access is not organization-scoped.
