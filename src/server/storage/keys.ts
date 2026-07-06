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

export function safeStorageFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return normalized || "document";
}

export function createGeneratedDocumentStorageKey(input: {
  organizationId: string;
  orderId: string;
  orderItemId: string;
  generatedDocumentId: string;
  fileType: string;
  fileName: string;
}) {
  return [
    "organizations",
    safeStorageFileName(input.organizationId),
    "orders",
    safeStorageFileName(input.orderId),
    "order-items",
    safeStorageFileName(input.orderItemId),
    "documents",
    safeStorageFileName(input.generatedDocumentId),
    safeStorageFileName(input.fileType),
    safeStorageFileName(input.fileName),
  ].join("/");
}
