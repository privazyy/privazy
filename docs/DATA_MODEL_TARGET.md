# PRIVAZY Target Data Model

This document describes the Phase 2 target data model for the full PRIVAZY platform. The Prisma schema keeps the original MVP models and adds the tables needed for shop, CRM, client platform, documents, marketing and automation.

## Design Principles

- Existing models stay compatible: `User`, `Organization`, `ClientProfile`, `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, `AuditLog` and `FormSubmission` remain in place.
- IDs continue to use `String @default(cuid())` for compatibility with the existing schema and code. A future major migration may evaluate UUIDv7 or identity columns, but Phase 2 avoids changing primary-key strategy.
- Money is stored as integer minor units, for example `priceCents`, `totalCents`, `vatCents`. Currency is stored separately, defaulting to `PLN`.
- VAT is stored as basis points in `vatRateBps`, for example `2300` means 23%.
- Status fields are Prisma enums, not free-form strings.
- Foreign keys used in common joins are indexed.
- Operational list views use composite indexes such as `[status, createdAt]`, `[organizationId, status]`, `[ownerId, status]`.
- JSON is used only for flexible payloads that are product-specific, content-specific or integration-specific.

## Identity And Auth

Existing:

- `User`
- `UserRole`

Added relationships from `User` to operational ownership and audit domains:

- organization memberships and invites
- CRM ownership
- order/customer attribution
- document generation, review and download events
- blog authoring and revisions
- newsletter campaigns
- automation rules
- notifications

Global system role remains separate from organization role.

## Organizations

Existing:

- `Organization`
- `ClientProfile`

Added:

- `OrganizationUser`
- `OrganizationInvite`
- `BillingProfile`
- `OrganizationSettings`
- `ContactPerson`
- `OrganizationMemberRole`
- `OrganizationMemberStatus`
- `OrganizationInviteStatus`

`OrganizationUser` models many-to-many membership between users and organizations. `ClientProfile` remains for compatibility and receives `organizationRole` so client organization roles do not have to reuse global `UserRole`.

## CRM, Leads And Sales

Added:

- `Lead`
- `LeadActivity`
- `LeadNote`
- `Deal`
- `CrmTask`
- `PipelineStage`
- `LeadStatus`
- `LeadSource`
- `LeadActivityType`
- `DealStatus`
- `CrmTaskStatus`
- `CrmTaskPriority`
- `PipelineStageKind`

Key relationships:

- Lead can be linked to `FormSubmission`.
- Lead can be owned by `User`.
- Lead can be linked to `Organization` and converted to `Order`.
- Deal can be linked to lead, organization, owner, stage and order.
- CRM tasks can be linked to lead, deal, organization and stage.

The IOD checker can continue writing `FormSubmission`, while later phases can create a normalized `Lead` that points back to that submission.

## Shop And Catalog

Added:

- `ProductCategory`
- `Product`
- `ProductVariant`
- `ProductPackage`
- `ProductPackageItem`
- `ProductStatus`
- `ProductKind`
- `ProductVariantStatus`

Products are catalog records. Variants hold price, currency and VAT. Packages are represented by a package product plus `ProductPackageItem` rows pointing to included variants.

## Cart, Orders, Payments And Invoices

Added:

- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`
- `Invoice`
- `Coupon`
- `Refund`
- `CartStatus`
- `OrderStatus`
- `OrderItemStatus`
- `PaymentProvider`
- `PaymentStatus`
- `InvoiceStatus`
- `CouponStatus`
- `RefundStatus`

Important fields:

- `orderNumber` is unique.
- `invoiceNumber` is unique.
- `providerPaymentId` and `providerRefundId` are unique when present.
- order totals are stored in cents.
- each order/payment/invoice can link to an organization.
- `OrderItem` can link to document generation inputs and generated documents.

## Document Templates, Inputs And Generated Documents

Existing:

- `DocumentTemplate`
- `DocumentGenerationJob`
- `GeneratedDocument`

Added:

- `DocumentInput`
- `DocumentTemplateVersion`
- `GeneratedDocumentFile`
- `DocumentDownload`
- `DocumentReview`
- `DocumentUpdate`
- `DocumentInputStatus`
- `DocumentFileType`
- `DocumentReviewStatus`
- `DocumentUpdateType`

