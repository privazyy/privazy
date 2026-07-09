# CRM document review

Generated documents now have `reviewStatus`, `reviewedById`, `reviewedAt`, and `reviewNote`.

Review states:
- `PENDING`
- `APPROVED`
- `REJECTED`
- `NOT_REQUIRED`

Allowed actions:
- mark for review
- approve for client
- reject for client

Permissions:
- ADMIN and LAWYER can review.
- OPERATOR can retry document jobs but cannot approve/reject generated documents.
- READ_ONLY can read only.
- CLIENT is blocked from CRM.

Approval does not create a complete client portal delivery flow. That remains out of scope.
