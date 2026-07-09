# Client Portal

This PR adds the first protected client portal foundation under `/platforma`.

Client can:
- see dashboard metrics,
- see own orders,
- inspect order items and document statuses,
- see document input statuses,
- download generated documents through a secure endpoint,
- see and update limited organization contact data,
- open account/settings links.

Client cannot:
- access `/admin`,
- access `/api/crm/*`,
- choose arbitrary `organizationId`,
- see another organization's orders or documents,
- receive raw storage keys or payment provider payloads.

This is a foundation PR. It is not full portal completion, live billing, live payments, live invoices, breach/DSR, CMS, or production readiness.
