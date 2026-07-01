# PRIVAZY module audit

## Phase 2 Data Model Result

Status: target schema prepared, UI/CRUD not implemented in this phase.

Added model areas:

- Shop/catalog: `ProductCategory`, `Product`, `ProductVariant`, `ProductPackage`, `ProductPackageItem`, `Cart`, `CartItem`, `Coupon`.
- Orders/payments/invoices: `Order`, `OrderItem`, `Payment`, `Refund`, `Invoice`, `InvoiceLine`.
- CRM/leads: `Lead`, `LeadActivity`, `LeadNote`, `Deal`, `CrmTask`, `PipelineStage`, `ContactPerson`.
- Organizations: `ClientProfile` extended with membership role/status, `OrganizationInvite`, `BillingProfile`, `OrganizationSettings`.
- Client platform: `BreachIncident`, `BreachAttachment`, `BreachComment`, `BreachTimelineEvent`, `DataSubjectRequest`, `DataSubjectRequestEvent`, `ClientMessageThread`, `ClientMessage`, `ClientTask`, `ComplianceReview`, `ComplianceScore`.
- Documents: `DocumentTemplateVersion`, `DocumentInput`, `GeneratedDocumentFile`, `DocumentDownload`, `DocumentReview`, `DocumentUpdate`.
- CMS/marketing/automation/storage: `BlogPost`, `BlogCategory`, `BlogTag`, `BlogRevision`, `SeoMetadata`, `NewsletterSubscriber`, `NewsletterCampaign`, `NewsletterEvent`, `MarketingEvent`, `ConsentRecord`, `AutomationRule`, `AutomationRun`, `Notification`, `FileObject`.

Key decisions:

- Monetary values are stored as `Int` cents and VAT rates as `vatRateBps`.
- Operational statuses are Prisma enums.
- Existing models remain compatible; new relations to existing records are nullable where required for migration safety.
- Seed covers only starter configuration: products, product categories, blog categories and CRM pipeline stages.
- RLS, explicit Supabase Data API grants and provider-specific webhook tables are left for later implementation phases.
