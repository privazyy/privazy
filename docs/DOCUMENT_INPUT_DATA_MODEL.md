# Document Input Data Model

Added models:
- `Product`: minimal document/service/package catalog anchor.
- `Order`: minimal paid-order anchor.
- `OrderItem`: one document purchase line.
- `DocumentInput`: one active input per `OrderItem`.

Important server-side invariants:
- `DocumentInput.organizationId` comes from `OrderItem.organizationId`.
- `DocumentInput.templateId` comes from `OrderItem.templateId` or product/template context.
- `DocumentInput.createdById`, `updatedById`, `submittedById` come from session actor.
- `DocumentInput.dataJson` is draft-bounded and submit-validated.
- `DocumentGenerationJob.documentInputId` links submit to downstream generation.

Migration notes:
- New public tables enable RLS and revoke access from `anon` and `authenticated`.
- No production migration was run.
- Staging/disposable migration rehearsal is required before merging toward release.