The current `DocumentTemplate.version` and file fields remain. `DocumentTemplateVersion` enables a fuller version history without breaking the existing contract.

`GeneratedDocument` keeps `docxFileKey`, `pdfFileKey` and `zipFileKey` for compatibility, while `GeneratedDocumentFile` supports multiple files per document: DOCX, PDF, HTML, ZIP and other future formats.

`DocumentDownload` provides download history and is the target place to audit signed URL access.

## Client Platform

Added:

- `BreachIncident`
- `BreachAttachment`
- `BreachComment`
- `BreachTimelineEvent`
- `DataSubjectRequest`
- `DataSubjectRequestEvent`
- `ClientMessageThread`
- `ClientMessage`
- `ClientTask`
- `ComplianceReview`
- `ComplianceScore`

Incident model supports:

- case number
- organization
- reporter and assigned person
- type
- description
- risk
- status
- 72-hour deadline
- UODO notification flags
- data subject notification flags
- comments, timeline and attachments

Data subject request model supports:

- request type
- requester identity/contact fields
- intake channel
- received date
- deadline
- status
- identity verification status
- response summary
- timeline events
- assignee

## Blog And CMS

Added:

- `BlogPost`
- `BlogCategory`
- `BlogTag`
- `BlogPostTag`
- `BlogRevision`
- `BlogPostStatus`

SEO fields are stored directly on `BlogPost`:

- `seoTitle`
- `metaDescription`
- `canonicalUrl`
- `faqSchema`

The model supports draft, review, scheduled and published content with unique slugs and revision history.

## Newsletter And Marketing

Added:

- `NewsletterSubscriber`
- `NewsletterCampaign`
- `NewsletterEvent`
- `MarketingEvent`
- `NewsletterSubscriberStatus`
- `NewsletterCampaignStatus`
- `NewsletterEventType`
- `MarketingEventType`

Subscribers store consent text, consent timestamp, source, UTM values and an unsubscribe token. Events track sent/opened/clicked/bounced/complained and subscription lifecycle events.

`MarketingEvent` is a generic tracking table for page views, product views, checker completions and checkout events.

## Automations And Notifications

Added:

- `AutomationRule`
- `AutomationRun`
- `Notification`
- `AutomationTriggerType`
- `AutomationTargetType`
- `AutomationStatus`
- `AutomationRunStatus`
- `NotificationStatus`
- `NotificationType`

Automation rules define trigger, target and JSON config. Runs store inputs, outputs, status and error message. Notifications target user and/or organization.

## Audit Logs

Existing `AuditLog` remains the primary event ledger. New models are designed so future service code can write audit entries for:

- lead lifecycle
- order/payment lifecycle
- document downloads and reviews
- breach incidents
- data subject requests
- automation runs

`AuditLog` still stores `metadata` as JSON for event-specific details.

## Files And Storage

Added:

- `FileAsset`
- `FileAssetPurpose`

`FileAsset` stores shared metadata for private storage objects: object key, file name, MIME type, size, checksum, purpose, uploader and organization. Domain-specific tables such as `GeneratedDocumentFile` and `BreachAttachment` can link to it while preserving their own domain fields.

R2/S3 objects should remain private. Future download endpoints should create short-lived signed URLs only after checking role and organization access.

## Supabase Notes

The Phase 2 schema assumes PostgreSQL through Prisma. For Supabase projects:

- newly created public-schema tables may not be exposed automatically to the Data API, based on the 2026 Supabase changelog;
- exposing tables through Data API should be an explicit decision;
- RLS policies or equivalent database-level access controls should be added before exposing tables to client-side Supabase access;
- service-role keys must stay server-only and out of `NEXT_PUBLIC_*`.

## Migration Notes

The migration is additive: it adds tables, enum values and optional relation fields. Existing required fields are not removed.

Main migration risks:

- large number of enum and table creations in one migration;
- future RLS and grants must be planned before exposing tables through Supabase Data API;
- some indexes are broad Phase 2 defaults and should be revisited after real query plans exist;
- `DocumentTemplateVersion` duplicates version data that currently lives on `DocumentTemplate`, so service code should choose one write path in later phases.
