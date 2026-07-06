import { describe, expect, it } from "vitest";

import { createStorageKey } from "@/server/storage/keys";

describe("storage object keys", () => {
  it("keeps generated R2 keys namespaced and filesystem-safe", () => {
    expect(createStorageKey("generated-documents", ["org 1", "../document.pdf", "client@example.com"])).toBe(
      "generated-documents/org-1/..-document.pdf/client-example.com",
    );
  });
});
