# Marketing Launch Gate

Status: **BLOCKED - marketing must not start before product stability**

## Conditions before paid campaigns

| Condition | Status | Owner |
| --- | --- | --- |
| Checkout stable | BLOCKED | Engineering/Payments |
| Payment stable | BLOCKED | Finance/Payments |
| Document generator stable | BLOCKED | Engineering/Legal |
| CRM lead handling stable | BLOCKED | Sales/Ops |
| Support ready | BLOCKED | Support/Ops |
| Analytics ready | MANUAL_VERIFICATION_REQUIRED | Marketing/Ops |
| Legal docs approved | BLOCKED | Legal |
| No P0/P1 production issues for agreed period | NOT_STARTED | Product/Ops |

## Marketing stages

1. No paid traffic during technical launch.
2. Limited organic traffic after smoke pass.
3. Limited paid traffic only after first stability checkpoint.
4. Full marketing only after product, support and legal owners approve.

## Non-acceptable marketing risks

- Live payments unapproved.
- Legal docs not approved.
- Support owner unavailable.
- Checkout/generator unstable.
- Monitoring not active.
