# CRM Roles And Permissions

| Role | CRM read | CRM mutate | Legal/document ops | Notes |
| --- | --- | --- | --- | --- |
| ADMIN | Yes | Yes | Yes | Full CRM staff role |
| LAWYER | Yes | Yes | Yes | Legal/review operations |
| OPERATOR | Yes | Yes | No by default | Leads, organizations, tasks |
| READ_ONLY | Yes | No | No | Can inspect operational data only |
| CLIENT | No | No | No | Redirected from `/crm`, blocked from CRM APIs |

Current guards:

- `requireCrmRead`
- `requireCrmWrite`
- `requireCrmMutation`
- `requireCrmAdmin`
- `requireCrmLegalOperation`
- `requireCrmDocumentOperation`
- `assertReadOnlyCannotMutate`
- `assertClientCannotAccessCrm`
