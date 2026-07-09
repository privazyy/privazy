# CRM commerce permissions

Commerce and document operations reuse the CRM auth gate:
- unauthenticated: `401`
- `CLIENT`: `403`
- `READ_ONLY`: read only
- `OPERATOR`, `LAWYER`, `ADMIN`: scoped staff access

Policy:
- `ADMIN` can read all CRM commerce data, operate orders, request/retry mock invoices, cancel sandbox records, retry document jobs, and review documents.
- `LAWYER` can read commerce data and perform document review. Invoice request/retry is not granted by default.
- `OPERATOR` can read commerce data, operate orders, retry sandbox payment checks, request/retry mock invoices, and retry document jobs.
- `READ_ONLY` can read orders, payments, invoices, document jobs, generated documents, and download history. All mutations return `403 READ_ONLY`.
- `CLIENT` cannot access `/admin` or `/api/crm/*`.

Security notes:
- Payment status is not freely mutable from UI/API.
- There is no normal operator `mark as paid` action.
- Amounts come from `Order`, `Payment`, and `Invoice` rows.
- Raw webhook/provider payloads are not stored in exposed serializers.
- Raw `fileKey` values are not returned by CRM serializers.
