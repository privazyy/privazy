# Go-Live Checklist

This checklist must be completed before changing the launch decision from `DO_NOT_LAUNCH`.

## Security

- [ ] Private routes protected server-side.
- [ ] CRM protected server-side.
- [ ] `CLIENT` blocked from CRM.
- [ ] `READ_ONLY` mutation blocked.
- [ ] Tenant isolation tested for portal, CRM, documents and downloads.
- [ ] Secure download route tested.
- [ ] Public forms protected against abuse.
- [ ] No raw `fileKey` exposed to users.
- [ ] No stack traces exposed in API responses.

## Env

- [ ] Production env configured.
- [ ] Staging env configured.
- [ ] Required secrets present in Vercel/Supabase only.
- [ ] Secrets not committed.
- [ ] Feature flags reviewed.
- [ ] Live flags intentionally enabled or disabled.

## Database

- [ ] Migrations reviewed.
- [ ] Migration backup exists.
- [ ] Seed/admin account prepared.
- [ ] Rollback strategy ready.
- [ ] Backup restore tested or manual restore plan approved.

## Storage

- [ ] R2 bucket private.
- [ ] Upload works.
- [ ] Download works through guarded path.
- [ ] No public file exposure.

## Email

- [ ] Email mode selected: disabled, mock, staging or live transactional.
- [ ] Test email sent.
- [ ] Email logging verified if module exists.
- [ ] No marketing email without explicit consent.

## Commerce

- [ ] Products reviewed.
- [ ] Checkout mode reviewed.
- [ ] Payments mode reviewed.
- [ ] Invoice mode reviewed.
- [ ] Legal terms linked.
- [ ] `ENABLE_LIVE_PAYMENTS` remains disabled unless separately approved.
- [ ] `ENABLE_LIVE_INVOICES` remains disabled unless separately approved.

## Documents

- [ ] Generator tested.
- [ ] Template reviewed.
- [ ] Secure download tested.
- [ ] Retry behavior tested.
- [ ] Generated document ownership and organization scope verified.

## Legal

- [ ] Regulamin approved.
- [ ] Privacy policy approved.
- [ ] Cookies policy approved.
- [ ] Sales terms approved.
- [ ] Disclaimer approved.
- [ ] Company data complete.

## Monitoring

- [ ] Error monitoring active.
- [ ] Logs accessible.
- [ ] Alerts configured.
- [ ] Incident contact defined.

## Support

- [ ] Support inbox ready.
- [ ] Escalation path ready.
- [ ] First user onboarding ready.
- [ ] Manual issue log prepared.
