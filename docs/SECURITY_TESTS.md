# Security Tests

Security tests live in `tests/security`.

Covered areas:

- `permissions.test.ts`: CRM read/mutation access, admin-only actions, document review/retry, and client portal access.
- `route-policy.test.ts`: public/private route classification and protection for `/admin`, `/api/crm/leads`, `/documents`, `/uploads`, `/client`, and `/platforma`.
- `crm-api.test.ts`: CRM API read/mutation guards, limit validation, and lead serialization.
- `document-generation.test.ts`: generation guard, unauthenticated/client/read-only denial, staff allowance, and trusted `createdById`.
- `tenant-scope.test.ts`: organization membership checks and document read assertions.
- `document-serializers.test.ts`: no raw `fileKey` values or worker errors in client-facing document output.
- `env-and-errors.test.ts`: env validation, safe config error shape, HTTP error shape, and redaction.

Run:

```bash
npm run test:security
```

These tests intentionally avoid production data and do not connect to Supabase.

Still manual:

- End-to-end login/session behavior.
- Supabase RLS and Data API grants.
- Secure download authorization.
- Lead endpoint abuse protection.
