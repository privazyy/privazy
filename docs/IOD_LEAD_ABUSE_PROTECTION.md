# IOD Lead Abuse Protection

## Flow

1. Read client IP from trusted proxy headers and hash it before logging.
2. Apply per-IP rate limit before reading the body.
3. Reject bodies larger than 20 KB.
4. Validate with the strict public IOD lead schema.
5. Throttle repeated invalid payloads.
6. Apply per-email rate limit.
7. Suppress honeypot submissions with neutral success.
8. Verify Cloudflare Turnstile server-side.
9. Recompute the IOD result server-side from submitted answers.
10. Store minimized lead data and request metadata.

## Abuse Events

The route logs `public_form_abuse_event` with only:

| Field | Meaning |
| --- | --- |
| `event` | `honeypot_triggered`, `duplicate_suppressed`, `invalid_payload_spike`, `rate_limited`, or `forbidden`. |
| `ipHash` | SHA-256 marker salted with `ABUSE_LOG_HASH_SALT` when configured. |
| `route` | Static route name. |

Raw IPs, full user agents, tokens, and request bodies must not be logged.

## Known Limit

Current rate limiting is process-local memory. It reduces accidental bursts and basic abuse, but it is not a complete distributed limit for serverless production. For production hardening, move counters to a shared store such as Vercel KV, Upstash Redis, Cloudflare KV, or a Postgres-backed limiter.
