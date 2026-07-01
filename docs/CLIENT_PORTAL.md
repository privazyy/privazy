# Client Portal

Phase 8 dodaje realny portal klienta pod `/platforma`. Portal jest aplikacyjna warstwa dostepu do danych organizacji: dokumentow, zamowien, naruszen, zadan osob, wiadomosci, zadan CRM i ustawien organizacji.

## Moduly

- `/platforma` - dashboard organizacji, metryki, ostatnie dokumenty, pilne zadania i os zdarzen.
- `/platforma/dokumenty` - wydane dokumenty oraz formularze danych do pozycji zamowienia.
- `/platforma/dokumenty/[id]` - metryka dokumentu i historia pobran.
- `/platforma/dokumenty/[id]/formularz` - formularz danych do dokumentu, zapisywany jako `FormSubmission`.
- `/platforma/zamowienia` - zamowienia organizacji.
- `/platforma/naruszenia` - rejestr naruszen ochrony danych.
- `/platforma/zadania-osob` - rejestr zadan osob, ktorych dane dotycza.
- `/platforma/wiadomosci` - watki klienta z zespolem PRIVAZY.
- `/platforma/zadania` - zadania CRM widoczne dla organizacji.
- `/platforma/ustawienia` - dane organizacji i profile klienta.

## Dane

Portal opiera sie na modelach z faz 5-7 oraz nowych modelach Phase 8:

- `ClientProfile.role` - rola klienta w organizacji.
- `DocumentDownload` - rejestr pobran dokumentow z portalu.
- `ClientTimelineEvent` - os zdarzen klienta.
- `ClientMessageThread` i `ClientMessage` - watki i wiadomosci klienta.
- `FormSubmission.orderItemId` - powiazanie formularza dokumentu z pozycja zamowienia.

Wszystkie loadery portalu filtrujace rekordy uzywaja `organizationId` albo relacji prowadzacej do `Order.organizationId`.

## Bezpieczne pobieranie dokumentow

UI nie dostaje prywatnych kluczy R2 (`docxFileKey`, `pdfFileKey`, `zipFileKey`). Klient widzi tylko dostepne formaty i link do:

```txt
/api/platforma/dokumenty/[id]/download?format=docx|pdf|zip
```

Endpoint:

1. wymaga sesji uzytkownika,
2. pobiera dokument po `id`,
3. sprawdza dostep do `document.organizationId`,
4. zapisuje `DocumentDownload`,
5. zapisuje `AuditLog` i `ClientTimelineEvent`,
6. generuje krotko wazny signed URL R2,
7. przekierowuje uzytkownika na signed URL.

Brak konfiguracji R2 zwraca `503` bez ujawniania klucza pliku.

## Formularze i zdarzenia

Akcje serwerowe sa walidowane przez Zod. Udane akcje zapisuja audit log i os zdarzen klienta:

- formularz dokumentu - `client.document_form_submitted`,
- naruszenie - `client.breach_created`,
- zadanie osoby - `client.data_subject_request_created`,
- wiadomosc - `client.message_sent`,
- wykonanie zadania - `client.task_completed`,
- zmiana danych organizacji - `client.organization_updated`,
- pobranie dokumentu - `client.document_downloaded`.

## Poza zakresem Phase 8

- self-service zapraszanie nowych uzytkownikow klienta,
- upload zalacznikow do wiadomosci,
- automatyczna zmiana statusow prawnych po stronie klienta,
- produkcyjny deploy,
- seeding prawdziwych klientow albo danych wrazliwych.
