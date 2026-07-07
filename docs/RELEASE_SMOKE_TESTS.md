# Release Smoke Tests

Release smoke tests live in `tests/smoke`.

Run:

```bash
npm run test:smoke
```

Covered:

- Critical route groups remain classified.
- CRM API guard is importable and denies/permits via the shared policy layer.
- Document generation guard is importable and active.
- Safe error helper exists.
- Env status helper exists and fails closed for missing production env.
- Generated document serializer does not expose file keys.

Not covered in this PR:

- Full browser journey.
- Production or staging URLs.
- Real Supabase database access.
- Payment/checkout/invoice flows.
- Secure download endpoint behavior.

Release status after this PR remains:

- Staging readiness: NO.
- Production readiness: NO.

The smoke suite is a code-level release gate, not a replacement for staging verification.
