# Breach permissions

## Portal CLIENT

- CLIENT moze tworzyc naruszenie tylko dla organizacji wynikajacej z `ClientProfile`.
- API nie przyjmuje `organizationId` od klienta.
- CLIENT moze czytac tylko incydenty swoich organizacji.
- CLIENT moze edytowac `DRAFT` i `REPORTED`.
- CLIENT nie widzi `INTERNAL` timeline notes.

## CRM staff

- READ_ONLY: moze czytac liste, szczegoly i timeline, nie moze mutowac.
- OPERATOR: moze triage, zmieniac statusy operacyjne i dodawac notatki.
- LAWYER: moze wykonac risk assessment, zapisac decyzje notyfikacyjna i zamknac formalne statusy.
- ADMIN: pelny dostep.

Kazda mutacja przechodzi przez server-side role checks w `src/server/breach/breach-permissions.ts`.
