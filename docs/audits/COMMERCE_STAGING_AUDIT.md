# Commerce Staging Audit

| Area | Evidence | Status |
| --- | --- | --- |
| Products | Static product page and `src/lib/product.ts` | PARTIAL |
| Cart | Client-only cart count in product UI | PARTIAL/SCAFFOLD |
| Checkout sandbox | No checkout route/API | MISSING |
| Order | No Order model | MISSING |
| OrderItem | No OrderItem model | MISSING |
| Payment mock/sandbox | No Payment model/API | MISSING |
| Webhook idempotency | No payment webhook | MISSING |
| Order PAID flow | No order flow | MISSING |
| Invoice mock/foundation | No Invoice model/API | MISSING |
| No live payments | No live payments found | PARTIAL |
| No live invoices | No invoices found | PARTIAL |
| No client-controlled price/status | Cannot verify without API | MANUAL_REQUIRED |

Smoke scenario result:

1. Product page: code exists.
2. Add to cart: client-only count exists.
3. Checkout: MISSING.
4. Create order: MISSING.
5. Mock payment success: MISSING.
6. Order PAID: MISSING.
7. OrderItem READY_FOR_INPUT: MISSING.
8. CRM order view: MISSING.
9. Portal order view: MISSING.

Decision: `STAGING_NO_GO`.
