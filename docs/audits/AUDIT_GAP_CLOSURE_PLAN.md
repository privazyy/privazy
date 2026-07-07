# Audit Gap Closure Plan

## Closed In This Branch

| Gap | Closure |
| --- | --- |
| Public form accepted broad data | Strict Zod schema for the public IOD lead contract. |
| Missing abuse throttling | IP, email, and invalid-payload limits added. |
| Missing bot challenge | Server-side Cloudflare Turnstile verification added. |
| Overly detailed public errors | Public error mapping added with safe codes and messages. |
| Public-to-CRM trust leakage | CRM lead API now requires authenticated CRM read role. |
| Excess request metadata | Stored request metadata is minimized and hashed. |

## Still Open

| Gap | Required Follow-up |
| --- | --- |
| Distributed rate limiting | Move rate counters to shared infrastructure before production launch. |
| Automated security regression tests | Add a test runner or merge the existing test-harness work, then automate the smoke checklist. |
| Production Turnstile configuration | Set site and secret keys in Vercel environments and verify with real tokens. |

## Recommended Next Step

Do not mark launch readiness as complete from this PR alone. Merge this as a security hardening step, then close the distributed limiter and automated regression gaps before public campaign traffic.
