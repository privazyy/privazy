import "server-only";

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly missing: string[] = [],
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function getSafeConfigErrorMessage(error: unknown) {
  if (error instanceof ConfigurationError) {
    return {
      message: error.message,
      missing: error.missing,
    };
  }

  return {
    message: "Runtime configuration is incomplete.",
    missing: [] as string[],
  };
}

export function assertConfigured(names: readonly string[]) {
  const missing = names.filter((name) => {
    const value = process.env[name];

    return !value || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new ConfigurationError("Runtime configuration is incomplete.", missing);
  }
}
