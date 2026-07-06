# PRIVAZY Phase 2R target data model

Status: target schema after current-state audit and security reconcile context.
Branch scope: schema, seed, and documentation only. No shop UI, checkout logic, CMS UI, client portal, CRM rebuild, payment integration, or deployment.

## Scope decisions

- Existing `main` models are preserved: `User`, `Organization`, `ClientProfile`, `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, `FormSubmission`, and `AuditLog`.
- `OrganizationMember` is the target many-to-many membership model. `ClientProfile` remains for compatibility with current auth/client-access code and should be migrated or adapted later.
- Global system access remains on `User.role` / `UserRole`. Per-organization access lives in `OrganizationMember.role` / `OrganizationMemberRole`.
- Money is stored as integer cents (`netAmountCents`, `vatAmountCents`, `grossAmountCents`, `totalCents`). VAT rates use basis points (`vatRateBps`), so 23% is `2300`. This avoids floating point drift and keeps PLN/EUR checkout, payment, invoice, and refund totals consistent.
- Currency is stored on commercial records, defaulting to `PLN`.
- Statuses that drive workflows are enum-backed. Free-text event types remain strings where the taxonomy is intentionally open, for example timeline and marketing event names.
- File records store private object keys only. Signed URLs are not stored durably.
- Supabase RLS, grants, and Data API exposure are not implied by Prisma. New public-schema tables need a reviewed SQL follow-up before any direct Supabase client access.

## Existing foundation

| Area | Models | Phase use | Notes |
| --- | --- | --- | --- |
| Users and system roles | `User`, `UserRole` | Phase 1+ | Global role remains separate from organization role. Existing auth imports continue to compile. |
| Organizations | `Organization`, `ClientProfile` | Phase 1, 7, 8 | Existing organization relations are retained. `ClientProfile` is compatibility-only after 2R. |
| Documents | `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument` | Phase 6 | Existing generation services still write baseline fields such as `inputSnapshot`, `docxFileKey`, and `generationJobId`. |
| Forms and audit | `FormSubmission`, `AuditLog` | Phase 1, 4, 6, 7 | Current IOD checker lead capture can continue to store form JSON while normalized lead tables are introduced. |

## Organization and billing

Models:

- `OrganizationMember`
- `OrganizationInvite`
- `OrganizationSettings`
- `BillingProfile`

Main relations:

- `OrganizationMember.organizationId` + `userId` is unique, enabling many users per organization and many organizations per user.
- `OrganizationMember.role` is independent from `User.role`.
- `OrganizationInvite` stores a hashed token, invite role, lifecycle status, expiration, and inviter.
- `BillingProfile` is one-to-one with `Organization` and can be referenced by invoices.
- `OrganizationSettings` is one-to-one with `Organization` for locale, currency, notification emails, and operational settings.

Why it exists:

- Phase 1 and Phase 8 need organization-scoped access without relying on global user role.
- Phase 5 and Phase 6 need stable billing and operational metadata.
- Future invoices should snapshot buyer data from billing fields rather than trust mutable frontend data.

## CRM leads

Models:

- `Lead`
- `LeadActivity`
- `LeadNote`
- `ContactPerson`
- `CrmTask`
- `PipelineStage`

Main relations:

- `Lead.ownerId` points to `User`.
- `Lead.formSubmissionId` is optional and unique so IOD checker submissions can map to normalized CRM records.
- `Lead.convertedOrganizationId` points to `Organization` after conversion.
- `Lead` stores source, status, UTM fields, estimated value in cents, and hot-lead flag.
- Notes and activities are relational, not only JSON.
- `CrmTask` can attach to lead, order, document, breach, data-subject request, organization, and owner.

Why it exists:

- Phase 4 can capture IOD checker leads cleanly.
- Phase 7 gets a real CRM data backbone without parsing `FormSubmission.data` for every workflow.
- Activities, notes, and tasks make auditability and handoff possible.

## Shop and catalog

Models:

- `ProductCategory`
- `Product`
- `ProductVariant`
- `ProductPackage`
- `ProductPackageItem`
- `Cart`
- `CartItem`
- `Coupon`

Main relations:

- `Product.slug` is unique.
- `Product.status` and `Product.type` distinguish draft/active/hidden/archived and document/package/service/subscription use cases.
- `Product.documentTemplateId` and `Product.documentType` can point catalog items to document generation.
- `ProductVariant` stores prices in cents, VAT in basis points, SKU, currency, and fulfillment metadata.
- `ProductPackageItem` bundles product variants under `ProductPackage`.
- `Cart` and `CartItem` snapshot server-calculated amounts and can connect to coupon, user, and organization.

Why it exists:

- Phase 5 needs a catalog and cart model before checkout.
- Prices must be loaded and calculated server-side, not trusted from the frontend.
- Phase 6 can later fulfill order items into generated documents.

## Orders, payments, refunds, and invoices

Models:

- `Order`
- `OrderItem`
- `Payment`
- `PaymentEvent`
- `Refund`
- `Invoice`
- `InvoiceLine`

Main relations:

- `Order.orderNumber` is unique.
- `Order` can belong to `Organization` and/or `User`.
- `OrderItem` can point to `Product`, `ProductVariant`, and `ProductPackage`.
- `Payment` stores provider, external id, idempotency key, status, amount, and currency.
- `PaymentEvent` stores provider event ids for webhook idempotency.
- `Invoice` stores buyer data snapshot, status, external provider id, and provider link.
- `Refund` links to order and optionally payment.

Why it exists:

- Phase 5 needs safe checkout state, webhook reconciliation, and invoice handoff.
- Phase 7 needs CRM visibility into commercial status.
- Phase 12 needs rollback/reconciliation records for operational support.

## Document generation and files

Models:

- `DocumentTemplateVersion`
- `DocumentInput`
- `GeneratedDocumentFile`
- `DocumentDownload`
- `DocumentReview`
- `DocumentUpdate`
- `FileObject`

Main relations:

- `DocumentTemplateVersion` gives immutable template version records beyond the current `DocumentTemplate.version` field.
- `DocumentInput` connects organization, user, form submission, order item, template, template version, input version, and normalized input payload.
- `DocumentGenerationJob` can now point to `DocumentInput` and `DocumentTemplateVersion`, and it keeps retry/debug fields.
- `GeneratedDocument` can point to `OrderItem`, `DocumentInput`, and template version record while preserving existing generated-file keys.
- `GeneratedDocumentFile` supports many file formats per document: DOCX, PDF, HTML, ZIP, or OTHER.
- `DocumentDownload` records download history by organization, document, file, user, IP, and user agent.
- `DocumentReview` and `DocumentUpdate` support legal review, retry, and change history.
- `FileObject` is the shared storage registry. Storage keys must not include personal data.

Why it exists:

- Phase 6 needs versioned inputs/templates, review, retry, and multi-format output.
- Phase 8 needs protected document downloads with audit history.
- Phase 7 needs document workflow visibility in CRM.

## Breach incidents

Models:

- `BreachIncident`
- `BreachAttachment`
- `BreachComment`
- `BreachTimelineEvent`

Main relations:

- `BreachIncident.organizationId` is required.
- `reporterId` and `assignedToId` point to `User`.
- The incident stores status, risk level, detected date, 72 hour deadline, authority notification time, data-subject notification time, and close time.
- Attachments use `FileObject`; comments and timeline events are relational.

Why it exists:

- Phase 7 and Phase 8 need one incident model for CRM and client portal workflows.
- Legal deadlines and notifications need explicit fields, not only notes.

## Data subject requests

Models:

- `DataSubjectRequest`
- `DataSubjectRequestEvent`
- `DataSubjectRequestAttachment`
- `DataSubjectRequestComment`

Main relations:

- `organizationId` is required.
- Requester data is stored on the request record.
- Request type, received date, deadline, status, identity verification, response summary, and assigned user are explicit fields.
- Events, comments, and attachments provide history.

Why it exists:

- Phase 7 and Phase 8 need DSAR workflow state, deadlines, attachments, and response tracking.
- Identity verification must be stateful and auditable.

## Communication and tasks

Models:

- `MessageThread`
- `Message`
- `Notification`
- `CrmTask`

Main relations:

- `MessageThread` can link to organization, generated document, breach incident, or data-subject request.
- `Message.authorId` points to `User`.
- `CrmTask` has owner, due date, status, priority, and optional domain links.
- `Notification` can target organization and/or user.

Why it exists:

- Phase 7 needs internal tasking and operational messages.
- Phase 8 needs client-visible conversations tied to documents, incidents, and requests.

## CMS and blog

Models:

- `BlogPost`
- `BlogCategory`
- `BlogTag`
- `BlogPostCategory`
- `BlogPostTag`
- `BlogPostProduct`
- `BlogRevision`
- `SeoMetadata`
- `FaqItem`

Main relations:

- `BlogPost.slug` is unique.
- `BlogPost.status` supports draft, review, scheduled, published, and archived states.
- `authorId` and `reviewerId` point to `User`.
- `publishedAt`, `scheduledAt`, SEO title/meta/canonical/schema fields, FAQ fields, CTA type, and related products are modeled.

Why it exists:

- Phase 9 needs a database-backed CMS rather than static code-only content.
- Legal content review needs reviewer and revision history.
- Marketing needs product/content relationships.

## Newsletter and marketing

Models:

- `NewsletterSubscriber`
- `NewsletterCampaign`
- `NewsletterEvent`
- `MarketingEvent`
- `ConsentRecord`

Main relations:

- Subscriber records store consent evidence, source, UTM fields, status, unsubscribe token, and organization link when known.
- Campaign and event models track outbound lifecycle events.
- `MarketingEvent` can relate to lead, order, blog post, subscriber, user, and organization.
- `ConsentRecord` provides reusable consent history for marketing, terms, privacy, profiling, and contact.

Why it exists:

- Phase 4 and Phase 9 need compliant newsletter and lead source tracking.
- Consent and unsubscribe data must not live only in analytics tools.

## Automation and events

Models:

- `AutomationRule`
- `AutomationRun`
- `WorkflowEvent`

Main relations:

- Rules store trigger, target, conditions, actions, status, idempotency key, last run, and error.
- Runs store execution state, input, output, idempotency key, and errors.
- Workflow events provide a generic idempotent event log for future Inngest/payment/CRM automation coordination.

Why it exists:

- Phase 10 needs retryable and auditable automation state.
- Webhook and workflow idempotency should be data-backed before production automation.

## Seed data

`prisma/seed.mjs` seeds only safe starter configuration:

- product categories,
- starter product and variant,
- starter product package,
- blog categories,
- global pipeline stages.

It does not seed real users, clients, leads, orders, payments, invoices, documents, breach cases, data-subject requests, or personal data.

## Known follow-ups

- Generate the Prisma migration only against a real local/staging database.
- Add reviewed RLS policies and explicit grants for Supabase Data API exposure.
- Reconcile or close draft migration PRs before merging Phase 2R.
- Add SQL-only partial indexes after real CRM/shop/platform query patterns are measured.
- Decide in a later PR whether `ClientProfile` should be migrated into `OrganizationMember` or retained as a client-specific profile extension.
