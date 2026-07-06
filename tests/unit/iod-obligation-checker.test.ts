import { describe, expect, it } from "vitest";

import { evaluateIodObligation, iodObligationTestCases } from "@/lib/iod-obligation-checker";

describe("IOD obligation checker regression cases", () => {
  for (const testCase of iodObligationTestCases) {
    it(testCase.name, () => {
      const result = evaluateIodObligation(testCase.input);

      expect(result.obligation_status).toBe(testCase.expected.obligation_status);
      expect(result.primary_trigger).toBe(testCase.expected.primary_trigger);
      expect(result.validation_errors).toEqual([]);
    });
  }
});
