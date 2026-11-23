// A user's wishlist: products in the order the user arranged them.
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";

export function listWishlist(userId: number) {
  return db.wishlistItem.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          stock: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function isInWishlist(userId: number, productId: number) {
  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return item !== null;
}

/** Adds the product at the end. Already in the wishlist: nothing changes. */
export async function addToWishlist(userId: number, productId: number) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new ShopError(404, "NOT_FOUND", "Product not found.");
  if (await isInWishlist(userId, productId)) return product;
  const last = await db.wishlistItem.findFirst({
    where: { userId },
    orderBy: { position: "desc" },
  });
  await db.wishlistItem.create({
    data: { userId, productId, position: (last?.position ?? -1) + 1 },
  });
  return product;
}

export async function removeFromWishlist(userId: number, itemId: number) {
  const { count } = await db.wishlistItem.deleteMany({
    where: { id: itemId, userId },
  });
  if (count === 0) {
    throw new ShopError(
      404,
      "NOT_FOUND",
      "This item is no longer in your wishlist.",
    );
  }
}

/** Saves a new order. `itemIds` must be exactly the user's wishlist items. */
export async function reorderWishlist(userId: number, itemIds: number[]) {
  const current = await db.wishlistItem.findMany({ where: { userId } });
  const known = new Set(current.map((item) => item.id));
  if (
    itemIds.length !== current.length ||
    new Set(itemIds).size !== itemIds.length ||
    itemIds.some((id) => !known.has(id))
  ) {
    throw new ShopError(
      409,
      "CONFLICT",
      "Your wishlist changed in the meantime. Reload the page and try again.",
    );
  }
  await db.$transaction(
    itemIds.map((id, position) =>
      db.wishlistItem.update({ where: { id }, data: { position } }),
    ),
  );
}
