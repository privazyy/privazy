import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { inngest } from "@/server/inngest/client";
import { requestDocumentGeneration } from "@/server/documents/service";
import { documentGenerateApiSchema } from "@/server/documents/schemas";

const generationRoles = new Set(["ADMIN", "LAWYER", "OPERATOR"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  }
  if (!session.user.role || !generationRoles.has(session.user.role)) {
    return NextResponse.json({ error: "Brak uprawnień do generowania dokumentów." }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy format danych." }, { status: 400 });
  }

  const parsed = documentGenerateApiSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid document generation payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const job = await requestDocumentGeneration({
    ...parsed.data,
    createdById: session.user.id,
  });

  await inngest.send({
    name: "document/generate.requested",
    data: {
      jobId: job.id,
      organizationId: job.organizationId,
      templateId: job.templateId,
    },
    id: parsed.data.idempotencyKey,
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
