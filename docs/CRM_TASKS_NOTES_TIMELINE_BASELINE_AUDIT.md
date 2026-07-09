# CRM tasks, notes and timeline baseline audit

## Summary

Current `main` already includes the CRM lead and organization foundation from PR #35. It has real `Lead`, `Organization`, `CrmNote`, `CrmTask` and `AuditLog` models, but the daily operational layer is still partial: notes are create-only, tasks exist mostly as related records, and there is no dedicated activity timeline.

| Area | Current state | Target in this PR | Out of scope | Notes |
| ---- | ------------- | ----------------- | ------------ | ----- |
| CrmNote model | Exists with lead/org author, body and internal visibility | Add note type, list/update endpoints and timeline events | Client-visible notes | Notes stay internal CRM-only. |
| CrmTask model | Exists with status, priority, assignee and due date | Add CRUD/status/assign APIs, cancelledAt and UI worklist | Automation/e-mail reminders | Tasks must be linked to lead or organization. |
| CrmActivity | Missing | Add operational timeline model | Full automation engine | AuditLog remains formal/security log. |
| AuditLog | Exists and records lead/org mutations | Keep using it for formal mutation evidence | Raw request logging | Metadata must stay minimized. |
| Lead relations | Notes and tasks exist | Add activities and timeline endpoint | Lead scoring | Lead detail becomes operational. |
| Organization relations | Notes and tasks exist | Add activities and timeline endpoint | Client portal | Organization detail becomes operational. |
| API | Lead/org notes POST exists; no task or timeline API | Add notes GET/PATCH, tasks API and timeline API | CSV/export/import | All routes stay under `/api/crm/*`. |
| UI | Lead/org detail shows notes/tasks as static related blocks | Add note composer, task form, task quick actions and timeline | Advanced reporting | READ_ONLY can read only. |

## Risk that remains

- No production migration should be executed in this PR.
- Timeline is operational, not a legal audit substitute.
- E-mail reminders, Inngest jobs and notifications remain follow-up work.
- Staging readiness remains `NO` until a controlled migration rehearsal and authenticated smoke are completed.
- Production readiness remains `NO`.
