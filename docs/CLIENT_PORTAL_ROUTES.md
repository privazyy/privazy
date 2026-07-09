# Client Portal Routes

Protected pages:
- `/platforma`
- `/platforma/zamowienia`
- `/platforma/zamowienia/[orderId]`
- `/platforma/dokumenty`
- `/platforma/dokumenty/[documentInputId]`
- `/platforma/pliki`
- `/platforma/organizacja`
- `/platforma/ustawienia`

Compatibility:
- `/client` redirects to `/platforma`.

Auth behavior:
- unauthenticated users redirect to `/login`,
- non-CLIENT users redirect to `/admin`,
- portal pages re-check server-side access through portal services.
