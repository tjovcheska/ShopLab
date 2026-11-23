"use server";
// Minimal "add to cart" used by product cards and the product page.
// The full cart (view, change quantities, remove) arrives in Phase 5.
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type AddToCartResult =
  | { ok: true; message: string }
  | { ok: false; reason: "login-required" | "error"; message: string };

const inputSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export async function addToCart(
  productId: number,
  quantity: number,
): Promise<AddToCartResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      reason: "login-required",
      message: "Please log in to add items to your cart.",
    };
  }

  const parsed = inputSchema.safeParse({ productId, quantity });
  if (!parsed.success) {
    return {
      ok: false,
      reason: "error",
      message: parsed.error.issues[0].message,
    };
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { ok: false, reason: "error", message: "Product not found." };
  }
  if (product.stock === 0) {
    return {
      ok: false,
      reason: "error",
      message: "This product is out of stock.",
    };
  }

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  const inCart = existing?.quantity ?? 0;
  if (inCart + quantity > product.stock) {
    const available = product.stock - inCart;
    return {
      ok: false,
      reason: "error",
      message:
        available > 0
          ? `Only ${available} more can be added (${product.stock} in stock, ${inCart} already in your cart).`
          : `You already have all ${product.stock} in your cart.`,
    };
  }

  await db.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  return {
    ok: true,
    // Shown as the toast's description under the title "Added to cart".
    message: `${quantity} × ${product.name}`,
  };
}

export type CartChangeResult = { ok: true } | { ok: false; message: string };

/** Sets a cart line's quantity (1 to the product's stock). */
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<CartChangeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in." };

  const item = await db.cartItem.findFirst({
    where: { id: cartItemId, userId: user.id },
    include: { product: true },
  });
  if (!item)
    return { ok: false, message: "This item is no longer in your cart." };
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, message: "Quantity must be at least 1." };
  }
  if (quantity > item.product.stock) {
    return {
      ok: false,
      message: `Only ${item.product.stock} of ${item.product.name} in stock.`,
    };
  }

  await db.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return { ok: true };
}

export async function removeCartItem(
  cartItemId: number,
): Promise<CartChangeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in." };
  // deleteMany so a missing or someone else's item is simply a no-op.
  await db.cartItem.deleteMany({ where: { id: cartItemId, userId: user.id } });
  return { ok: true };
}
