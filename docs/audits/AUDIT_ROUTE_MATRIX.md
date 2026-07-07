# Audit Route Matrix Delta

Date: 2026-07-07

| Route | Method | Auth | Role | Status |
| ----- | ------ | ---- | ---- | ------ |
| `/api/documents/generate` | POST | Required | `ADMIN`, `LAWYER`, `OPERATOR` | Public access closed; staff-only generation guarded. |
| `/documents` | GET | Public | None | Demo form no longer creates generation jobs. |

