"use server";
// Wishlist Server Actions (product page button and /account/wishlist).
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { ShopError } from "@/lib/errors";
import {
  addToWishlist,
  removeFromWishlist,
  reorderWishlist,
} from "@/lib/services/wishlist";

export type WishlistResult =
  | { ok: true; message: string }
  | { ok: false; reason: "login-required" | "error"; message: string };

async function run(
  action: (userId: number) => Promise<string>,
): Promise<WishlistResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      reason: "login-required",
      message: "Please log in to use your wishlist.",
    };
  }
  try {
    const message = await action(user.id);
    revalidatePath("/account/wishlist");
    return { ok: true, message };
  } catch (error) {
    if (error instanceof ShopError) {
      return { ok: false, reason: "error", message: error.message };
    }
    throw error;
  }
}

export async function addToWishlistAction(productId: number) {
  return run(async (userId) => {
    const product = await addToWishlist(userId, productId);
    return `${product.name} is in your wishlist.`;
  });
}

export async function removeFromWishlistAction(itemId: number) {
  return run(async (userId) => {
    await removeFromWishlist(userId, itemId);
    return "Removed from your wishlist.";
  });
}

export async function reorderWishlistAction(itemIds: number[]) {
  return run(async (userId) => {
    await reorderWishlist(userId, itemIds);
    return "Wishlist order saved.";
  });
}
