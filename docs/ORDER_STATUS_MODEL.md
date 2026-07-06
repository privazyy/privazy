# ORDER_STATUS_MODEL

Status model dla Fazy 5R opisuje sandbox sklepu, platnosci i faktur. Nie jest to jeszcze produkcyjny model sprzedazy.

## OrderStatus

- `PENDING_PAYMENT` - Order utworzony po serwerowym przeliczeniu koszyka. Payment istnieje lub moze zostac odtworzony.
- `PAID` - Payment mock zostal potwierdzony, kwota i waluta pasuja do Order.
- `PAYMENT_FAILED` - Payment mock zakonczyl sie bledem. Order moze pozniej dostac nowa platnosc.
- `FULFILLING` - zarezerwowane pod Faze 6R, gdy generator dokumentow rozpocznie prace.
- `COMPLETED` - zarezerwowane pod wydanie dokumentow.
- `CANCELLED` - reczna/analityczna decyzja o anulowaniu.
- `REFUNDED` - zarezerwowane pod zwroty z Fazy 12R.

## OrderItemStatus

- `PENDING_PAYMENT` - pozycja czeka na oplacenie Order.
- `INPUT_REQUIRED` - po oplaceniu klient powinien uzupelnic formularz dokumentu.
- `IN_PROGRESS` - zarezerwowane pod generowanie lub review.
- `READY` - zarezerwowane pod gotowy dokument przed wydaniem.
- `FULFILLED` - zarezerwowane pod wydany dokument.
- `CANCELLED` - pozycja anulowana.
- `REFUNDED` - pozycja zwrocona.

## PaymentStatus

- `PENDING` - Payment utworzony przez mock provider.
- `PROCESSING` - zarezerwowane pod realnego providera sandbox/live.
- `PAID` - potwierdzone zdarzenie providerowe i zgodna kwota/waluta.
- `FAILED` - provider zwrocil blad platnosci.
- `CANCELLED` - zarezerwowane pod anulowanie.
- `REFUNDED` - zarezerwowane pod zwrot.

## PaymentEventStatus

- `RECEIVED` - event zapisany przed przetworzeniem.
- `PROCESSED` - event zmienil stan Payment/Order albo zostal poprawnie obsluzony.
- `FAILED` - event odrzucony, np. przez mismatch kwoty lub waluty.
- `IGNORED` - duplikat `providerEventId` albo event po juz oplaconym Order.

## InvoiceStatus

- `DRAFT` - zarezerwowane pod przyszly provider.
- `ISSUED` - mock invoice record zostal zapisany.
- `FAILED` - wystawienie faktury nie powiodlo sie.
- `CANCELLED` - faktura anulowana.

## Przejscia krytyczne

- Cart `ACTIVE` -> `CHECKED_OUT` tylko w checkout transaction.
- Order `PENDING_PAYMENT` -> `PAID` tylko po PaymentEvent z poprawna kwota i waluta.
- OrderItem `PENDING_PAYMENT` -> `INPUT_REQUIRED` tylko po Order `PAID`.
- PaymentEvent z tym samym `(provider, providerEventId)` nie moze zmienic stanu drugi raz.
- Publiczny status Order wymaga `orderNumber` i `publicAccessToken`.

## Poza zakresem 5R

- realne zwroty,
- korekty faktur,
- finalny fulfillment dokumentow,
- klientowski portal produkcyjny,
- generatory dokumentow.
