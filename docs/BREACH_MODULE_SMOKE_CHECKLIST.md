# Breach module smoke checklist

Repo nie ma osobnego test runnera, wiec ten PR dodaje checklist manualny.

## Portal CLIENT

- CLIENT tworzy naruszenie bez podawania `organizationId`.
- CLIENT widzi naruszenie swojej organizacji.
- CLIENT nie widzi naruszenia cudzej organizacji.
- CLIENT nie widzi `INTERNAL` timeline notes.
- Submit ustawia `REPORTED` i tworzy zadanie triage.

## CRM

- READ_ONLY widzi liste i szczegoly.
- READ_ONLY nie moze zmienic statusu, risk assessment ani dodac notatki.
- OPERATOR moze ustawic `TRIAGE` i dodac note.
- LAWYER moze zapisac risk assessment i decyzje notyfikacyjna.
- CLIENT dostaje 403 z `/api/crm/breaches`.

## 72h i audit

- `authorityNotificationDeadlineAt = discoveredAt + 72h`.
- Overdue pokazuje sie po terminie.
- AuditLog powstaje dla create, submit, status, risk, decision, note.
- Audit metadata nie zawiera pelnego opisu naruszenia.

Production readiness: NO.
