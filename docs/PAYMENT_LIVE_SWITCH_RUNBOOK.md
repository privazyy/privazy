# Payment Live Switch Runbook

Status: **BLOCKED - do not switch live payments**

Live payments require explicit manual approval. This PR does not enable live payments.

## Preconditions

- Provider contract confirmed.
- Legal and refund policy approved.
- `ENABLE_CHECKOUT=true` approved.
- `ENABLE_LIVE_PAYMENTS=false` until final approval.
- Live keys present in production env, never in repo.
- Webhook URL configured.
- Signature verification tested.
- Sandbox reconciliation completed.

## Switch steps

1. Confirm written approval from business and finance owner.
2. Confirm provider dashboard is in live mode.
3. Confirm webhook secret and endpoint.
4. Run a small transaction if provider and policy allow it.
5. Verify order status, reconciliation and email.
6. Verify invoice creation or manual fallback.
7. Enable `ENABLE_LIVE_PAYMENTS=true`.
8. Monitor first transactions in real time.

## Stop conditions

- Signature verification fails.
- Duplicate or missing payment event.
- Invoice cannot be issued or fallback is unclear.
- Refund policy is not published.
- Monitoring owner is offline.
