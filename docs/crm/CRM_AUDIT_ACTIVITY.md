# CRM Audit And Activity

Status: `READY/PARTIAL`.

`AuditLog` is used for formal CRM mutation evidence and current timeline endpoints.

Logged in this PR scope:

- task created,
- task updated/status changed,
- contact created,
- existing lead/org/note/conversion events.

Do not log:

- full breach descriptions,
- full DSR content,
- full document input,
- raw request bodies,
- secrets,
- signed URLs,
- raw file keys,
- raw payment or invoice provider payloads.
# Leads, clients and tasks audit addendum

This PR centralizes CRM activity writes through `createCrmActivity`, backed by `AuditLog`.

Important actions logged:

- `crm.lead.created`
- `crm.lead.updated`
- `crm.lead.status_changed`
- `crm.lead.assigned`
- `crm.lead.converted`
- `crm.lead.archived`
- `crm.organization.created`
- `crm.organization.updated`
- `crm.organization.archived`
- `crm.contact.created`
- `crm.contact.updated`
- `crm.task.created`
- `crm.task.updated`
- `crm.task.assigned`
- `crm.task.completed`
- `crm.task.cancelled`
- `crm.lead.note_added`
- `crm.organization.note_added`

Audit metadata is reduced to operational identifiers/status fields and does not store raw request bodies or secrets.
