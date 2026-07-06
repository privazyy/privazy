import "server-only";

export function buildIdempotencyKey(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part !== null && part !== undefined && String(part).length > 0).join(":");
}

export function emailIdempotencyKey(input: {
  recipient: string;
  resourceId: string;
  template: string;
}) {
  return buildIdempotencyKey(["email", input.template, input.resourceId, input.recipient.toLowerCase()]);
}

export function reminderIdempotencyKey(input: {
  resourceId: string;
  type: "breach" | "dsr" | "task";
  window: string;
}) {
  return buildIdempotencyKey([`${input.type}-reminder`, input.resourceId, input.window]);
}
