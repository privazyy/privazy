# Client Portal Data Scope

Portal scope is organization-based.

Resolution:
1. Session identifies `actor.id`.
2. `ClientProfile` rows define allowed `organizationIds`.
3. Every order, document input, generated document, and organization query filters by these ids.
4. Detail endpoints verify the target row organization before returning data.

Serializers:
- expose order/status/totals intended for clients,
- expose document statuses and download availability,
- do not expose raw `docxFileKey`, `pdfFileKey`, `zipFileKey`,
- do not expose internal CRM notes, tasks, audit internals, or payment provider payloads.

Client-provided organization ids are not accepted by portal API schemas.
