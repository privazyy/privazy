import { NextResponse } from "next/server";
import { z } from "zod";

import { safeCommerceError } from "@/server/commerce/errors";
import { requireInvoiceActor } from "@/server/invoices/actor";
import {
  getInvoiceForOrder,
  serializeInvoiceForClient,
} from "@/server/invoices/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const orderIdSchema = z.string().trim().min(1).max(160);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const actor = await requireInvoiceActor();
    const parsedOrderId = orderIdSchema.safeParse((await params).orderId);
    if (!parsedOrderId.success) {
      return NextResponse.json(
        { code: "invalid_input", error: "Nieprawidłowe ID zamówienia." },
        { status: 400 },
      );
    }

    const invoice = await getInvoiceForOrder(parsedOrderId.data, actor);
    if (!invoice) {
      return NextResponse.json({ invoice: null });
    }

    return NextResponse.json({
      invoice: serializeInvoiceForClient(invoice),
    });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
