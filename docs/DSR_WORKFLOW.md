# DSR Workflow

1. Client creates `DRAFT`.
2. Client submits the request.
3. System sets `RECEIVED`, `receivedAt`, `dueAt` and `verificationStatus=PENDING`.
4. CRM performs triage and may move to `IDENTITY_VERIFICATION`.
5. CRM records identity verification.
6. Verified requests move to `IN_PROGRESS`.
7. `LAWYER` or `ADMIN` prepares a response draft.
8. CRM moves the request to `RESPONSE_PREPARED`.
9. Staff can later mark `RESPONDED`, `REJECTED`, `CLOSED` or `CANCELLED`.

This workflow is a foundation. It does not send responses automatically and does not replace legal review.
