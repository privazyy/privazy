# CMS Permissions

| Role | `/admin/cms` | CMS read API | Create/edit | Submit review | Publish/archive |
| --- | --- | --- | --- | --- | --- |
| Unauthenticated | Redirected | `401` | `401` | `401` | `401` |
| `CLIENT` | Redirected to client area | `403` | `403` | `403` | `403` |
| `READ_ONLY` | Allowed | Allowed | `403 READ_ONLY` | `403 READ_ONLY` | `403 READ_ONLY` |
| `LAWYER` | Allowed | Allowed | Allowed | Allowed | `403` |
| `OPERATOR` | Allowed | Allowed | Allowed | Allowed | Allowed |
| `ADMIN` | Allowed | Allowed | Allowed | Allowed | Allowed |

There is no `MARKETING` role in the current `UserRole` enum. This PR therefore maps marketing/editor operations to existing staff roles and documents a follow-up to add `MARKETING` if the organization needs a dedicated editorial role.

UI disabled states are not the security boundary. Every CMS Route Handler calls `requireCmsRead` or `requireCmsWrite`, and service mutations call `assertCmsMutation`.
