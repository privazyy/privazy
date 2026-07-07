# PRIVAZY - Audit Data Model Matrix

| Model | Exists | Used by code | Has relations | Has indexes | Has status | Risks | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| User | YES | YES | YES | Email unique | Role enum | No org membership/role model | NextAuth credentials reads users. |
| Organization | YES | YES | YES | Limited | NO | Duplicate orgs from public leads | Broad tenant foundation only. |
| ClientProfile | YES | YES | YES | YES | NO | Not enough for staff/client permissions | Links users to organizations. |
| DocumentTemplate | YES | YES | YES | YES | YES | Raw `fileKey` appears in CRM | Needs secure version/download model. |
| DocumentGenerationJob | YES | YES | YES | YES | YES | Publicly creatable with arbitrary IDs | P0. |
| GeneratedDocument | YES | YES | YES | YES | YES | No download ACL/audit | Stores raw storage keys. |
| AuditLog | YES | YES | YES | YES | NO | Limited coverage; can store file/error details | Only generation success/failure observed. |
| FormSubmission | YES | YES | YES | YES | YES | Catch-all JSON for leads/requests | Useful but not typed business model. |
| OrganizationMember / OrganizationUser | NO | NO | NO | NO | NO | No robust tenant isolation | Missing. |
| OrganizationInvite | NO | NO | NO | NO | NO | No invite flow | Missing. |
| OrganizationSettings | NO | NO | NO | NO | NO | No org policy/config | Missing. |
| BillingProfile | NO | NO | NO | NO | NO | Checkout/invoice impossible | Missing. |
| Lead / LeadActivity / LeadNote | NO | PARTIAL | NO | NO | NO | Leads live in `FormSubmission` JSON | Dedicated CRM lifecycle missing. |
| ContactPerson | NO | NO | NO | NO | NO | Contact data in JSON only | Missing. |
| CrmTask | NO | NO | NO | NO | NO | No task/SLA model | Missing. |
| Product / ProductVariant | NO | PARTIAL | NO | NO | NO | Static product claims | Missing DB catalog. |
| Cart / CartItem | NO | PARTIAL | NO | NO | NO | Client-only cart counter | Missing. |
| Coupon | NO | NO | NO | NO | NO | No discount validation | Missing. |
| Order / OrderItem | NO | PARTIAL | NO | NO | NO | CRM maps document jobs as orders | Real order lifecycle missing. |
| Payment / Refund | NO | NO | NO | NO | NO | No payment ledger/idempotency | Missing. |
| Invoice | NO | NO | NO | NO | NO | No invoice workflow | Missing. |
| DocumentTemplateVersion | NO | NO | NO | NO | NO | Version is integer only | Missing immutable versions. |
| DocumentInput | NO | PARTIAL | NO | NO | NO | Input stored as job JSON | No draft/submit workflow. |
| GeneratedDocumentFile | NO | NO | NO | NO | NO | Multiple files not modeled | Missing. |
| DocumentDownload | NO | NO | NO | NO | NO | No download audit | Missing. |
| DocumentReview | NO | NO | NO | NO | NO | No legal review gate | Missing. |
| BreachIncident and related timeline/comment/attachment models | NO | NO | NO | NO | NO | No breach flow | Missing. |
| DataSubjectRequest and related event/comment/attachment models | NO | PARTIAL | NO | NO | NO | No DSR lifecycle | Missing. |
| MessageThread / Message | NO | NO | NO | NO | NO | No portal messaging | Missing. |
| Notification | NO | NO | NO | NO | NO | No notification ledger | Missing. |
| BlogPost / BlogCategory / BlogTag / BlogRevision | NO | PARTIAL | NO | NO | NO | Static blog only | CMS missing. |
| NewsletterSubscriber / NewsletterEvent | NO | PARTIAL | NO | NO | NO | Client-only signup state | Consent/unsubscribe missing. |
| MarketingEvent | NO | NO | NO | NO | NO | No marketing event audit | Missing. |
| AutomationRule / AutomationRun / EventLog / WorkflowEvent | NO | PARTIAL | NO | NO | NO | One Inngest event only | Durable workflow state missing. |
| EmailLog | NO | NO | NO | NO | NO | No email audit | Missing. |

Conclusion: current schema is a small foundation, not the full legaltech platform model.
