# CRM Operational Smoke Checklist

## Auth

- [ ] Unauthenticated `/crm` blocked.
- [ ] CLIENT `/crm` blocked.
- [ ] READ_ONLY can enter admin.
- [ ] READ_ONLY cannot mutate CRM APIs.
- [ ] OPERATOR can mutate leads, organizations and tasks.
- [ ] LAWYER can access legal/document-ready CRM areas.
- [ ] ADMIN can access all CRM areas.

## Dashboard

- [ ] Dashboard loads.
- [ ] Dashboard has no mock numbers for core modules.
- [ ] Empty states work with empty database.
- [ ] Task overdue counters are real.

## Leads

- [ ] Create lead.
- [ ] Edit lead.
- [ ] Assign lead.
- [ ] Change status.
- [ ] Add note.
- [ ] Add task.
- [ ] Add contact.
- [ ] Convert to organization.

## Organizations

- [ ] Create organization.
- [ ] Edit organization.
- [ ] Add contact.
- [ ] Add note.
- [ ] Add task.

## Tasks

- [ ] List tasks.
- [ ] Create task.
- [ ] Assign task.
- [ ] Complete task.
- [ ] Overdue task appears in dashboard.

## Documents

- [ ] Document list loads.
- [ ] Job list proxy loads.
- [ ] No raw file key exposed in CRM API responses.

## Breach, DSR And Notifications

- [ ] Breach shows controlled empty/partial state.
- [ ] DSR/request view shows controlled empty/partial state.
- [ ] Notifications do not expose client-only or sensitive payload.

## Errors

- [ ] No raw Prisma error returned.
- [ ] No stack trace returned.
