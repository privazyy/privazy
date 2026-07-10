# Staging Smoke Test Plan

Run only against a non-production staging database and staging deployment.

## Public

- [ ] Landing loads.
- [ ] Blog loads.
- [ ] Legal routes load: privacy policy, terms, sales terms, cookies.
- [ ] IOD checker submit works with validation.
- [ ] Newsletter subscribe works after CMS/newsletter branch is merged.

## Auth

- [ ] Login succeeds.
- [ ] Logout succeeds.
- [ ] Unauthenticated private route redirects or returns `401`.
- [ ] CLIENT can access portal only.
- [ ] CLIENT cannot access `/admin` or `/api/crm/*`.
- [ ] READ_ONLY can read admin CRM.
- [ ] READ_ONLY cannot create/update/publish/mutate.
- [ ] OPERATOR/LAWYER/ADMIN role checks match policy.

## Commerce

- [ ] Product route loads.
- [ ] Cart persists expected item.
- [ ] Checkout sandbox creates order.
- [ ] Mock payment marks order paid.
- [ ] Paid order creates document input requirement.

## Documents

- [ ] Client saves input draft.
- [ ] Client submits input.
- [ ] Generation job is created from paid item only.
- [ ] Inngest worker processes job.
- [ ] DOCX uploads to private R2.
- [ ] Client downloads through secure endpoint.
- [ ] CRM sees job and document.
- [ ] Download audit is recorded.

## CRM

- [ ] Leads list/detail/create/update.
- [ ] Organizations list/detail/create/update.
- [ ] Notes and tasks.
- [ ] Orders/payments/invoices/documents.
- [ ] Breach and DSR modules.
- [ ] CMS.

## Portal

- [ ] Dashboard.
- [ ] Orders.
- [ ] Documents.
- [ ] Organization.
- [ ] Breach.
- [ ] DSR.
- [ ] Notifications.

## Ops

- [ ] Application logs.
- [ ] EmailLog.
- [ ] AutomationRun or equivalent.
- [ ] Supabase backups.
- [ ] Monitoring and alerting.
- [ ] No production secrets in staging.
