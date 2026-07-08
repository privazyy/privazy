# CRM Leads

`FormSubmission` stores the raw public form intake. `Lead` is the operational CRM record used by staff.

Manual leads are created by staff through `/admin` or `POST /api/crm/leads`. The IOD checker creates a lead directly in its server transaction with server-owned `source=IOD_CHECKER` and `status=NEW`; it never calls the private CRM API.

Lead detail supports status, priority and assignee changes, internal notes, related contacts/tasks, source submission metadata and conversion. List endpoints use cursor pagination (`limit` defaults to 25, maximum 100), validated filters and `createdAt desc`.

Conversion is transactional. It either uses an explicitly supplied, verified organization ID or creates a new organization. Exact NIP/name candidates produce `409 REVIEW_REQUIRED`; records are never merged automatically by e-mail. Conversion creates a primary contact, assigns `CONVERTED`, stores `organizationId` and `convertedAt`, and writes an audit event.

The IOD answer snapshot contains only the enumerated checker answers needed for operational review. Request metadata and full raw payloads are not returned by CRM serializers.
