# Client Portal Smoke Checklist

- Unauthenticated user is redirected away from `/platforma`.
- CLIENT can open `/platforma`.
- CLIENT cannot open `/admin`.
- CLIENT cannot call `/api/crm/*`.
- CLIENT sees dashboard without CRM notes or tasks.
- CLIENT sees only own orders.
- CLIENT cannot open another organization order URL.
- CLIENT sees only own document input statuses.
- CLIENT cannot open another organization document input URL.
- CLIENT sees only own generated documents.
- Download uses `/api/portal/documents/generated/[documentId]/download`.
- Download endpoint does not return raw storage key.
- Download logs `PortalDocumentDownload`.
- Organization update validates input and writes AuditLog.
- Portal serializers do not expose raw file keys.
- Portal serializers do not expose provider payloads.
