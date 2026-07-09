# Client Portal Security

Controls added:
- separate portal service layer,
- CLIENT-only actor resolver,
- organization membership checks through `ClientProfile`,
- safe API errors,
- secure download endpoint with short-lived signed URL,
- audit log and `PortalDocumentDownload` row on download,
- limited organization update with validation and audit log,
- RLS enabled and `anon`/`authenticated` revoked on new portal tables.

Not added:
- staff impersonation,
- live billing settings,
- raw storage key exposure,
- raw payment provider payload exposure,
- production-ready generator guarantee.

Production remains NO until migrations, RLS/Data API exposure, seed data, and live smoke tests are rehearsed in staging.
