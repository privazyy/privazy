# Document Input Audit Log

Logged actions:
- `document_input.created`
- `document_input.draft_saved`
- `document_input.submitted`
- `document_input.generation_job_created`
- `document_input.needs_correction`
- `document_input.locked`

Metadata includes:
- `documentInputId` when relevant,
- `orderItemId`,
- `orderId`,
- status before/after,
- actor through `AuditLog.userId`,
- generation job id.

Metadata intentionally does not include full `dataJson`, full request body, storage keys, or secrets.
