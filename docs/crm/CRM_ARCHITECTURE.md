# CRM Architecture

## Layers

- `src/app/admin/page.tsx`: protected CRM shell entry.
- `src/components/crm/*`: client-side operational UI and detail forms.
- `src/app/api/crm/*`: staff-only Route Handlers.
- `src/server/crm/access.ts`: current read/write role guard.
- `src/server/crm/permissions.ts`: explicit permission facade for future modules.
- `src/server/crm/schemas.ts`: Zod validation.
- `src/server/crm/service.ts`: database operations and audit writes.
- `src/server/crm/serializers.ts`: safe response shaping.
- `src/server/crm/data.ts`: DB-backed dashboard payload.

## Rule

UI hiding is not security. Every mutation must pass a server-side role check, Zod validation and safe error handling.
