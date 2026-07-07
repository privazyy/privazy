import "server-only";

export type PrivateConfigurationStatus = {
  missing: string[];
  ok: boolean;
};

export function getPrivateDatabaseConfigurationStatus(): PrivateConfigurationStatus {
  const missing = ["DATABASE_URL"].filter((name) => !process.env[name]);

  return {
    missing,
    ok: missing.length === 0,
  };
}
