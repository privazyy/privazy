# E2E Scenarios

## Automatyczny smoke

`npm run test:e2e` wykonuje lekki HTTP smoke tylko wtedy, gdy ustawiono `E2E_BASE_URL`. Domyslne trasy:

- `/`
- `/blog`
- `/sklep`
- `/koszyk`
- `/checkout`

Bez `E2E_BASE_URL` komenda konczy sie jako skipped, zeby CI nie zalezal od niestabilnego zewnetrznego preview.

## Reczne scenariusze przed stagingiem

1. Public landing: wynik IOD checker pokazuje status, trigger i brak falszywego submitu bez zgody.
2. Blog: draft i in-review nie sa publiczne, zaplanowany wpis pojawia sie dopiero po terminie.
3. Shop/cart/checkout: produkt trafia do koszyka, suma brutto/VAT jest spojna, checkout tworzy zamowienie testowe.
4. Payment mock/test: sukces i blad platnosci prowadza do wlasciwych ekranow statusu.
5. Invoice mock/test: invoice request nie ujawnia danych klienta w logach.
6. Document form: dane formularza sa zapisywane dla wlasciwej organizacji.
7. Document download: plik jest pobierany tylko przez endpoint portalu i generuje audit event.
8. CRM: READ_ONLY widzi dane, ale nie moze zapisac zmian; CLIENT nie wchodzi do CRM.
9. CMS: OPERATOR moze przygotowac draft, ale nie publikuje.
10. Automations: reminder ma stabilny idempotency key i nie wysyla duplikatu.
