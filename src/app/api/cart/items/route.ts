import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { addCartItem, CART_COOKIE_NAME } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const addCartItemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.number().int().min(1).max(10).optional(),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowy format danych." }, { status: 400 });
  }

  const parsed = addCartItemSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidlowe dane produktu.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const result = await addCartItem({
      productSlug: parsed.data.productSlug,
      quantity: parsed.data.quantity,
      sessionToken: cookieStore.get(CART_COOKIE_NAME)?.value,
    });
    const response = NextResponse.json(result.cart, { status: 201 });

    response.cookies.set(CART_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Cart add failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udalo sie dodac produktu do koszyka." },
      { status: 500 },
    );
  }
}
