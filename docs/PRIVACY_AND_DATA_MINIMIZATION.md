# Privacy And Data Minimization

## Stored For IOD Leads

The lead submission stores:

| Category | Stored Data |
| --- | --- |
| Contact | Name, company, email, optional phone, consent booleans. |
| Checker answers | Public checker answer map needed to reconstruct the IOD decision. |
| Compliance result | Server-recomputed result, trigger, scale, and missing-information facts. |
| Source | Campaign/page/placement/UTM fields when supplied. |
| Request metadata | Hashed IP, normalized referrer origin/path, and user-agent family. |

## Not Stored

The endpoint must not persist:

| Data | Reason |
| --- | --- |
| Turnstile token | Single-use verification secret. |
| Raw IP address | Not needed for CRM lead handling. |
| Full user-agent string | Too identifying for current needs. |
| Referrer query string | Can contain campaign IDs or personal data. |
| Unknown CRM/internal fields from public payload | Public clients must not set CRM state. |

## Public Payload Boundary

`src/server/leads/iod-schema.ts` is strict. Fields such as `ownerId`, `status`, `internalNote`, `userId`, Prisma IDs, or CRM stage overrides are rejected.
