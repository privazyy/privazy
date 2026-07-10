# CRM notes and timeline

## Notes

Notes are internal only and are not exposed to `CLIENT`. A note can be added to a lead or organization. The server validates body length and writes an audit/activity event.

Current gap: note edit/archive policy is not implemented in this PR.

## Timeline

Timeline is backed by `AuditLog` instead of a separate `CrmActivity` table. This keeps the implementation additive and avoids a migration in this PR.

Timeline events include:

- lead created/updated/status changed/assigned/converted/archived
- organization created/updated/archived
- contact created/updated
- task created/updated/assigned/completed/cancelled
- note added

Timeline reads are paginated and require CRM read access.
