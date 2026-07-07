const environment = process.argv[2] ?? "local";

const allowedEnvironments = new Set(["local", "staging", "production"]);

if (!allowedEnvironments.has(environment)) {
  console.error("Unknown env check mode. Use local, staging, or production.");
  process.exit(1);
}

const groups = {
  app: ["AUTH_SECRET", "DATABASE_URL"],
  stagingOrProduction: ["DIRECT_URL", "NEXTAUTH_URL", "INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"],
  production: ["RESEND_API_KEY", "RESEND_FROM"],
};

const optionalGroups = {
  r2: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_BUCKET"],
  turnstile: ["NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY", "CLOUDFLARE_TURNSTILE_SECRET_KEY"],
  payments: ["PAYMENT_PROVIDER", "PAYMENT_MODE"],
  invoice: ["INVOICE_PROVIDER", "INVOICE_MODE"],
  monitoring: ["SENTRY_DSN"],
};

const required = [...groups.app];

if (environment === "staging" || environment === "production") {
  required.push(...groups.stagingOrProduction);
}

if (environment === "production") {
  required.push(...groups.production);
}

const missing = required.filter((name) => !hasValue(name));
const statuses = Object.entries(optionalGroups).map(([name, vars]) => ({
  name,
  configured: vars.every(hasValue),
}));

console.log(`Environment check: ${environment}`);
console.log(`Required variables checked: ${required.length}`);

for (const status of statuses) {
  console.log(`${status.name}: ${status.configured ? "configured" : "not configured"}`);
}

if (environment !== "local" && isTruthy("ENABLE_DEV_MOCKS")) {
  console.error("ENABLE_DEV_MOCKS must not be enabled for staging or production.");
  process.exit(1);
}

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Environment check passed.");

function hasValue(name) {
  const value = process.env[name];

  return Boolean(value && value.trim().length > 0 && value !== "replace_in_private_env");
}

function isTruthy(name) {
  const value = process.env[name]?.toLowerCase();

  return value === "1" || value === "true" || value === "yes" || value === "on";
}
