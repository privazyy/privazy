# CRM Permissions

| Role | `/admin` | CRM read API | CRM mutations |
| --- | --- | --- | --- |
| Unauthenticated | Redirect to public landing | `401` | `401` |
| `CLIENT` | Redirect to client area | `403` | `403` |
| `READ_ONLY` | Allowed | Allowed | `403 READ_ONLY` |
| `OPERATOR` | Allowed | Allowed | Allowed |
| `LAWYER` | Allowed | Allowed | Allowed |
| `ADMIN` | Allowed | Allowed | Allowed |

Every Route Handler calls the server-side read or write guard. UI hiding/disabling is only an ergonomic layer. Mutation services also validate assignee roles and referenced organization IDs.

The new CRM tables, `Organization` and `FormSubmission` have RLS enabled and privileges revoked from Supabase `anon` and `authenticated`. Runtime access uses the server database connection; no service-role credential is sent to the browser.
## Tasks, notes and timeline

- `ADMIN`: can read and mutate CRM notes/tasks/timeline-backed resources.
- `LAWYER`: can read and mutate operational/legal notes and tasks.
- `OPERATOR`: can read and mutate operational notes and tasks.
- `READ_ONLY`: can read notes, tasks and timeline, but cannot mutate.
- `CLIENT`: cannot access CRM notes, tasks or internal timeline.

Server-side route and service checks are required. UI hiding is not a security boundary.
