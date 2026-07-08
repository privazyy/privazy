# Invoice Go-Live Checklist

Status obecny: **MANUAL_APPROVAL_REQUIRED**. Production readiness: **NO**.

- [ ] Dane sprzedawcy i kontaktowe są kompletne.
- [ ] Księgowość zatwierdziła pozycje, rabaty, VAT i daty sprzedaży.
- [ ] Prawnik zatwierdził wording checkoutu oraz dokumentów prawnych.
- [ ] Wybrano i oceniono live provider.
- [ ] DPA, region danych, retencja i subprocesorzy są zatwierdzeni.
- [ ] Produkcyjna numeracja ma formalny approval i osobną sekwencję.
- [ ] API keys istnieją wyłącznie w prywatnym env.
- [ ] Webhook ma podpis, replay protection i idempotencję.
- [ ] PDF ma chroniony, audytowany download.
- [ ] Korekty, anulowanie i retry mają zatwierdzony workflow.
- [ ] Staging używa danych testowych i sandbox providera.
- [ ] Monitoring, alerty, reconciliation i incident response są gotowe.
- [ ] Backup/restore oraz eksport księgowy zostały przećwiczone.
- [ ] `ENABLE_LIVE_INVOICES` ma approval dwóch osób przed zmianą.

Samo ukończenie tej checklisty technicznej nie zastępuje decyzji księgowości,
prawnika ani właściciela produktu.
