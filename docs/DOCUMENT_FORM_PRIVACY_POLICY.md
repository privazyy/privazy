# Privacy policy form

The first full document form is `PRIVACY_POLICY` at:

- `/platforma/dokumenty/[orderItemId]/formularz`
- `POST /api/documents/input/save`
- `POST /api/documents/input/submit`

The form covers:

- controller data,
- DPO/contact point,
- website/application type,
- data subject categories,
- processing purposes,
- legal bases,
- recipients and tools,
- EEA transfers,
- retention periods,
- data subject rights contact,
- cookies and analytics,
- additional clauses and effective date.

Validation lives in `src/lib/document-forms/privacy-policy/schema.ts`. Template mapping lives in `src/lib/document-forms/privacy-policy/map-to-template.ts`.

Draft saves use a Zod object validation so incomplete data can be stored safely. Submit uses the full schema and starts generation only after server-side ownership checks.

The document includes this disclaimer:

> Dokument jest generowany na podstawie danych podanych przez klienta i wymaga weryfikacji przed uzyciem w szczegolnych przypadkach. Generator nie stanowi indywidualnej porady prawnej ani obietnicy pelnej zgodnosci z RODO.

The form is not a promise of full GDPR compliance. Final legal content and variables require lawyer review before production use.
