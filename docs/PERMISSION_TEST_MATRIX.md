# Permission Test Matrix

| Obszar | ADMIN | LAWYER | OPERATOR | READ_ONLY | CLIENT |
| --- | --- | --- | --- | --- | --- |
| CRM read | tak | tak | tak | tak | nie |
| CRM settings | tak | nie | nie | nie | nie |
| CRM leads mutation | tak | nie | tak | nie | nie |
| CRM documents mutation | tak | tak | nie | nie | nie |
| CRM breach handling | tak | tak | nie | nie | nie |
| Document retry | tak | tak | tak | nie | nie |
| Financial read | tak | nie | tak | tak | nie |
| CMS read | tak | tak | tak | tak | nie |
| CMS draft edit | tak | tak | tak | nie | nie |
| CMS publish/schedule | tak | tak | nie | nie | nie |
| Portal access | tak | tak | tak | tak | tak |
| Portal organization management | internal | internal | internal | internal | OWNER/ADMIN only |

## Test coverage

- `tests/permissions/crm-permissions.test.ts`
- `tests/permissions/cms-permissions.test.ts`
- `tests/permissions/platform-permissions.test.ts`

## Regula utrzymania

Kazda nowa rola, trasa admin albo akcja mutujaca musi miec wpis w tej macierzy i test uprawnieniowy przed stagingiem.
