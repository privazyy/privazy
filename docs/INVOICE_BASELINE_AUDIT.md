# Invoice Baseline Audit

## Stan wejściowy

| Obszar | Stan przed PR | Wystarczające dla mock invoice |
| --- | --- | --- |
| `Order` | Istnieje; ma status, walutę, netto, VAT, rabat, brutto i paid timestamp. | Tak, po potwierdzeniu `PAID` oraz zgodnej płatności `SUCCEEDED`. |
| `OrderItem` | Istnieje; przechowuje snapshot produktu, ilość i kwoty. | Tak, jako przyszłe źródło pozycji faktury. Ten PR zapisuje wyłącznie sumy faktury. |
| `Payment` | Istnieje; provider/mode/status, kwota, waluta i idempotency key. | Tak, jako dodatkowy paid gate. |
| `BillingProfile` | Imię/nazwa, e-mail, firma, NIP, adres, kod, miasto i kraj. | Tak dla faktury testowej. |
| Intencja | `Order.wantsInvoice` i `BillingProfile.wantsInvoice`. | Tak; brak intencji blokuje wystawienie. |
| Invoice | Brak modelu, providera, statusów i workflow. | Nie. |

## Dane wymagane przez live provider

Przed integracją live należy potwierdzić z księgowością i prawnikiem:

- pełne dane sprzedawcy i nabywcy,
- reguły walidacji NIP/VAT UE oraz kraju,
- sposób rozliczania rabatu i pozycji,
- stawki i podstawy zwolnienia z VAT,
- walutę, kursy oraz datę sprzedaży,
- legalną, ciągłą numerację produkcyjną,
- korekty, anulowanie, retencję i eksport,
- DPA, lokalizację danych, zakres webhooków i PDF.

Ten PR nie uzupełnia brakujących decyzji i nie tworzy dokumentu księgowego.
