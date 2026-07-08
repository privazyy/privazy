# Invoice Provider Interface

`src/server/invoices/provider.ts` definiuje:

- `createInvoice`,
- `getInvoiceStatus`,
- opcjonalne `cancelInvoice`,
- opcjonalne `getInvoicePdf`,
- opcjonalne `handleWebhookEvent`.

Jedyną implementacją jest `MockInvoiceProvider`. Provider:

- działa tylko przy `ENABLE_INVOICES=true`,
- wymaga `INVOICE_PROVIDER=mock` i `INVOICE_MODE=mock`,
- blokuje się, gdy `ENABLE_LIVE_INVOICES=true`,
- używa osobnej sekwencji wyłącznie do numerów `MOCK/...`,
- nie importuje SDK ani kluczy systemu fakturowego,
- nie tworzy PDF i nie zwraca produkcyjnego URL.

Integracja live wymaga osobnego PR, approval i checklisty go-live.
