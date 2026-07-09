# Document Input Flow Smoke Checklist

- CLIENT sees only own document inputs in `/platforma/dokumenty`.
- CLIENT cannot access another organization's input URL.
- CLIENT cannot create input for unpaid order item.
- CLIENT cannot create input for non-document order item.
- CLIENT saves draft and returns to draft.
- CLIENT submit requires `confirmAccuracy`.
- CLIENT submit requires `acceptDocumentDisclaimer`.
- Submit creates `DocumentGenerationJob` or controlled pending state.
- CRM staff can list document inputs.
- CLIENT is blocked from `/api/crm/documents/inputs`.
- READ_ONLY cannot mark needs correction.
- LAWYER/OPERATOR/ADMIN can mark needs correction.
- Arbitrary `organizationId` is ignored/rejected.
- Arbitrary `templateId` is ignored/rejected.
- Arbitrary `createdById` is ignored/rejected.
- Audit metadata does not contain full `dataJson`.
