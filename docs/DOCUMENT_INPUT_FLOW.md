# Document Input Flow

This PR adds a protected client flow for document data after a paid document order item.

Flow:
1. Staff or checkout creates `Order` and document `OrderItem`.
2. `Order.paymentStatus` must be `PAID`.
3. Client opens `/platforma/dokumenty`.
4. Server lists only order items from organizations linked through `ClientProfile`.
5. Client creates or opens `DocumentInput`.
6. Client saves partial draft.
7. Client submits final data with accuracy and disclaimer confirmations.
8. Server validates with Zod, locks the input, updates `OrderItem.fulfillmentStatus`, and creates `DocumentGenerationJob`.
9. CRM sees input status, validation summary, related OrderItem, and job count.

This is not a full client portal, not live payments, and not a production-ready document generator.
