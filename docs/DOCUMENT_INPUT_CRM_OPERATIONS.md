# Document Input CRM Operations

CRM now includes `Formularze dokumentów`.

Visible fields:
- organization,
- order number,
- order item,
- template,
- document type,
- input status,
- validation summary presence,
- generation job count,
- submitted-by actor,
- updated timestamp.

Actions available through API:
- mark input as `NEEDS_CORRECTION`,
- lock input.

The UI shows status/detail visibility. Mutations are enforced server-side, not only by hidden buttons.
