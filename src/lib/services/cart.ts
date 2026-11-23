// Changing a user's cart. Used by the web pages (src/lib/cart-actions.ts)
// and the REST API. Reading the cart: src/lib/cart.ts.
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";

const notInCart = () =>
  new ShopError(404, "NOT_FOUND", "This item is no longer in your cart.");

/**
 * Adds `quantity` of a product (or increases an existing line).
 * Throws 404 if the product does not exist, 409 if there is not enough stock.
 */
export async function addCartItem(
  userId: number,
  productId: number,
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ShopError(
      400,
      "VALIDATION_ERROR",
      "Quantity must be at least 1.",
      {
        fields: { quantity: "Quantity must be at least 1." },
      },
    );
  }
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new ShopError(404, "NOT_FOUND", "Product not found.");
  if (product.stock === 0) {
    throw new ShopError(
      409,
      "INSUFFICIENT_STOCK",
      "This product is out of stock.",
    );
  }

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  const inCart = existing?.quantity ?? 0;
  if (inCart + quantity > product.stock) {
    const available = product.stock - inCart;
    throw new ShopError(
      409,
      "INSUFFICIENT_STOCK",
      available > 0
        ? `Only ${available} more can be added (${product.stock} in stock, ${inCart} already in your cart).`
        : `You already have all ${product.stock} in your cart.`,
    );
  }

  const item = await db.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  return { item, product, created: existing === null };
}

/** Sets a line's quantity (1 to the product's stock). */
export async function updateCartItem(
  userId: number,
  cartItemId: number,
  quantity: number,
) {
  const item = await db.cartItem.findFirst({
    where: { id: cartItemId, userId },
    include: { product: true },
  });
  if (!item) throw notInCart();
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ShopError(
      400,
      "VALIDATION_ERROR",
      "Quantity must be at least 1.",
      {
        fields: { quantity: "Quantity must be at least 1." },
      },
    );
  }
  if (quantity > item.product.stock) {
    throw new ShopError(
      409,
      "INSUFFICIENT_STOCK",
      `Only ${item.product.stock} of ${item.product.name} in stock.`,
    );
  }
  return db.cartItem.update({ where: { id: item.id }, data: { quantity } });
}

/** Removes a line. Throws 404 if it is not in this user's cart. */
export async function removeCartItem(userId: number, cartItemId: number) {
  const { count } = await db.cartItem.deleteMany({
    where: { id: cartItemId, userId },
  });
  if (count === 0) throw notInCart();
}
