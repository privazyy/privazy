# CRM routing

The canonical staff UI is `/crm`; locally it is `http://localhost:3000/crm`. The public application remains at `http://localhost:3000`. API routes remain under `/api/crm` and are not renamed.

`/crm` and `/crm/*` are protected twice: `src/proxy.ts` performs the early session/role gate and the server page repeats the check before reading data. Unauthenticated users go to `/login?callbackUrl=/crm`; `CLIENT` is redirected to `/client`; `READ_ONLY`, `OPERATOR`, `LAWYER`, and `ADMIN` may read. Mutations are still enforced independently by CRM API/service guards.

`/admin` and `/admin/*` are legacy-only and return a permanent redirect to the equivalent `/crm` path. No navigation uses `/admin`.

Supported canonical paths include `/crm`, `/crm/leads`, `/crm/leads/[leadId]`, `/crm/clients`, `/crm/clients/[clientId]`, `/crm/tasks`, `/crm/tasks/[taskId]`, `/crm/orders`, `/crm/documents`, `/crm/breaches`, `/crm/dsr`, `/crm/notifications`, `/crm/settings`, and `/crm/audit`. A path may show a controlled partial state when its underlying model/workflow is not present.
