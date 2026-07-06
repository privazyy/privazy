# Email Operations

Status: **BLOCKED - production email not verified**

## Required before production email

- Resend domain verified.
- `RESEND_API_KEY` present only in production secrets.
- `RESEND_FROM` approved by legal/support.
- Bounce/failure handling documented.
- Email log or provider log access assigned.
- Marketing emails disabled until consent/legal approval.

## Smoke test

1. Send or dry-run a transactional test email.
2. Verify sender, subject, links and footer.
3. Verify provider log.
4. Verify failure path and support fallback.

## Stop conditions

- Domain not verified.
- Email contains unapproved legal copy.
- Provider logs inaccessible.
- No owner for failures/bounces.
