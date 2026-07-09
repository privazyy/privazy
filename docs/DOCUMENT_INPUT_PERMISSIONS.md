# Document Input Permissions

CLIENT:
- can list/read inputs only for organizations linked by `ClientProfile`,
- can create input only for own paid document `OrderItem`,
- can save draft only in `DRAFT` or `NEEDS_CORRECTION`,
- can submit only own paid document input,
- cannot provide trusted `organizationId`, `templateId`, or `createdById`.

READ_ONLY:
- can read CRM document inputs,
- cannot mutate,
- cannot mark needs correction,
- cannot lock,
- cannot create generation jobs.

OPERATOR:
- can read CRM inputs,
- can mark needs correction,
- can lock operationally.

LAWYER:
- can read and review,
- can mark needs correction,
- can support generation approval flow when later added.

ADMIN:
- full staff access in this PR scope.

Unauthenticated:
- no access.
