# CRM leads, clients and tasks baseline audit

Date: 2026-07-10
Scope: `prisma/schema.prisma`, `/crm`, `/api/crm/*`, `src/server/crm/*`, `src/components/crm/*`, auth guards and package scripts.

## Existing models

The current Prisma schema already has the operational CRM core: `Lead`, `Organization`, `ContactPerson`, `CrmNote`, `CrmTask`, `AuditLog`, `User` and `ClientProfile`. There is no separate `CrmActivity` table; CRM timeline uses `AuditLog` as the activity source. `CrmTask` has `completedAt`, but no dedicated `cancelledAt`; cancellation is represented by status `CANCELLED` plus audit metadata.

## Existing endpoints before this PR

The CRM already had guarded routes for leads, organizations, notes, tasks, timeline, activity and staff users. It could create and update leads/organizations, create notes, create tasks, change task status, assign leads and convert a lead to an organization.

## Admin UI before this PR

`/crm` rendered a database-backed CRM shell with a single React workspace. It had dashboard/list/detail states, create dialogs and basic quick actions. It was not a pure static mock, but it still felt partially form-only because several daily actions had no dedicated endpoint or visible action.

## Baseline table

| Area | Current state | Real/mock | Missing operational pieces | Security notes | Required work |
| --- | --- | --- | --- | --- | --- |
| Leads | DB model, list, create, update, assign, status, notes, tasks, convert | Real foundation | Archive endpoint/action, priority filtering, clearer workflow docs | `/crm` and API guarded; READ_ONLY blocked on writes | Add archive, filters, audit docs |
| Clients/Organizations | DB model, list, create, update, contacts, notes, tasks | Real foundation | Archive endpoint/action, contacts GET/PATCH, contact primary workflow docs | CLIENT blocked server-side; owner validated as staff | Add archive and contact edit APIs |
| Tasks | DB model, list, create, update, status | Real foundation | Dedicated assign/complete/cancel endpoints and clearer UI | Mutations require staff write role | Add task action routes and audit actions |
| Notes | `CrmNote` model and create APIs | Real partial | No edit/archive policy yet | INTERNAL only; CLIENT not exposed | Document remaining edit/archive gap |
| Timeline | AuditLog-backed timeline | Real partial | No separate `CrmActivity` model | Paginated and guarded reads | Keep AuditLog timeline, document mapping |
| Dashboard | DB-backed KPIs and empty states | Real partial | Needed lead/client/task-specific KPI set | `/crm` guard applies | Replace headline KPIs with operational CRM KPIs |
| Permissions | `requireCrmRead`, `requireCrmWrite`, role gates | Real | Needed named helper surface | READ_ONLY write block exists | Add shared permissions exports |
| Audit/activity | AuditLog writes for core mutations | Real partial | Missing audit for archive/contact edit/task action names | Metadata sanitized by server code | Centralize audit/activity helper |

## Biggest operational gaps found

1. CRM was no longer only a visual mock, but it was still partial because archive/contact edit/task assign/complete/cancel were not first-class API actions.
2. Contact persons could be added, but not listed through a dedicated organization contact endpoint or edited.
3. Task completion/cancellation worked through generic status change, but did not expose the operational API shape requested by the CRM workflow.
4. Dashboard used real data but its main cards were broader platform counters instead of daily CRM work counters.
5. There is no `cancelledAt` column and no note edit/archive model policy; these remain documented gaps.
