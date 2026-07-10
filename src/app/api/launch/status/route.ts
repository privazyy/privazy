import { NextResponse } from "next/server";

import { getLaunchStatus } from "@/server/launch/status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getLaunchStatus());
}
