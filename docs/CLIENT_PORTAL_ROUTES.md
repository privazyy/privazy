# Client Portal Routes

Docelowa sciezka portalu klienta to `/platforma`. Stara sciezka `/client` pozostaje kompatybilnym aliasem i wykonuje redirect do `/platforma`.

## Trasy

| Trasa | Zakres |
| --- | --- |
| `/platforma` | Dashboard aktywnej organizacji, alerty, ostatnie dokumenty, sprawy i timeline. |
| `/platforma/dokumenty` | Lista dokumentow i formularzy wymagajacych danych. |
| `/platforma/dokumenty/[id]` | Szczegoly wygenerowanego dokumentu i historia pobran. |
| `/platforma/dokumenty/[orderItemId]/formularz` | Formularz danych do pozycji zamowienia. Aktualny kod uzywa segmentu `[id]`, ale wartosc oznacza `orderItemId`. |
| `/platforma/zamowienia` | Zamowienia aktywnej organizacji. |
| `/platforma/zamowienia/[id]` | Szczegoly zamowienia, pozycje, platnosci i faktury. |
| `/platforma/naruszenia` | Rejestr naruszen ochrony danych. |
| `/platforma/naruszenia/nowe` | Formularz zgloszenia naruszenia. |
| `/platforma/naruszenia/[id]` | Szczegoly naruszenia widoczne dla klienta. |
| `/platforma/zadania-osob` | Rejestr zadan osob, ktorych dane dotycza. |
| `/platforma/zadania-osob/nowe` | Formularz nowego zadania osoby. |
| `/platforma/zadania-osob/[id]` | Szczegoly zadania osoby. |
| `/platforma/wiadomosci` | Lista watkow i formularz nowej wiadomosci. |
| `/platforma/wiadomosci/[id]` | Szczegoly watku i odpowiedz w watku. |
| `/platforma/zadania` | Zadania klienta powiazane z organizacja. |
| `/platforma/ustawienia` | Dane organizacji, profile klienta i edycja podstawowych danych dla owner/admin. |

## Auth

Kazda trasa portalu uzywa `resolvePlatformContext()`, ktory pobiera sesje i aktywna organizacje po stronie serwera. Brak sesji pokazuje ekran logowania. Brak organizacji pokazuje kontrolowany empty state.

`CLIENT` nie dostaje linkow do CRM. Role wewnetrzne moga wejsc w portal jako podglad pracownika i widza jawny banner "Podglad jako pracownik".

## Responsywnosc

Trasy portalu sa prywatne i zalezna od auth/bazy, wiec automatyczny smoke publiczny ich nie odpala domyslnie. Do lokalnej kontroli portalu uzyj:

```bash
RESPONSIVE_INCLUDE_PRIVATE=true AUTH_TRUST_HOST=true npm run responsive:check
```

Mozna tez uruchomic celowana kontrole:

```bash
RESPONSIVE_ROUTES=/platforma,/platforma/dokumenty npm run responsive:check
```
