# Breach incident module

Ten PR dodaje pierwszy merytoryczny modul RODO: rejestr naruszen ochrony danych osobowych.

Zakres:

- klient tworzy i wysyla zgloszenie naruszenia w `/platforma/naruszenia`,
- staff widzi rejestr w `/admin/breaches`,
- API portalu i CRM egzekwuja role server-side,
- liczony jest termin 72h od `discoveredAt`,
- timeline rozdziela wpisy publiczne i internal CRM notes,
- risk assessment zapisuje decyzje notyfikacyjna z rationale,
- AuditLog nie dostaje pelnego opisu naruszenia w metadata.

Poza zakresem:

- automatyczna opinia prawna,
- automatyczne wysylanie do PUODO,
- ePUAP/eDoreczenia,
- upload zalacznikow,
- produkcyjny deploy.

Production readiness: NO.
