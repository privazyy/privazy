import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Use /api/documents/input/submit so organization, template and user ownership are derived server-side.",
    },
    { status: 410 },
  );
}
