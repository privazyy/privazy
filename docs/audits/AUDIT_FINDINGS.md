# Audit Findings — Commerce Remediation

| ID | Status po PR | Uzasadnienie |
| --- | --- | --- |
| P1-002 checkout/payments missing | PARTIAL | Dodano działający fundament sandbox/mock i usunięto claims realnej płatności. Brak live provider i produkcyjnego sklepu. |
| P1-003 invoicing | PARTIAL | Dodano model, role-scoped API, provider MOCK, idempotentny workflow i go-live checklist. Nadal brak live providera, PDF, korekt i approval księgowego. |
| P1-004 automated tests | OPEN | Brak runnera; dodano smoke checklist. |
| P1-005 paid-order generation gate | PARTIAL | Template-linked `OrderItem` dostaje `READY_FOR_INPUT` po sukcesie, ale nie uruchamia generatora. Istniejący endpoint generatora jest ograniczony do jawnego staff override i bierze user ID z sesji; customer input flow nadal nie istnieje. |
| P1-010 Supabase/RLS | PARTIAL | Nowe tabele mają RLS/revoke, lecz pełny audyt całej bazy nadal jest otwarty. |

Staging: **NO**. Production: **NO**.
