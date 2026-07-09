# Client Portal Permissions

CLIENT:
- can open `/platforma`,
- can read only organizations linked through `ClientProfile`,
- can read only portal orders with matching organization scope,
- can read only document inputs with matching organization scope,
- can download generated documents only when organization scope matches,
- can update limited organization contact/address fields.

Staff:
- not granted portal support/impersonation in this PR,
- redirects to `/admin`,
- should use CRM surfaces.

Unauthenticated:
- no access to portal pages or API.

READ_ONLY:
- remains a CRM read role, not a client portal role.

Server-side checks live in `src/server/portal/client-portal-permissions.ts`; UI state is not treated as authorization.
