# CRM Organizations

The existing `Organization` model remains the canonical company record. This PR adds `legalName`, `industry`, `size`, CRM `status` and optional staff `ownerId`.

Staff may list, create, read, update and archive organizations. Lists support `q`, `status`, `industry`, `ownerId`, cursor and bounded `limit`. Detail returns allowlisted organization fields plus related leads, contacts, internal notes and task summaries.

Client-provided IDs are never trusted during conversion: an existing organization is loaded by ID before use. Similar organizations produce a review conflict. Archiving is a status change to `ARCHIVED`; this foundation does not hard-delete organizations.

Portal behavior, client membership and organization self-service are outside this PR.
