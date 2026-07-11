# CRM tasks

`/crm/tasks` is backed by `CrmTask`. APIs support bounded list/create, read/edit, assign, status, complete, and cancel. The server owns creator/completion timestamps and every important mutation writes audit activity. The task detail URL resolves under `/crm/tasks/[taskId]`; richer dedicated detail UX and an explicit `cancelledAt` schema field remain partial.
