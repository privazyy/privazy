# DSR Identity Verification

The module stores a verification foundation:

- `verificationStatus`
- `verificationMethod`
- `verificationNote`
- `verifiedAt`

Valid statuses:

- `NOT_STARTED`
- `PENDING`
- `VERIFIED`
- `FAILED`
- `NOT_REQUIRED`

Internal verification notes are visible in CRM only. Portal users see the verification status, not the internal verification note.
