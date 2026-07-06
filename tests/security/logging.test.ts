import { describe, expect, it } from "vitest";

import { redactLogValue, redactSensitiveValue, safeErrorMessage } from "@/server/observability/logging";

describe("safe logging", () => {
  it("redacts common secrets and identifiers", () => {
    const redacted = redactSensitiveValue("Bearer abcdefghijklmnopqrstuvwxyz123456 and client@example.com postgres://u:p@host/db");

    expect(redacted).not.toContain("client@example.com");
    expect(redacted).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
    expect(redacted).not.toContain("u:p@host");
  });

  it("redacts nested sensitive keys", () => {
    expect(
      redactLogValue({
        nested: { note: "hello client@example.com" },
        token: "secret-token",
      }),
    ).toEqual({
      nested: { note: "hello [redacted-email]" },
      token: "[redacted]",
    });
  });

  it("hides error details outside development", () => {
    expect(safeErrorMessage(new Error("Token abcdefghijklmnopqrstuvwxyz123456"), "Unexpected application error", "production")).toBe(
      "Unexpected application error",
    );
  });
});
