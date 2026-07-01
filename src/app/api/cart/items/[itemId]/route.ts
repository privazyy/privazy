import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { CART_COOKIE_NAME, removeCartItem, updateCartItem } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(10),
});

export async function PATCH(request: Request, context: { params: Promise<{ itemId: string }> }) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowy format danych." }, { status: 400 });
  }

  const parsed = updateCartItemSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidlowa liczba sztuk.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const { itemId } = await context.params;
    const cart = await updateCartItem({
      itemId,
      quantity: parsed.data.quantity,
      sessionToken: cookieStore.get(CART_COOKIE_NAME)?.value,
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart update failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udalo sie zaktualizowac koszyka." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const cookieStore = await cookies();
    const { itemId } = await context.params;
    const cart = await removeCartItem({
      itemId,
      sessionToken: cookieStore.get(CART_COOKIE_NAME)?.value,
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart remove failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udalo sie usunac pozycji z koszyka." },
      { status: 500 },
    );
  }
}
