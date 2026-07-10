# CRM Data Model

Core operational models currently used:

- `Lead`
- `Organization`
- `ContactPerson`
- `CrmNote`
- `CrmTask`
- `AuditLog`
- `User`
- `FormSubmission`
- `DocumentTemplate`
- `DocumentGenerationJob`
- `GeneratedDocument`

No migration was added in this PR. New CRM behavior uses existing tables.

Missing future models:

- `Order`
- `Payment`
- `Invoice`
- `DocumentInput`
- `GeneratedDocumentFile`
- `DocumentDownload`
- `BreachIncident`
- `DataSubjectRequest`
- `Notification`
- dedicated `CrmActivity`
