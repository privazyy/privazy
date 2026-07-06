import { describe, expect, it } from "vitest";

import { sanitizeEventPayload } from "@/server/events/event-log";

describe("event payload sanitization", () => {
  it("keeps workflow IDs and strips direct PII", () => {
    expect(
      sanitizeEventPayload({
        actorId: "user_1",
        email: "client@example.com",
        fullName: "Client Name",
        orderId: "ord_1",
        paymentId: "pay_1",
        rawBody: "secret webhook payload",
        source: "checkout",
      }),
    ).toEqual({
      actorId: "user_1",
      orderId: "ord_1",
      paymentId: "pay_1",
      source: "checkout",
    });
  });
});
