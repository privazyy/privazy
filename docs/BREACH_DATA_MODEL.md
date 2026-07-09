# Breach data model

## DataBreachIncident

Glowny rejestr incydentow. Zawiera organizacje, zglaszajacego, przypisanego staffa, status, severity, riskLevel, daty, opis, kategorie danych i osob, skutki, srodki, decyzje notyfikacyjne oraz pola risk assessment.

Wazne pola:

- `discoveredAt`
- `authorityNotificationDeadlineAt`
- `authorityNotificationRequired`
- `dataSubjectsNotificationRequired`
- `decisionRationale`
- `suggestedRiskLevel`

## DataBreachActivity

Timeline incydentu. Wpisy maja `visibility`:

- `PUBLIC`: widoczne dla klienta,
- `INTERNAL`: tylko CRM.

Metadata nie przechowuje pelnego opisu naruszenia.

## CrmTask

`CrmTask` dostal opcjonalne `breachIncidentId`, aby zadania CRM mogly byc powiazane z incydentem. Submit klienta tworzy zadanie triage z terminem rownym deadline 72h.

## Attachment

Zalaczniki nie zostaly dodane. Secure upload nie jest gotowy w `main`, wiec dokumentujemy placeholder zamiast budowac niesprawdzony upload.
