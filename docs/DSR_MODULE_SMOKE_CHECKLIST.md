# DSR Module Smoke Checklist

## Database

- [ ] Apply migration in non-production environment.
- [ ] Verify `DataSubjectRequest`, `DataSubjectRequestActivity` and `CrmTask.dataSubjectRequestId`.
- [ ] Confirm RLS is enabled and direct `anon` / `authenticated` grants are revoked.

## Portal

- [ ] `CLIENT` with `ClientProfile` can open `/platforma/wnioski-osob`.
- [ ] `CLIENT` cannot create a request for arbitrary `organizationId`.
- [ ] `CLIENT` can create draft, edit draft and submit.
- [ ] Submitted request gets `receivedAt`, `dueAt` and `verificationStatus=PENDING`.
- [ ] Client from another organization receives `404` for foreign request id.

## CRM

- [ ] `READ_ONLY` can open `/admin/dsr` and detail but cannot mutate through API.
- [ ] `OPERATOR` can update status, identity verification and notes.
- [ ] `OPERATOR` cannot prepare response.
- [ ] `LAWYER` and `ADMIN` can prepare response.
- [ ] Timeline includes public and internal events as expected.

## Audit

- [ ] AuditLog rows are written for create, submit, staff update, status, identity, response and notes.
- [ ] Audit metadata does not include full request description, note body or response draft.

## Production

- [ ] Do not mark production ready from this PR.
