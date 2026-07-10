# Breach and DSR Staging Audit

## Breach

| Check | Actual on `main` | Decision |
| --- | --- | --- |
| Client creates incident | Missing portal/API/model | MISSING |
| Deadline 72h calculated | Static/demo CRM rows only | MISSING |
| CRM sees incident | CRM demo/scaffold rows | PARTIAL/SCAFFOLD |
| Staff changes status | Missing API | MISSING |
| Risk assessment saved | Missing model/API | MISSING |
| Audit recorded | Missing real flow | MISSING |
| Client cannot see foreign incident | Cannot verify | MANUAL_REQUIRED |

## DSR

| Check | Actual on `main` | Decision |
| --- | --- | --- |
| Client creates request | Missing portal/API/model | MISSING |
| Deadline calculated | Missing | MISSING |
| CRM sees request | Missing | MISSING |
| Identity verification status | Missing | MISSING |
| Response preparation | Missing | MISSING |
| Audit recorded | Missing | MISSING |
| Client cannot see foreign request | Cannot verify | MANUAL_REQUIRED |

Decision: `STAGING_NO_GO`.
