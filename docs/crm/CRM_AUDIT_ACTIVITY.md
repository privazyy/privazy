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
