# PRIVAZY status model

This document defines enum meaning, allowed transitions, final states, and audit expectations for the Phase 2R schema.

## Audit rules

Write `AuditLog` for:

- any status change that affects customer access, legal deadlines, payment/invoice state, generated files, breach/DSAR handling, or permissions;
- every manual override from a final state;
- failed payment, webhook, document generation, automation, and access-control events;
- document download and review decisions.

Low-risk draft edits do not always need `AuditLog`, but they should be covered by `updatedAt` and application-level activity records where available.

## Core statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `UserRole` | Global system role. | Admin-controlled changes only. | None. | Yes. |
| `OrganizationMemberStatus` | Membership lifecycle. | `INVITED -> ACTIVE`; `ACTIVE -> SUSPENDED`; `SUSPENDED -> ACTIVE`; any non-final -> `REMOVED`. | `REMOVED`. | Yes. |
| `OrganizationInviteStatus` | Invite lifecycle. | `PENDING -> ACCEPTED`; `PENDING -> EXPIRED`; `PENDING -> REVOKED`. | `ACCEPTED`, `EXPIRED`, `REVOKED`. | Yes. |
| `FormSubmissionStatus` | Generic form processing state. | `DRAFT -> SUBMITTED -> PROCESSING -> COMPLETED`; any active state -> `FAILED`. | `COMPLETED`, `FAILED`. | For public lead and legal forms, yes. |

## CRM statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `LeadStatus` | Sales/CRM lead lifecycle. | `NEW -> CONTACTED -> QUALIFIED -> PROPOSAL -> WON`; any non-final -> `LOST` or `ARCHIVED`. | `WON`, `LOST`, `ARCHIVED`. | Yes for conversion, loss, archive, owner change. |
| `LeadSource` | Lead origin. | Usually immutable after creation; corrections allowed by admin/operator. | None. | Yes when corrected. |
| `LeadActivityType` | Activity event taxonomy. | Append-only events. | Event record itself is final. | Usually no, unless it changes legal/commercial state. |
| `TaskStatus` | Work item lifecycle. | `OPEN -> IN_PROGRESS -> BLOCKED -> IN_PROGRESS -> DONE`; any active state -> `CANCELLED`. | `DONE`, `CANCELLED`. | Yes for legal/payment/document tasks; optional for routine CRM tasks. |
| `TaskPriority` | Work urgency. | Any priority can change before final task state. | None. | Yes for breach/DSAR/document review tasks. |

## Shop and payment statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `ProductStatus` | Catalog visibility/lifecycle. | `DRAFT -> ACTIVE`; `ACTIVE -> HIDDEN`; any non-final -> `ARCHIVED`; `HIDDEN -> ACTIVE`. | `ARCHIVED`. | Yes when active/hidden/archived. |
| `ProductType` | Product fulfillment kind. | Usually immutable after first sale. | None. | Yes if changed after order exists. |
| `CartStatus` | Cart lifecycle. | `OPEN -> CONVERTED`; `OPEN -> ABANDONED`; `OPEN -> EXPIRED`. | `CONVERTED`, `ABANDONED`, `EXPIRED`. | No unless fraud/manual recovery. |
| `CouponStatus` | Coupon lifecycle. | `ACTIVE -> PAUSED -> ACTIVE`; any non-final -> `EXPIRED` or `ARCHIVED`. | `EXPIRED`, `ARCHIVED`. | Yes. |
| `OrderStatus` | Commercial order lifecycle. | `DRAFT -> PENDING_PAYMENT -> PAID -> IN_FULFILLMENT -> COMPLETED`; active states -> `CANCELLED`; paid/completed states -> `REFUNDED`. | `COMPLETED`, `CANCELLED`, `REFUNDED`. | Yes. |
| `PaymentStatus` | Payment provider state. | `PENDING -> AUTHORIZED -> CAPTURED`; active states -> `FAILED` or `CANCELLED`; captured states -> `REFUNDED` or `PARTIALLY_REFUNDED`. | `FAILED`, `CANCELLED`, `REFUNDED`. | Yes. |
| `PaymentEventStatus` | Webhook/event processing state. | `RECEIVED -> PROCESSED`; `RECEIVED -> FAILED`; duplicate/non-actionable -> `IGNORED`. | `PROCESSED`, `FAILED`, `IGNORED`. | Yes for failed/ignored duplicates in payment context. |
| `InvoiceStatus` | Invoice lifecycle. | `DRAFT -> ISSUED -> SENT -> PAID`; issued/sent -> `CANCELLED` or `CORRECTED`. | `PAID`, `CANCELLED`, `CORRECTED`. | Yes. |
| `RefundStatus` | Refund lifecycle. | `REQUESTED -> PROCESSING -> SUCCEEDED`; active states -> `FAILED` or `CANCELLED`. | `SUCCEEDED`, `FAILED`, `CANCELLED`. | Yes. |

