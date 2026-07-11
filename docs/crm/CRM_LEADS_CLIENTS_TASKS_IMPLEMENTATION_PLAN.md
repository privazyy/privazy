# CRM leads, clients and tasks implementation plan

## Stage A: shared CRM layer

Status: implemented in this PR as a foundation.

Work:
- Keep auth/session checks in `src/server/crm/access.ts`.
- Expose reusable permission helpers in `src/server/crm/permissions.ts`.
- Keep input contracts in `src/server/crm/schemas.ts`.
- Keep safe output shaping in `src/server/crm/serializers.ts`.
- Add `pagination.ts`, `errors.ts`, `activity.ts` and `audit.ts`.

## Stage B: leads

Status: implemented as operational foundation.

Work:
- Add priority filter and sort.
- Keep list/detail/create/edit/status/assign/notes/tasks/timeline/convert.
- Add archive endpoint and UI action.
- Audit create/update/status/assign/convert/archive.

## Stage C: clients and organizations

Status: implemented as operational foundation.

Work:
- Keep list/detail/create/edit/notes/tasks/timeline.
- Add archive endpoint and UI action.
- Add contacts list and contact edit endpoint.
- Keep primary contact behavior: setting one primary contact unsets previous primary contacts for the same resource.

## Stage D: tasks

Status: implemented as operational foundation.

Work:
- Keep list/detail/create/edit/status.
- Add dedicated assign, complete and cancel endpoints.
- Complete sets `completedAt` server-side.
- Cancel uses status `CANCELLED`; separate `cancelledAt` remains a schema gap.

## Stage E: notes and timeline

Status: partial but usable.

Work:
- Notes can be added to leads and organizations.
- Timeline is AuditLog-backed and paginated.
- Note edit/archive is left for a policy-focused follow-up.

## Stage F: dashboard

Status: implemented as CRM work dashboard foundation.

Work:
- Headline cards now focus on new leads, unassigned leads, qualified leads, active clients, open tasks, today's tasks and overdue tasks.
- Alerts include unassigned leads and overdue tasks.

## Stage G: tests, smoke checklist and docs

Status: docs and smoke checklist added. Automated test runner was not present in `package.json` at the time of implementation.
