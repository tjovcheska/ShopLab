"use server";
// Cart Server Actions for the product pages and /cart. The rules live in
// src/lib/services/cart.ts, shared with the REST API.
import { getCurrentUser } from "@/lib/auth";
import { ShopError } from "@/lib/errors";
import {
  addCartItem,
  removeCartItem as removeItem,
  updateCartItem,
} from "@/lib/services/cart";

export type AddToCartResult =
  | { ok: true; message: string }
  | { ok: false; reason: "login-required" | "error"; message: string };

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
  try {
    const { product } = await addCartItem(user.id, productId, quantity);
    // Shown as the toast's description under the title "Added to cart".
    return { ok: true, message: `${quantity} × ${product.name}` };
  } catch (error) {
    if (error instanceof ShopError) {
      return { ok: false, reason: "error", message: error.message };
    }
    throw error;
  }
}

export type CartChangeResult = { ok: true } | { ok: false; message: string };

/** Sets a cart line's quantity (1 to the product's stock). */
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<CartChangeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in." };
  try {
    await updateCartItem(user.id, cartItemId, quantity);
    return { ok: true };
  } catch (error) {
    if (error instanceof ShopError)
      return { ok: false, message: error.message };
    throw error;
  }
}

export async function removeCartItem(
  cartItemId: number,
): Promise<CartChangeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in." };
  try {
    await removeItem(user.id, cartItemId);
  } catch (error) {
    // Already gone (e.g. removed in another tab): nothing to do.
    if (!(error instanceof ShopError)) throw error;
  }
  return { ok: true };
}
