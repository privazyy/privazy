# Private routes

This document records the route status relevant to the CRM API security PR.

## Public endpoints

- `/api/leads/iod` remains public because it receives public landing/checker submissions.
- `/api/auth/*` remains public for NextAuth.
- Public pages such as `/`, `/blog`, and `/sklep/*` remain public.

## Private CRM API endpoints

- `/api/crm/leads`
- Future `/api/crm/*` endpoints must use `withCrmApiRead()` for GET-style reads and `withCrmApiMutation()` for mutating methods.

## Out of scope

- `/api/documents/generate` remains for `[security] gate document generation by auth and organization`.
- tRPC document queries remain for `[security] enforce organization scope in document queries`.
- Full private route page guard remains in the separate private-routes PR until merged into `main`.
