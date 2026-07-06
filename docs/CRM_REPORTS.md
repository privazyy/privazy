# CRM_REPORTS

Phase 7R reports are read-only CRM modules built from Prisma aggregates and limited lists. They do not use fake KPI data.

## Current reports

The reports module covers:

- leads by status,
- orders by status,
- gross and net revenue from paid sandbox orders,
- failed payments,
- failed invoices,
- generated documents by status,
- failed document jobs,
- active breach incidents,
- active data subject requests,
- tasks by operator/owner where assignments exist.

## Data sources

Reports read from:

- `CrmLead` and IOD `FormSubmission` leads,
- `Order` and `OrderItem`,
- `Payment`,
- `Invoice`,
- `GeneratedDocument`,
- `DocumentGenerationJob`,
- `BreachIncident`,
- `DataSubjectRequest`,
- `CrmTask`,
- `AuditLog`.

## Empty states

When a source table has no rows, the CRM shows a controlled empty state. It does not create seeded fake leads, orders, breaches, requests, tasks, or messages to make the dashboard look active.

## Limits

Phase 7R keeps queries bounded with `take` limits and dashboard-level aggregates. Advanced date ranges, export, saved filters, cohort analysis, and per-user SLA dashboards are Phase 8R/10R scope.
