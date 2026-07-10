import { NextResponse } from "next/server";

import { getLaunchStatus } from "@/server/launch/status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const status = getLaunchStatus();

  return NextResponse.json({
    status: status.maintenanceMode ? "maintenance" : "ok",
    appVersion: status.appVersion,
    environment: status.environment,
    maintenanceMode: status.maintenanceMode,
    timestamp: status.timestamp,
  });
}
