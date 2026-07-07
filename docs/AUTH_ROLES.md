# Auth roles

Role pochodza z enumu `UserRole` w `prisma/schema.prisma`.

## Role

| Role | CRM read | CRM mutate | Manage users | Manage settings | Client portal |
| --- | --- | --- | --- | --- | --- |
| `ADMIN` | Yes | Yes | Yes | Yes | No |
| `LAWYER` | Yes | Yes | No | No | No |
| `OPERATOR` | Yes | Yes | No | No | No |
| `READ_ONLY` | Yes | No | No | No | No |
| `CLIENT` | No | No | No | No | Yes |

## Helpery

Glowne helpery sa w `src/server/auth/permissions.ts`:

- `isStaffRole(role)`
- `isClientRole(role)`
- `canAccessCrm(user)`
- `canReadCrm(user)`
- `canMutateCrm(user)`
- `canManageUsers(user)`
- `canManageSettings(user)`
- `canReviewDocuments(user)`
- `canRetryDocumentJob(user)`
- `canAccessClientPortal(user)`

Server-side wymagania sa w `src/server/auth/guards.ts`:

- `requireUser()`
- `requireStaff()`
- `requireCrmAccess()`
- `requireCrmMutation()`
- `requireAdmin()`
- `requireClientPortalAccess()`

`READ_ONLY` moze czytac CRM, ale `canMutateCrm()` zwraca `false`, a `requireCrmMutation()` rzuca kontrolowany blad. `CLIENT` nie jest rola staff i nie przechodzi `requireCrmAccess()`.
