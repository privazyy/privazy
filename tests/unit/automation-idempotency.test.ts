import { describe, expect, it } from "vitest";

import { buildIdempotencyKey, emailIdempotencyKey, reminderIdempotencyKey } from "@/server/automations/idempotency";
import { eventIdempotencyKey, isWorkflowEventType } from "@/server/events/event-types";

describe("automation idempotency", () => {
  it("builds stable keys without null segments", () => {
    expect(buildIdempotencyKey(["order", undefined, "123", null, "paid"])).toBe("order:123:paid");
    expect(emailIdempotencyKey({ recipient: "Client@Example.com", resourceId: "ord_1", template: "order.created" })).toBe(
      "email:order.created:ord_1:client@example.com",
    );
    expect(reminderIdempotencyKey({ resourceId: "breach_1", type: "breach", window: "24h" })).toBe("breach-reminder:breach_1:24h");
  });

  it("keeps event type validation and event idempotency strict", () => {
    expect(isWorkflowEventType("document.generate.succeeded.v1")).toBe(true);
    expect(isWorkflowEventType("document.generate.succeeded")).toBe(false);
    expect(eventIdempotencyKey({ eventType: "order.created.v1", resourceId: "ord_1", scope: "checkout" })).toBe(
      "order.created.v1:ord_1:checkout",
    );
  });
});
