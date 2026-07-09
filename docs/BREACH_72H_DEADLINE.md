# Breach 72h deadline

Helper:

- `calculateBreachAuthorityDeadline(discoveredAt)`
- `describeBreachDeadline(discoveredAt)`

Regula:

- deadline = `discoveredAt + 72h`.
- Daty sa przechowywane jako `DateTime` i prezentowane w UI przez `toLocaleString("pl-PL")`.
- UI pokazuje `remaining`, `deadlineAt` i `overdue`.
- Deadline nie uruchamia automatycznego wyslania do organu.

Zmiana `discoveredAt` przelicza `authorityNotificationDeadlineAt`.
