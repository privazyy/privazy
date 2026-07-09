# DSR Module

The DSR module manages requests from people whose data may be processed by a client organization.

## Surfaces

- Client: `/platforma/wnioski-osob`
- CRM: `/admin/dsr`
- Portal API: `/api/portal/dsr`
- CRM API: `/api/crm/dsr`

## Current Capabilities

- Client can create a draft for their own organization only.
- Client cannot pass or override `organizationId`.
- Client can submit a draft, which sets `receivedAt`, `dueAt` and creates a CRM triage task.
- CRM staff can list, inspect, assign, prioritize, extend, update status, verify identity, prepare response drafts and add timeline notes.
- `READ_ONLY` can read CRM endpoints and pages, but cannot mutate.

## Explicit Non-Goals

- No production deployment.
- No breach module changes.
- No public third-party DSR form.
- No legal advice automation.
- No automatic response sending.
- No attachment storage.
