const target = process.env.APP_ENV ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
const isRelease = ["production", "preview", "staging"].includes(target);
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
];
const placeholderPattern = /^(|replace_in_private_env|changeme|todo|example)$/i;
const secretNamePattern = /(DATABASE_URL|DIRECT_URL|PASSWORD|PRIVATE|SECRET|SERVICE_ROLE|TOKEN|WEBHOOK)/i;

const errors = [];
const warnings = [];

if (isRelease) {
  for (const key of requiredForRelease) {
    const value = process.env[key];
    if (!value || placeholderPattern.test(value.trim())) errors.push(`Missing required release env: ${key}`);
  }
}

for (const key of Object.keys(process.env)) {
  if (key.startsWith("NEXT_PUBLIC_") && secretNamePattern.test(key)) {
    errors.push(`Public env name looks secret-bearing: ${key}`);
  }
}

if ((process.env.PAYMENT_PROVIDER ?? "mock") === "mock" && isRelease) {
  warnings.push("PAYMENT_PROVIDER=mock is acceptable for staging only; production must confirm payment provider readiness.");
}

for (const warning of warnings) console.warn(`env warning: ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`env error: ${error}`);
  process.exit(1);
}

console.log(`Environment validation passed for ${target}.`);
