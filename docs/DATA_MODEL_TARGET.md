# PRIVAZY target data model

Status: Phase 2 target schema.

This document describes the target Prisma data model added for the full PRIVAZY platform. It is intentionally data-first: it prepares tables, enums, relations, indexes and seed surfaces without building the full shop UI, checkout, client platform or CRM CRUD.

## Scope decisions

- Existing models remain in place: `User`, `Organization`, `ClientProfile`, `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, `AuditLog` and `FormSubmission`.
- `ClientProfile` is extended as the organization membership layer. Global `UserRole` stays separate from per-organization `OrganizationMemberRole`.
- Money is stored as integer cents, for example `netAmountCents`, `vatAmountCents` and `grossAmountCents`. This avoids floating point errors and is sufficient for PLN/EUR checkout, payments and invoices. VAT rate is stored as basis points in `vatRateBps`, so 23% is `2300`.
- Currency is stored per commercial record as an ISO-like string, defaulting to `PLN`.
- Workflow fields use enums where they drive product logic: order, payment, invoice, document, CRM, breach, DSAR, CMS, newsletter, automation and notification statuses.
- Core foreign keys and status/date query paths have indexes. Prisma cannot express every future partial index, so high-volume filtered indexes should be added in later SQL migrations after real query patterns are known.
- This phase does not expose new Supabase Data API grants or RLS policies. Supabase's 2026 default-grant change means future public/API-facing tables need explicit grants and RLS policies in reviewed SQL migrations.

## Identity and auth

Core models:

- `User`
- `ClientProfile`
- `OrganizationInvite`

`UserRole` remains a global system role. Organization access is represented by `ClientProfile.organizationRole` and `ClientProfile.status`, so one user can belong to many organizations with different client-side permissions.

## Organizations

Core models:

- `Organization`
- `BillingProfile`
- `OrganizationSettings`
- `ClientProfile`
- `OrganizationInvite`

The model supports multiple users per organization, multiple organizations per user, billing data, notification settings and invite lifecycle. Billing is separated from operational organization data so invoice data can stay stable even when organization profile data changes.

## CRM and leads

Core models:

- `Lead`
- `LeadActivity`
- `LeadNote`
- `Deal`
- `CrmTask`
- `PipelineStage`
- `ContactPerson`

Leads can originate from the IOD checker through `Lead.source = IOD_CHECKER` and the optional `formSubmissionId` relation. A lead can be converted to an `Organization` and/or `Order`. Ownership is represented by `ownerId` to `User`; auditability is supported by activities, notes, tasks and `AuditLog`.

## Shop and catalog

Core models:

- `ProductCategory`
- `Product`
- `ProductVariant`
- `ProductPackage`
- `ProductPackageItem`
- `Coupon`

Products represent public catalog items. Variants carry prices, VAT and optional relation to a `DocumentTemplate`. Packages bundle variants/products for later checkout and fulfillment.

## Orders, payments and invoices

Core models:

- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`
- `Refund`
- `Invoice`
- `InvoiceLine`

Orders have separate business status, payment status and fulfillment status. The schema supports coupon attribution, order numbers, payment provider IDs, refunds, one invoice per order by default and invoice lines tied back to order items.

## Document templates, inputs and generated documents

Core models:

- `DocumentTemplate`
- `DocumentTemplateVersion`
- `DocumentInput`
- `DocumentGenerationJob`
- `GeneratedDocument`
- `GeneratedDocumentFile`
- `DocumentDownload`
- `DocumentReview`
- `DocumentUpdate`

The existing document tables stay compatible. New tables add version history, structured input records, many files per generated document, download history, review status and update history. `GeneratedDocument` and `DocumentInput` can link to `OrderItem` for paid fulfillment.

## Client platform

Core models:

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

The portal data model covers breach case management, DSAR case management, messages, tasks and recurring compliance reviews. Breach incidents include case numbers, risk, status, the 72 hour deadline, UODO and data-subject notification flags and assignment. DSAR records include request type, requester, intake channel, received date, due date, identity verification, response fields and assignment.

## Blog and CMS

Core models:

- `BlogPost`
- `BlogCategory`
- `BlogTag`
- `BlogPostCategory`
- `BlogPostTag`
- `BlogRevision`
- `SeoMetadata`

Blog content moves from code data toward database-managed content with draft, review, published and scheduled states. SEO metadata supports title, description, canonical URL, FAQ/schema JSON and noindex flags.

## Newsletter and marketing

Core models:

- `NewsletterSubscriber`
- `NewsletterCampaign`
- `NewsletterEvent`
- `MarketingEvent`
- `ConsentRecord`

Subscribers store status, source, UTM fields, consent evidence and unsubscribe tokens. Events capture subscription and email lifecycle events. `ConsentRecord` gives a shared consent audit surface for marketing, contact and legal acceptance.

## Automations and notifications

Core models:

- `AutomationRule`
- `AutomationRun`
- `Notification`

Automation rules store trigger, target, conditions, actions, status, last run and errors. Runs store execution state and payload snapshots. Notifications can be tied to users, organizations, automation rules and runs.

## Audit logs and files/storage

Core models:

- `AuditLog`
- `FileObject`

`AuditLog` remains the shared audit trail. `FileObject` is the storage registry for R2/S3-like objects and can be linked by generated document files and breach attachments. Future modules should attach file records instead of relying only on raw storage keys.

## Seed data

`prisma/seed.mjs` seeds only non-sensitive starter configuration:

- product categories,
- starter product and product package,
- blog categories,
- default CRM pipeline stages.

It does not seed real clients, real users, lead data, payments, invoices or confidential documents.

## Migration notes

- Target migration name: `phase_2_data_model`.
- Preferred command: `npx prisma migrate dev --name phase_2_data_model`.
- If the developer environment cannot connect to the database, do not hand-write a fake migration. Generate it in local/staging once `DATABASE_URL` and `DIRECT_URL` are available.
- After migration, run `npm run prisma:generate`, `npm run prisma:seed`, `npm run lint`, `npm run typecheck` and `npm run build`.

## Known follow-ups

- Add reviewed RLS policies and explicit Supabase Data API grants for any table that will be accessed through Supabase client APIs.
- Add payment-provider webhook event tables if checkout implementation chooses a provider requiring event idempotency storage.
- Add SQL-level partial indexes after real CRM, shop and platform list queries are implemented and measurable.
- Decide whether file size should move from `Int` to `BigInt` before storing very large archives.
