import "server-only";

const HOUR_MS = 60 * 60 * 1000;
const BREACH_AUTHORITY_DEADLINE_HOURS = 72;

export function calculateBreachAuthorityDeadline(discoveredAt: Date) {
  return new Date(discoveredAt.getTime() + BREACH_AUTHORITY_DEADLINE_HOURS * HOUR_MS);
}

export function describeBreachDeadline(discoveredAt: Date, now = new Date()) {
  const deadlineAt = calculateBreachAuthorityDeadline(discoveredAt);
  const remainingMs = deadlineAt.getTime() - now.getTime();
  const remainingHours = Math.ceil(Math.abs(remainingMs) / HOUR_MS);

  return {
    deadlineAt,
    isOverdue: remainingMs < 0,
    remainingMs,
    label: remainingMs < 0 ? `po terminie ${remainingHours}h` : `${remainingHours}h do terminu`,
  };
}
