import { NextResponse } from "next/server";
import { z } from "zod";

import { safeCommerceError } from "@/server/commerce/errors";
import { requireInvoiceActor } from "@/server/invoices/actor";
import {
  getInvoiceById,
  serializeInvoiceForClient,
} from "@/server/invoices/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const invoiceIdSchema = z.string().trim().min(1).max(160);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const actor = await requireInvoiceActor();
    const parsedInvoiceId = invoiceIdSchema.safeParse((await params).invoiceId);
    if (!parsedInvoiceId.success) {
      return NextResponse.json(
        { code: "invalid_input", error: "Nieprawidłowe ID faktury." },
        { status: 400 },
      );
    }

    const invoice = await getInvoiceById(parsedInvoiceId.data, actor);
    if (!invoice) {
      return NextResponse.json(
        { code: "not_found", error: "Faktura nie istnieje." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      invoice: serializeInvoiceForClient(invoice),
    });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
