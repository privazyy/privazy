import "server-only";

import { getMissingEnv, hasEnv, isTruthyEnv, validateRuntimeEnv } from "@/server/env";

export interface RuntimeConfigStatus {
  environment: string;
  isAuthConfigured: boolean;
  isDatabaseConfigured: boolean;
  isEmailConfigured: boolean;
  isInngestConfigured: boolean;
  isInvoiceConfigured: boolean;
  isMonitoringConfigured: boolean;
  isPaymentConfigured: boolean;
  isR2Configured: boolean;
  isTurnstileConfigured: boolean;
  maintenanceMode: boolean;
  missingCriticalEnv: string[];
}

export function getRuntimeConfigStatus(): RuntimeConfigStatus {
  const validation = validateRuntimeEnv();

  return {
    environment: validation.environment,
    isAuthConfigured: hasEnv("AUTH_SECRET") || hasEnv("NEXTAUTH_SECRET"),
    isDatabaseConfigured: getMissingEnv(["DATABASE_URL"]).length === 0,
    isEmailConfigured: getMissingEnv(["RESEND_API_KEY", "RESEND_FROM"]).length === 0,
    isInngestConfigured: getMissingEnv(["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"]).length === 0,
    isInvoiceConfigured: hasEnv("INVOICE_PROVIDER") && hasEnv("INVOICE_MODE"),
    isMonitoringConfigured: hasEnv("SENTRY_DSN") || hasEnv("LOG_LEVEL"),
    isPaymentConfigured: hasEnv("PAYMENT_PROVIDER") && hasEnv("PAYMENT_MODE"),
    isR2Configured:
      getMissingEnv([
        "CLOUDFLARE_ACCOUNT_ID",
        "CLOUDFLARE_R2_ACCESS_KEY_ID",
        "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
        "CLOUDFLARE_R2_BUCKET",
      ]).length === 0 ||
      getMissingEnv(["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]).length === 0,
    isTurnstileConfigured:
      hasEnv("NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY") && hasEnv("CLOUDFLARE_TURNSTILE_SECRET_KEY"),
    maintenanceMode: isTruthyEnv("MAINTENANCE_MODE"),
    missingCriticalEnv: validation.missing,
  };
}
