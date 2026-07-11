# CRM permissions

## Roles

| Role | Read CRM | Mutate CRM | Notes |
| --- | --- | --- | --- |
| unauthenticated | No | No | API returns 401. |
| CLIENT | No | No | Redirected away from `/crm`; API returns 403. |
| READ_ONLY | Yes | No | Can inspect lists/details/timeline only. |
| OPERATOR | Yes | Yes | Operational lead/client/task work. |
| LAWYER | Yes | Yes | Operational/legal staff role. |
| ADMIN | Yes | Yes | Full CRM access. |

## Enforcement

UI hiding is not treated as security. `/crm` checks session and role server-side. `/api/crm/*` routes call `requireCrmRead` or `requireCrmWrite`. Service mutations also call `assertCrmWriteActor`.

Shared helper surface:

- `requireCrmRead`
- `requireCrmMutation`
- `requireCrmAdmin`
- `assertClientCannotAccessCrm`
- `assertReadOnlyCannotMutate`
- `canReadCrm`
- `canMutateCrm`
- `canManageLead`
- `canManageOrganization`
- `canManageTask`
