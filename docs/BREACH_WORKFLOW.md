# Breach workflow

1. CLIENT tworzy szkic w `/platforma/naruszenia/nowe`.
2. System zapisuje deadline 72h od `discoveredAt`.
3. CLIENT wysyla zgloszenie.
4. System ustawia `REPORTED`, zapisuje publiczny timeline event i tworzy `CrmTask` triage.
5. OPERATOR przechodzi do `TRIAGE` albo `RISK_ASSESSMENT`.
6. LAWYER zapisuje risk assessment i decyzje:
   - `NOTIFICATION_REQUIRED`,
   - `NOTIFICATION_NOT_REQUIRED`.
7. Staff moze dodawac notatki publiczne albo internal.
8. Formalne zamkniecie zostaje w CRM.

System nie wysyla zgloszenia do PUODO automatycznie.
