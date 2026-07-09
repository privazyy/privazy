# CRM Leads and Organizations Smoke Checklist

Use a disposable local Postgres/Supabase database. Do not run this migration against production during PR review.

## Schema

- [ ] Apply all Prisma migrations from an empty database.
- [ ] Verify `Lead`, `ContactPerson`, `CrmNote`, `CrmTask` and added organization columns.
- [ ] Verify RLS is enabled and `anon`/`authenticated` have no table privileges.
- [ ] Run `npm run prisma:generate` and `npx prisma validate`.

## Permissions

- [ ] Unauthenticated CRM GET/POST returns `401`.
- [ ] `CLIENT` CRM GET/POST returns `403`.
- [ ] `READ_ONLY` can list/detail and receives `403` for create, update, note, assign and convert.
- [ ] `OPERATOR`, `LAWYER` and `ADMIN` can perform allowed mutations.
- [ ] `/admin` redirects unauthenticated users to the public landing and `CLIENT` to `/client`.

## Validation and lists

- [ ] Invalid e-mail, overlong and unknown fields return `400`.
- [ ] Invalid filters and `limit > 100` return `400`.
- [ ] Lead filters/search/cursor work; organization status/industry/owner/search/cursor work.
- [ ] List payload omits checker snapshots, source details, password hashes and raw Prisma metadata.

## Workflow

- [ ] Manual lead create writes `crm.lead.created`.
- [ ] Status/assignee changes persist and write the matching audit event.
- [ ] Internal note persists without its body appearing in audit metadata.
- [ ] New organization can be edited and archived.
- [ ] Conversion creates/picks a verified organization, creates a primary contact and marks the lead `CONVERTED`.
- [ ] Re-conversion returns `409`; a similar organization returns `409 REVIEW_REQUIRED`.
- [ ] Public `/api/leads/iod` ignores attempted CRM owner/status/note fields and creates `IOD_CHECKER` / `NEW`.

## UI

- [ ] Lead and organization lists show real database records, loading/empty/error states and bounded pagination.
- [ ] Create forms and detail editing work at mobile, tablet and desktop widths.
- [ ] `READ_ONLY` sees no enabled mutation action.
- [ ] Run `npm run responsive:check`.
