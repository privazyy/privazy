# Turnstile Setup

## Required Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Browser | Preferred public site key for the form widget. |
| `TURNSTILE_SECRET_KEY` | Server | Preferred secret key for server verification. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Browser | Backward-compatible public key alias. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Server | Backward-compatible secret key alias. |
| `TURNSTILE_BYPASS_IN_DEV` | Server | Optional local-only bypass when set to `true` outside production. |

## Production Rule

Production must have a public site key and a server secret. `TURNSTILE_BYPASS_IN_DEV=true` is ignored when `NODE_ENV=production`.

If the server secret is missing, `/api/leads/iod` returns a safe configuration error and does not write the lead.

## Local Development

For local UI work without a Turnstile project, set:

```bash
TURNSTILE_BYPASS_IN_DEV=true
```

Do not use this setting in Vercel production or preview environments intended for security validation.
