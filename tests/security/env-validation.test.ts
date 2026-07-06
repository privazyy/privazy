import { describe, expect, it } from "vitest";

import { validateRuntimeEnv } from "@/server/env/runtime";

describe("runtime env validation", () => {
  it("does not fail local development placeholders", () => {
    expect(validateRuntimeEnv({ NODE_ENV: "development" }, "development")).toMatchObject({ ok: true });
  });

  it("fails release targets without required runtime secrets", () => {
    const result = validateRuntimeEnv({ APP_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://privazy.pl" }, "production");

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Missing required release env: DATABASE_URL");
    expect(result.errors).toContain("Missing required release env: AUTH_SECRET");
  });

  it("blocks public env names that look like secrets", () => {
    const result = validateRuntimeEnv({ NEXT_PUBLIC_SERVICE_ROLE_KEY: "abc" }, "development");

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Public env name looks secret-bearing: NEXT_PUBLIC_SERVICE_ROLE_KEY");
  });
});
