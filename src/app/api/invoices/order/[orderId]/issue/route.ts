import { NextResponse } from "next/server";
import { z } from "zod";

import { safeCommerceError } from "@/server/commerce/errors";
import { enforceCommerceRateLimit } from "@/server/commerce/rate-limit";
import { requireInvoiceActor } from "@/server/invoices/actor";
import {
  createMockInvoiceForPaidOrder,
  serializeInvoiceForClient,
} from "@/server/invoices/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const orderIdSchema = z.string().trim().min(1).max(160);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    enforceCommerceRateLimit(request, "invoice-issue", { limit: 10 });
    const actor = await requireInvoiceActor();
    const parsedOrderId = orderIdSchema.safeParse((await params).orderId);
    if (!parsedOrderId.success) {
      return NextResponse.json(
        { code: "invalid_input", error: "Nieprawidłowe ID zamówienia." },
        { status: 400 },
      );
    }

    const result = await createMockInvoiceForPaidOrder(
      parsedOrderId.data,
      actor,
    );
    return NextResponse.json(
      {
        created: result.created,
        invoice: serializeInvoiceForClient(result.invoice),
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
