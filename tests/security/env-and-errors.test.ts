import { describe, expect, it } from "vitest";
import { z } from "zod";

import { redactSecretLikeValues, safeHttpError, statusForSafeError, toSafeErrorShape } from "@/server/api/errors";
import { getEnvValidationStatus, safeConfigError, validatePublicEnv, validateServerEnv } from "@/server/env";

describe("env validation and safe errors", () => {
  it("fails production validation without DATABASE_URL or AUTH_SECRET", () => {
    const result = validateServerEnv({ NODE_ENV: "production" });

    expect(result.success).toBe(false);
    expect(getEnvValidationStatus({ NODE_ENV: "production" }).missing).toEqual(expect.arrayContaining(["DATABASE_URL", "AUTH_SECRET"]));
  });

  it("reports env status with booleans and never secret values", () => {
    const status = getEnvValidationStatus({
      AUTH_SECRET: "test_secret_with_enough_length",
      DATABASE_URL: "postgresql://user:pass@example.supabase.co/postgres",
      DIRECT_URL: "postgresql://user:pass@example.supabase.co/postgres",
      NODE_ENV: "production",
    });

    expect(status.ok).toBe(true);
    expect(JSON.stringify(status)).not.toContain("user:pass");
    expect(status.private.hasDatabaseUrl).toBe(true);
  });

  it("keeps public env schema limited to public variables", () => {
    const result = validatePublicEnv({
      NEXT_PUBLIC_SITE_URL: "https://example.com",
      SUPABASE_SERVICE_ROLE_KEY: "secret",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data : {}).not.toHaveProperty("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("maps safe error shapes to expected HTTP statuses", () => {
    expect(statusForSafeError("unauthorized")).toBe(401);
    expect(statusForSafeError("forbidden")).toBe(403);
    expect(statusForSafeError("validation_error")).toBe(400);
    expect(statusForSafeError("internal_error")).toBe(500);
    const parsed = z.string().safeParse(1);

    expect(toSafeErrorShape(safeHttpError("forbidden", "Forbidden")).error.code).toBe("forbidden");
    expect(toSafeErrorShape(parsed.error).error.code).toBe("validation_error");
  });

  it("redacts secret-like values and exposes safe config errors", () => {
    expect(redactSecretLikeValues("postgresql://user:pass@example.supabase.co/db sk-test")).not.toContain("user:pass");
    expect(redactSecretLikeValues(new Error("gho_secret_token"))).toContain("[REDACTED]");
    expect(safeConfigError().message).not.toContain("DATABASE_URL");
  });
});
