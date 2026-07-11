# CRM operational deployment smoke checklist

Local (`http://localhost:3000`):

- [ ] Public `/` loads; unauthenticated `/crm` redirects to login.
- [ ] `ADMIN` dashboard loads with DB values or controlled empty states.
- [ ] Create/edit/status/assign/note/task/convert a lead and confirm persistence after refresh.
- [ ] Create/edit a client, add/edit a contact and add a note/task.
- [ ] Create/assign/complete/cancel a task and verify timeline/audit entries.
- [ ] `READ_ONLY` can read but UI disables writes and direct write API returns 403.
- [ ] `CLIENT` cannot open `/crm` or call `/api/crm/*`.
- [ ] `/admin` and a nested legacy URL redirect to the matching `/crm` URL.

Production repeats the same checks against the approved domain, then verifies runtime logs contain no critical errors. Do not run mutation smoke against production without approved disposable test records and cleanup ownership.
