# Support Process

## Channels

| Channel | Purpose | Status |
| --- | --- | --- |
| `support@example.test` | Placeholder support inbox | Replace before launch |
| Internal issue log | Bug/support tracking | Required |
| Emergency contact | SEV1/SEV2 escalation | Required |

## Responsibilities

| Role | Responsibility |
| --- | --- |
| Support owner | First response, ticket classification, user communication |
| Technical owner | Bugs, auth, document, storage, deployment and DB issues |
| Legal/privacy owner | GDPR, DSR, breach, legal copy and paid-launch approvals |
| Product owner | Scope, onboarding and launch decision changes |

## Test SLA

| Severity | First response | Update cadence |
| --- | --- | --- |
| SEV1 | 15 minutes | Every 30 minutes |
| SEV2 | 30 minutes | Every 2 hours |
| SEV3 | 1 business day | Daily |
| SEV4 | 3 business days | As needed |

## Triage

1. Confirm user, organization and route.
2. Classify severity.
3. Check whether feature flag should be disabled.
4. Assign owner.
5. Add reproduction notes.
6. Close only after user impact is resolved or documented.

## Escalation

- Legal/GDPR: any suspected data exposure, DSR/breach deadline issue or unclear legal copy.
- Technical: auth, tenant isolation, document generation, downloads, database, email or deployment issues.
- Finance/legal: payments, invoices, refunds or sales terms.

## Documentation

Each ticket should include status, owner, affected module, affected account/organization placeholder or ID, timeline, reproduction, decision and closure note.
