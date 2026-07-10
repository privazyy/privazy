# Route Security Audit

| Route | Scope | Required role | Unauthenticated behavior | CLIENT behavior | READ_ONLY behavior | STAFF behavior | Test evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | none | Allowed | Allowed | Allowed | Allowed | Build route present |
| `/blog` | Public | none | Allowed | Allowed | Allowed | Allowed | Static route present |
| `/blog/[slug]` | Public | none | Allowed | Allowed | Allowed | Allowed | SSG route present |
| `/sklep` | Public expected | none | MISSING | MISSING | MISSING | MISSING | No route |
| `/sklep/[slug]` | Public expected | none | MISSING | MISSING | MISSING | MISSING | Only `/sklep/polityka-prywatnosci` exists |
| `/regulamin` | Public expected | none | MISSING | MISSING | MISSING | MISSING | No route |
| `/polityka-prywatnosci` | Public expected | none | MISSING | MISSING | MISSING | MISSING | No root route |
| `/polityka-cookies` | Public expected | none | MISSING | MISSING | MISSING | MISSING | No route |
| `/sklep/polityka-prywatnosci` | Public | none | Allowed | Allowed | Allowed | Allowed | Build route present |
| `/api/leads/iod` | Public write | none | Allowed | Allowed | Allowed | Allowed | Zod validation; no limiter/Turnstile |
| `/api/newsletter/subscribe` | Public expected | none | MISSING | MISSING | MISSING | MISSING | No route on `main` |
| `/platforma` and `/platforma/*` | Private client expected | CLIENT | MISSING | MISSING | MISSING | MISSING | No routes |
| `/client` | Placeholder | none enforced | Allowed | Allowed | Allowed | Allowed | Public placeholder; not a secure portal |
| `/admin` | Private staff | ADMIN/LAWYER/OPERATOR/READ_ONLY | Redirect `/` | Redirect `/client` | Allowed read-only UI | Allowed | `src/app/admin/page.tsx` |
| `/admin/leads` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | Single `/admin` shell only |
| `/admin/organizations` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | Single `/admin` shell only |
| `/admin/tasks` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/orders` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/payments` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/invoices` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/documents` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | Single `/admin` shell only |
| `/admin/breaches` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/dsr` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/admin/cms` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route on `main` |
| `/api/crm/*` | Private API | ADMIN/LAWYER/OPERATOR/READ_ONLY read; no READ_ONLY mutations | `401` | `403` | GET allowed, mutations `403 READ_ONLY` | Allowed by role | `requireCrmRead/Write` |
| `/api/portal/*` | Private API expected | CLIENT | MISSING | MISSING | MISSING | MISSING | No route |
| `/api/documents/*` | Private expected | staff/client scoped | Public on `/api/documents/generate` | Public | Public | Public | CRITICAL blocker |
| `/api/payments/*` | Private/webhook expected | staff/webhook | MISSING | MISSING | MISSING | MISSING | No route |
| `/api/invoices/*` | Private expected | staff | MISSING | MISSING | MISSING | MISSING | No route |
| `/api/cms/*` | Private staff expected | staff | MISSING | MISSING | MISSING | MISSING | No route on `main` |

Decision: `STAGING_NO_GO`. CLIENT is blocked from CRM, and READ_ONLY cannot mutate CRM, but the portal and document route boundaries are not release-candidate safe.
