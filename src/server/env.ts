import { z } from "zod";

import { safeHttpError } from "@/server/api/errors";

type EnvInput = Record<string, string | undefined>;

const privateEnvSchema = z.object({
  AUTH_SECRET: z.string().min(16),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY: z.string().optional(),
});

export type EnvValidationStatus = {
  ok: boolean;
  environment: "development" | "test" | "production";
  missing: string[];
  public: {
    hasSiteUrl: boolean;
    hasSupabaseUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasTurnstileSiteKey: boolean;
  };
  private: {
    hasAuthSecret: boolean;
    hasDatabaseUrl: boolean;
    hasDirectUrl: boolean;
    hasNextAuthUrl: boolean;
  };
};

export function validateServerEnv(env: EnvInput = process.env) {
  return privateEnvSchema.safeParse(env);
}

export function validatePublicEnv(env: EnvInput = process.env) {
  return publicEnvSchema.safeParse(env);
}

export function getEnvValidationStatus(env: EnvInput = process.env): EnvValidationStatus {
  const environment = env.NODE_ENV === "production" || env.NODE_ENV === "test" ? env.NODE_ENV : "development";
  const privateResult = validateServerEnv({ ...env, NODE_ENV: environment });

  return {
    environment,
    missing: privateResult.success
      ? []
      : privateResult.error.issues.map((issue) => String(issue.path[0])).filter((value, index, list) => list.indexOf(value) === index),
    ok: privateResult.success,
    private: {
      hasAuthSecret: Boolean(env.AUTH_SECRET),
      hasDatabaseUrl: Boolean(env.DATABASE_URL),
      hasDirectUrl: Boolean(env.DIRECT_URL),
      hasNextAuthUrl: Boolean(env.NEXTAUTH_URL),
    },
    public: {
      hasSiteUrl: Boolean(env.NEXT_PUBLIC_SITE_URL),
      hasSupabaseAnonKey: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasSupabaseUrl: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
      hasTurnstileSiteKey: Boolean(env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY),
    },
  };
}

export function safeConfigError() {
  return safeHttpError("configuration_error", "Server configuration is incomplete.");
}
