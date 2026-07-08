# Invoice Status Model

| Status | Znaczenie w foundation |
| --- | --- |
| `DRAFT` | Szkic wewnętrzny; nie jest wystawiony. |
| `REQUESTED` | Serwer zapisał bezpieczny snapshot i oczekuje na provider. |
| `ISSUED` | Provider MOCK zakończył symulację. To nie jest dokument księgowy. |
| `FAILED` | Symulacja providera nie została zakończona. |
| `CANCELLED` | Rekord anulowany; nie może być ponownie wystawiony. |
| `CORRECTED` | Rezerwacja pod przyszły workflow korekt. |

Aktywna ścieżka tego PR używa `REQUESTED -> ISSUED`. Klient nie przesyła
statusu. Status zmienia wyłącznie server-side provider.
