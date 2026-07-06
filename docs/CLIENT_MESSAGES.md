# Client Messages

Wiadomosci klienta sa obslugiwane przez `/platforma/wiadomosci` oraz `/platforma/wiadomosci/[id]`.

## Modele

- `ClientMessageThread` przechowuje temat, status, organizacje i opcjonalne powiazanie z encja operacyjna.
- `ClientMessage` przechowuje tresc wiadomosci, autora, typ nadawcy i organizacje.

Wiadomosci sa odseparowane od wewnetrznych notatek CRM. Portal pokazuje tylko watki i wiadomosci zapisane w modelach klienta. Notatki CRM oraz komentarze internal-only nie sa renderowane w portalu.

## Akcje

`createClientMessageAction`:

1. wymaga zalogowanego aktora platformy,
2. waliduje dane przez Zod,
3. sprawdza dostep do `organizationId`,
4. tworzy nowy watek albo dopisuje odpowiedz do istniejacego watku tej samej organizacji,
5. zapisuje `AuditLog`,
6. zapisuje `ClientTimelineEvent` typu `MESSAGE_SENT`,
7. probuje wyslac potwierdzenie przez warstwe mailowa, ale brak env nie powinien blokowac calego produktu.

## Widocznosc

Klient widzi tylko watki swojej organizacji. Wewnetrzne role PRIVAZY moga wejsc w podglad portalu, ale widza banner podgladu pracownika i nie zyskuja przez to nowej sciezki CRM dla klienta.

## Zalaczniki

Modele maja miejsce na przyszle powiazania, ale upload zalacznikow nie jest czescia tej fazy. Nie nalezy dodawac publicznych linkow do plikow ani zalacznikow mailowych bez osobnego ACL i skanowania plikow.

## Poza zakresem

- live chat,
- automatyczne SLA,
- upload zalacznikow,
- masowe automatyzacje,
- wysylka dokumentow jako zalaczniki email.
