import "server-only";

type CouponLike = {
  amountOffCents: number | null;
  currency: string;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  percentOffBps: number | null;
  redeemedCount: number;
  startsAt: Date | null;
  status: string;
} | null;

type GrossLine = {
  currency?: string;
  totalGrossCents: number;
};

export function calculateCouponDiscount(coupon: CouponLike, lines: GrossLine[]) {
  if (!coupon) return 0;
  if (!isCouponUsable(coupon, lines)) return 0;

  const gross = lines.reduce((sum, line) => sum + line.totalGrossCents, 0);
  if (coupon.amountOffCents) return Math.min(coupon.amountOffCents, gross);
  if (coupon.percentOffBps) return Math.min(Math.round((gross * coupon.percentOffBps) / 10_000), gross);
  return 0;
}

export function isCouponUsable(coupon: CouponLike, lines: GrossLine[]) {
  if (!coupon || coupon.status !== "ACTIVE") return false;

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return false;
  if (coupon.expiresAt && coupon.expiresAt <= now) return false;
  if (coupon.maxRedemptions !== null && coupon.redeemedCount >= coupon.maxRedemptions) return false;
  if (lines.some((line) => line.currency && line.currency !== coupon.currency)) return false;

  return Boolean(coupon.amountOffCents || coupon.percentOffBps);
}
