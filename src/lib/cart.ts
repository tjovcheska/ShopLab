// Reading a user's cart. (Changing it: src/lib/cart-actions.ts.)
import { db } from "@/lib/db";

export type CartLine = {
  id: number; // CartItem id
  quantity: number;
  lineTotalCents: number;
  product: {
    id: number;
    name: string;
    slug: string;
    priceCents: number;
    stock: number;
    imageUrl: string;
  };
};

export type Cart = {
  items: CartLine[];
  itemCount: number; // total quantity
  subtotalCents: number;
  /** True if some line asks for more than is in stock right now. */
  hasStockProblem: boolean;
};

export async function getCart(userId: number): Promise<Cart> {
  const rows = await db.cartItem.findMany({
    where: { userId },
    orderBy: { id: "asc" },
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

  const items = rows.map((row) => ({
    id: row.id,
    quantity: row.quantity,
    lineTotalCents: row.quantity * row.product.priceCents,
    product: row.product,
  }));

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    hasStockProblem: items.some((item) => item.quantity > item.product.stock),
  };
}