## Document statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `DocumentTemplateStatus` | Template availability. | `DRAFT -> ACTIVE -> ARCHIVED`; `ACTIVE -> DRAFT` only by admin rollback before use. | `ARCHIVED`. | Yes. |
| `DocumentGenerationStatus` | Async generation job state. | `PENDING -> PROCESSING -> COMPLETED`; `PENDING/PROCESSING -> FAILED`; failed jobs can create a new retry job. | `COMPLETED`, `FAILED`. | Yes. |
| `GeneratedDocumentStatus` | Generated document availability. | `DRAFT -> GENERATED -> DELIVERED -> ARCHIVED`; `GENERATED -> ARCHIVED`. | `ARCHIVED`. | Yes. |
| `DocumentInputStatus` | Input collection state. | `DRAFT -> SUBMITTED -> VALIDATED -> LOCKED`; validation can return to `NEEDS_CORRECTION`; any state -> `ARCHIVED`. | `LOCKED`, `ARCHIVED`. | Yes after submit/lock/archive. |
| `DocumentReviewStatus` | Legal/quality review state. | `PENDING -> IN_REVIEW -> APPROVED`; `IN_REVIEW -> CHANGES_REQUESTED -> IN_REVIEW`; `IN_REVIEW -> REJECTED`. | `APPROVED`, `REJECTED`. | Yes. |
| `GeneratedFileType` | Output file format. | Immutable per file. | Record itself is final unless file deleted/quarantined. | Download and replacement require audit. |
| `DocumentUpdateType` | Document change reason. | Append-only events. | Event record itself is final. | Yes. |
| `FileObjectStatus` | Stored object lifecycle. | `ACTIVE -> QUARANTINED`; `ACTIVE/QUARANTINED -> DELETED`; `QUARANTINED -> ACTIVE` after review. | `DELETED`. | Yes. |

## Breach and DSAR statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `BreachStatus` | Breach incident lifecycle. | `REPORTED -> TRIAGE -> ASSESSING_RISK`; if notifiable: `NOTIFIABLE -> REPORTED_TO_AUTHORITY -> SUBJECTS_NOTIFIED -> MITIGATED -> CLOSED`; if not notifiable: `ASSESSING_RISK -> MITIGATED -> CLOSED`. | `CLOSED`. | Always. |
| `BreachRiskLevel` | Assessed incident risk. | Can increase/decrease while incident is not closed. | None. | Always. |
| `DataSubjectRequestType` | DSAR/legal request kind. | Usually immutable after intake; corrections allowed before response. | None. | Yes when corrected. |
| `DataSubjectRequestStatus` | DSAR lifecycle. | `RECEIVED -> VERIFYING_IDENTITY -> IN_PROGRESS -> RESPONDED -> CLOSED`; `IN_PROGRESS -> WAITING_FOR_CLIENT -> IN_PROGRESS`; active states -> `REJECTED`. | `REJECTED`, `CLOSED`. | Always. |
| `IdentityVerificationStatus` | Identity verification lifecycle. | `NOT_STARTED -> REQUESTED -> VERIFIED`; `REQUESTED -> FAILED`; `NOT_STARTED -> NOT_REQUIRED`. | `VERIFIED`, `FAILED`, `NOT_REQUIRED`. | Always for DSAR. |
| `IntakeChannel` | Request intake source. | Usually immutable after creation. | None. | No, unless corrected. |

## Communication statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `MessageThreadStatus` | Conversation state. | `OPEN -> WAITING_FOR_CLIENT -> WAITING_FOR_PRIVAZY -> OPEN`; any active state -> `CLOSED`. | `CLOSED`. | Yes for breach/DSAR/document threads. |
| `NotificationStatus` | Notification delivery/read state. | `PENDING -> SENT -> READ`; `PENDING/SENT -> FAILED`; old records -> `ARCHIVED`. | `READ`, `FAILED`, `ARCHIVED`. | Yes for failed legal/payment/document notifications. |
| `NotificationType` | Notification domain. | Immutable per notification. | Record itself is final. | No, status changes decide. |

## CMS and marketing statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `BlogPostStatus` | Content publishing lifecycle. | `DRAFT -> REVIEW -> SCHEDULED -> PUBLISHED`; `REVIEW -> DRAFT`; published/scheduled -> `ARCHIVED`. | `PUBLISHED`, `ARCHIVED`. | Yes for publish/archive/legal review. |
| `NewsletterStatus` | Subscriber lifecycle. | `PENDING -> SUBSCRIBED`; subscribed/pending -> `UNSUBSCRIBED`; delivery feedback -> `BOUNCED` or `COMPLAINED`. | `UNSUBSCRIBED`, `BOUNCED`, `COMPLAINED`. | Yes for consent and unsubscribe. |
| `NewsletterCampaignStatus` | Campaign lifecycle. | `DRAFT -> SCHEDULED -> SENDING -> SENT`; `DRAFT/SCHEDULED -> CANCELLED`. | `SENT`, `CANCELLED`. | Yes when scheduled/sent/cancelled. |
| `NewsletterEventType` | Email/subscriber event taxonomy. | Append-only events. | Event record itself is final. | Consent and unsubscribe events require audit/consent trail. |
| `ConsentStatus` | Consent lifecycle. | `GRANTED -> WITHDRAWN`. | `WITHDRAWN`. | Always. |
| `ConsentType` | Consent category. | Immutable per record. | Record itself is final. | Creation/withdrawal require audit or equivalent evidence. |

## Automation statuses

| Enum | Meaning | Allowed transitions | Final states | Audit required |
| --- | --- | --- | --- | --- |
| `AutomationStatus` | Rule, run, and workflow state. | Rules: `DRAFT -> ACTIVE -> PAUSED -> ACTIVE -> ARCHIVED`. Runs/events: `QUEUED -> RUNNING -> SUCCEEDED`; active states -> `FAILED` or `CANCELLED`. | For rules: `ARCHIVED`. For runs/events: `SUCCEEDED`, `FAILED`, `CANCELLED`. | Yes for failed runs, status changes, idempotency conflicts, and rules that trigger legal/payment/customer actions. |

## Final-state override rule

Moving a record out of a final state is not a normal transition. If a later phase needs reopen/restore behavior, implement it as a new explicit event or a new replacement record unless legal/accounting requirements demand mutation. Any override must include:

- actor,
- reason,
- previous status,
- new status,
- timestamp,
- impacted entity id,
- audit log entry.
