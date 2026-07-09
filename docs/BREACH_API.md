# Breach API

## Portal

- `GET /api/portal/breaches`
- `POST /api/portal/breaches`
- `GET /api/portal/breaches/[incidentId]`
- `PATCH /api/portal/breaches/[incidentId]/draft`
- `POST /api/portal/breaches/[incidentId]/submit`

Wymagania:

- auth required,
- tylko rola CLIENT,
- organizacja wyliczana z `ClientProfile`,
- brak arbitralnego `organizationId`,
- safe errors.

## CRM

- `GET /api/crm/breaches`
- `GET /api/crm/breaches/[incidentId]`
- `PATCH /api/crm/breaches/[incidentId]`
- `PATCH /api/crm/breaches/[incidentId]/status`
- `POST /api/crm/breaches/[incidentId]/risk-assessment`
- `POST /api/crm/breaches/[incidentId]/notes`
- `GET /api/crm/breaches/[incidentId]/timeline`

READ_ONLY moze czytac. Mutacje wymagaja OPERATOR, LAWYER albo ADMIN zgodnie z polityka.
