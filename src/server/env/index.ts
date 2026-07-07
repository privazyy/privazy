import "server-only";

import { z } from "zod";

export type RuntimeEnvironment = "local" | "staging" | "production";

export const publicEnvNames = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY",
] as const;

export const serverEnvNames = [
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_PASSWORD",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "VERCEL_TOKEN",
  "GITHUB_TOKEN",
  "OPENAI_API_KEY",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "INNGEST_ENV",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "RESEND_DOMAIN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ZONE_ID",
  "CLOUDFLARE_PAGES_PROJECT_NAME",
  "CLOUDFLARE_KV_NAMESPACE_ID",
  "CLOUDFLARE_TURNSTILE_SECRET_KEY",
  "CLOUDFLARE_R2_BUCKET",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_ENDPOINT",
  "R2_PUBLIC_URL",
  "ENABLE_CHECKOUT",
  "ENABLE_LIVE_PAYMENTS",
  "ENABLE_DOCUMENT_GENERATION",
  "ENABLE_CLIENT_PORTAL",
  "ENABLE_CMS_PUBLICATION",
  "ENABLE_NEWSLETTER_SIGNUP",
  "ENABLE_AUTOMATIONS",
  "ENABLE_DEV_MOCKS",
  "MAINTENANCE_MODE",
  "PAYMENT_PROVIDER",
  "PAYMENT_MODE",
  "PAYMENT_WEBHOOK_SECRET",
  "INVOICE_PROVIDER",
  "INVOICE_MODE",
  "SENTRY_DSN",
  "LOG_LEVEL",
] as const;

export const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export function getRuntimeEnvironment(): RuntimeEnvironment {
  const explicit = process.env.APP_ENV ?? process.env.VERCEL_ENV;

  if (explicit === "production") return "production";
  if (explicit === "preview" || explicit === "staging") return "staging";

  return "local";
}

export function getEnvValue(name: string) {
  const value = process.env[name];

  return value && value.trim().length > 0 ? value : undefined;
}

export function hasEnv(name: string) {
  return Boolean(getEnvValue(name));
}

export function getMissingEnv(names: readonly string[]) {
  return names.filter((name) => !hasEnv(name));
}

export function isTruthyEnv(name: string) {
  const value = getEnvValue(name)?.toLowerCase();

  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function getCriticalEnvFor(environment: RuntimeEnvironment) {
  const common = ["AUTH_SECRET", "DATABASE_URL"] as const;

  if (environment === "local") {
    return common;
  }

  return [
    ...common,
    "DIRECT_URL",
    "NEXTAUTH_URL",
    "INNGEST_EVENT_KEY",
    "INNGEST_SIGNING_KEY",
  ] as const;
}

export function validateRuntimeEnv(environment = getRuntimeEnvironment()) {
  const base = runtimeEnvSchema.safeParse({ NODE_ENV: process.env.NODE_ENV });
  const missing = getMissingEnv(getCriticalEnvFor(environment));
  const devMocksEnabled = isTruthyEnv("ENABLE_DEV_MOCKS");

  return {
    environment,
    isValid: base.success && missing.length === 0,
    missing,
    nodeEnv: base.success ? base.data.NODE_ENV : "development",
    devMocksEnabled,
  };
}
