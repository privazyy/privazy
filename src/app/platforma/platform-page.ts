import { getPlatformContext } from "@/server/platform/permissions";

export type PlatformSearchParams = Promise<{ org?: string }>;

export async function resolvePlatformContext(searchParams: PlatformSearchParams) {
  const { org } = await searchParams;
  return getPlatformContext(org);
}
