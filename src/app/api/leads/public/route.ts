import { NextResponse } from "next/server";

import { createPublicLead, publicLeadPayloadSchema } from "@/server/leads/public";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy format danych." }, { status: 400 });
  }

  const parsed = publicLeadPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Uzupełnij wymagane dane formularza.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const lead = await createPublicLead(parsed.data, {
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Public lead create failed", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę." },
      { status: 500 },
    );
  }
}
