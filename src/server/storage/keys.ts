import { z } from "zod";

export const storageNamespaceSchema = z.enum([
  "templates",
  "generated-documents",
  "client-uploads",
  "exports",
]);

export type StorageNamespace = z.infer<typeof storageNamespaceSchema>;

export function createStorageKey(namespace: StorageNamespace, parts: string[]) {
  const safeParts = parts.map((part) => part.replace(/[^a-zA-Z0-9._-]/g, "-"));

  return [namespace, ...safeParts].join("/");
}
