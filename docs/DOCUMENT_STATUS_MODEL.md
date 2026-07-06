# Document status model

Phase 6R uses one status chain for the post-purchase document flow:

1. `Order.status` must be `PAID` or `MANUALLY_APPROVED` before a client can submit document data.
2. `OrderItem.status` moves through `INPUT_REQUIRED`, `DRAFT`, `GENERATING`, `READY`, `FAILED`, or `REVIEW_REQUIRED`.
3. `DocumentInput.status` moves through `DRAFT`, `GENERATING`, `READY`, `FAILED`, `REVIEW_REQUIRED`, `REVIEWED`, or `ARCHIVED`.
4. `DocumentGenerationJob.status` uses the existing job enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
5. `GeneratedDocument.status` uses `PROCESSING`, `READY`, `FAILED`, `REVIEW_REQUIRED`, `ARCHIVED`.
6. `DocumentReview.status` uses `NOT_REQUIRED`, `REQUIRED`, `IN_REVIEW`, `APPROVED`, `REJECTED`.

`DocumentGenerationStatus` is intentionally kept as the existing Prisma enum name to avoid duplicating job-status concepts.

Failed generation stores a safe client message in `safeErrorMessage`. Full technical errors are not shown in client UI.
