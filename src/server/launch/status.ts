export type LaunchStatus = {
  appVersion: string;
  environment: string;
  maintenanceMode: boolean;
  publicStatus: "operational" | "maintenance" | "limited" | "blocked";
  criticalServices: {
    appUrlConfigured: boolean;
    databaseConfigured: boolean;
    authConfigured: boolean;
    storageConfigured: boolean;
    emailConfigured: boolean;
    checkoutEnabled: boolean;
    livePaymentsEnabled: boolean;
    invoicesEnabled: boolean;
    liveInvoicesEnabled: boolean;
    documentGenerationEnabled: boolean;
    clientPortalEnabled: boolean;
  };
  timestamp: string;
};

function isEnabled(value: string | undefined) {
  return value === "1" || value?.toLowerCase() === "true";
}

export function getLaunchStatus(): LaunchStatus {
  const maintenanceMode = isEnabled(process.env.MAINTENANCE_MODE);
  const livePaymentsEnabled = isEnabled(process.env.ENABLE_LIVE_PAYMENTS);
  const liveInvoicesEnabled = isEnabled(process.env.ENABLE_LIVE_INVOICES);
  const checkoutEnabled = isEnabled(process.env.ENABLE_CHECKOUT);
  const invoicesEnabled = isEnabled(process.env.ENABLE_INVOICES);

  return {
    appVersion:
      process.env.NEXT_PUBLIC_APP_VERSION ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
      "0.1.0",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    maintenanceMode,
    publicStatus: maintenanceMode
      ? "maintenance"
      : livePaymentsEnabled || liveInvoicesEnabled
        ? "limited"
        : "blocked",
    criticalServices: {
      appUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      authConfigured: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
      storageConfigured: Boolean(
        process.env.R2_BUCKET &&
          process.env.R2_ENDPOINT &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY,
      ),
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
      checkoutEnabled,
      livePaymentsEnabled,
      invoicesEnabled,
      liveInvoicesEnabled,
      documentGenerationEnabled: isEnabled(process.env.ENABLE_DOCUMENT_GENERATION),
      clientPortalEnabled: isEnabled(process.env.ENABLE_CLIENT_PORTAL),
    },
    timestamp: new Date().toISOString(),
  };
}
