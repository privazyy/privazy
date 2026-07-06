export type RuntimeEnvTarget = "development" | "preview" | "production" | "staging" | "test";

export type RuntimeEnvValidation = {
  errors: string[];
  ok: boolean;
  target: RuntimeEnvTarget;
  warnings: string[];
};

type EnvLike = Record<string, string | undefined>;

const requiredForRelease = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SITE_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_ENDPOINT",
] as const;

const secretNamePattern = /(DATABASE_URL|DIRECT_URL|PASSWORD|PRIVATE|SECRET|SERVICE_ROLE|TOKEN|WEBHOOK)/i;
const placeholderPattern = /^(|replace_in_private_env|changeme|todo|example)$/i;

export function resolveRuntimeEnvTarget(env: EnvLike = process.env): RuntimeEnvTarget {
  const value = env.APP_ENV ?? env.VERCEL_ENV ?? env.NODE_ENV ?? "development";
  if (value === "production" || value === "preview" || value === "staging" || value === "test") return value;
  return "development";
}

export function validateRuntimeEnv(
  env: EnvLike = process.env,
  target = resolveRuntimeEnvTarget(env),
): RuntimeEnvValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isRelease = target === "production" || target === "preview" || target === "staging";

  if (isRelease) {
    for (const key of requiredForRelease) {
      if (!isFilled(env[key])) errors.push(`Missing required release env: ${key}`);
    }
  }

  for (const key of Object.keys(env)) {
    if (key.startsWith("NEXT_PUBLIC_") && secretNamePattern.test(key)) {
      errors.push(`Public env name looks secret-bearing: ${key}`);
    }
  }

  if ((env.PAYMENT_PROVIDER ?? "mock") === "mock" && isRelease) {
    warnings.push("PAYMENT_PROVIDER=mock is acceptable for staging only; production must confirm payment provider readiness.");
  }

  if (!env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_APP_URL) {
    warnings.push("NEXT_PUBLIC_SITE_URL is preferred over NEXT_PUBLIC_APP_URL for canonical links.");
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY && isRelease) {
    warnings.push("Supabase service role key is absent; server-side admin paths must stay disabled or use Prisma-only access.");
  }

  return { errors, ok: errors.length === 0, target, warnings };
}

function isFilled(value: string | undefined) {
  return Boolean(value && !placeholderPattern.test(value.trim()));
}
