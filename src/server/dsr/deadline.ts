import "server-only";

export function calculateDsrDeadline(receivedAt: Date, extensionUntil?: Date | null) {
  const dueAt = new Date(receivedAt);
  dueAt.setMonth(dueAt.getMonth() + 1);

  if (extensionUntil && extensionUntil.getTime() > dueAt.getTime()) {
    return extensionUntil;
  }

  return dueAt;
}

export function daysUntil(value?: Date | null) {
  if (!value) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((value.getTime() - Date.now()) / msPerDay);
}

export function deadlineState(value?: Date | null) {
  const days = daysUntil(value);
  if (days === null) return "not_set";
  if (days < 0) return "overdue";
  if (days <= 7) return "due_soon";
  return "open";
}
