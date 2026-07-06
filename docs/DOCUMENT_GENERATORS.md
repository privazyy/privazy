# Document generators

Phase 6R builds the secure generator foundation for one document type: `PRIVACY_POLICY`.

## Flow

1. A paid or manually approved `Order` has a document `OrderItem`.
2. The client opens `/platforma/dokumenty/[orderItemId]/formularz`.
3. Draft save updates `DocumentInput` only.
4. Submit validates the full privacy-policy schema.
5. The server derives `createdById`, `organizationId`, `templateId`, and `OrderItem` ownership from the authenticated session and database.
6. Submit creates `DocumentGenerationJob` and sends Inngest event `document/generate.requested`.
7. The worker loads the job, `DocumentInput`, `OrderItem`, and active template.
8. The worker maps input to explicit template variables.
9. `DocxRenderer` renders DOCX.
10. The worker uploads the file to private R2, creates `GeneratedDocumentFile`, updates statuses, and writes audit logs.

## Renderers

`src/server/documents/renderers.ts` defines:

- `DocumentRenderer`
- `DocxRenderer`
- `HtmlRenderer`
- `NotConfiguredPdfRenderer`
- `ZipRenderer`

DOCX is real in this phase. HTML is a preview/foundation renderer. PDF and ZIP are intentionally not enabled until a reviewed rendering worker or conversion service is selected.

## Retry

`POST /api/documents/jobs/[jobId]/retry` is restricted to `ADMIN`, `LAWYER`, and `OPERATOR`. It only retries `FAILED` jobs and increments `attempt`.

## Review

Products and templates can require review. Review-required documents move to `REVIEW_REQUIRED` and get a `DocumentReview` row. The full lawyer workflow remains Phase 7R scope.

## Notifications

`logDocumentNotification` creates a development mail log when Resend env is missing. This phase does not send attachments by email.
