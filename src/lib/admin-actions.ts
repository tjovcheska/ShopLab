"use server";
// Admin Server Actions: the order board and the products table.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import { formatOrderNumber } from "@/lib/format";
import { deleteProduct } from "@/lib/services/products";

export type AdminResult = { ok: boolean; message: string };

const NOT_ADMIN: AdminResult = { ok: false, message: "Admin access required." };

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/** Order board: move a paid order to shipped, or back. */
export async function setOrderStatusAction(
  orderId: number,
  status: "paid" | "shipped",
): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || !["paid", "shipped"].includes(order.status)) {
    return { ok: false, message: "This order cannot be moved." };
  }
  await db.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
  return {
    ok: true,
    message: `${formatOrderNumber(orderId)} is now ${status}.`,
  };
}

/** Products table: set stock to 0 for the selected products. */
export async function markOutOfStockAction(
  productIds: number[],
): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const { count } = await db.product.updateMany({
    where: { id: { in: productIds } },
    data: { stock: 0 },
  });
  revalidatePath("/admin/products");
  return {
    ok: true,
    message: `${count} ${count === 1 ? "product is" : "products are"} now out of stock.`,
  };
}

/**
 * Products table: delete the selected products. Products that appear in an
 * order cannot be deleted; they are reported back.
 */
export async function deleteProductsAction(
  productIds: number[],
): Promise<AdminResult> {
  if (!(await isAdmin())) return NOT_ADMIN;
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });
  const deleted: string[] = [];
  const kept: string[] = [];
  for (const product of products) {
    try {
      await deleteProduct(product.id);
      deleted.push(product.name);
    } catch (error) {
      if (error instanceof ShopError && error.code === "PRODUCT_HAS_ORDERS") {
        kept.push(product.name);
      } else {
        throw error;
      }
    }
  }
  revalidatePath("/admin/products");
  const parts = [];
  if (deleted.length)
    parts.push(`Deleted ${deleted.length}: ${deleted.join(", ")}.`);
  if (kept.length) {
    parts.push(
      `Not deleted because they appear in orders: ${kept.join(", ")}.`,
    );
  }
  return { ok: kept.length === 0, message: parts.join(" ") };
}
