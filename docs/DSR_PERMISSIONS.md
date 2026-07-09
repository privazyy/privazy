# DSR Permissions

| Role | Portal DSR | CRM read | CRM mutate | Prepare response |
| --- | --- | --- | --- | --- |
| `CLIENT` | Own organization only | No | No | No |
| `READ_ONLY` | No | Yes | No | No |
| `OPERATOR` | No | Yes | Yes | No |
| `LAWYER` | No | Yes | Yes | Yes |
| `ADMIN` | No | Yes | Yes | Yes |

## Tenant Rules

- Portal actor organization is resolved from `ClientProfile`.
- Portal create/update never accepts `organizationId`.
- Portal detail requires `id + organizationId`.
- CRM access still requires server-side CRM role checks.

## Mutation Rules

Every mutation uses a route handler or server action that resolves the actor server-side, validates input with Zod and writes activity/audit where relevant.
