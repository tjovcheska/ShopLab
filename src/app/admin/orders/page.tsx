import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderNumber } from "@/lib/format";
import { OrderBoard, type BoardOrder } from "./order-board";

export async function generateMetadata(): Promise<Metadata> {
  // forbidden() shows the 403 page with this page's title (see /admin).
  const user = await getCurrentUser();
  return { title: user?.role === "admin" ? "Order board" : "Access denied" };
}

export default async function OrderBoardPage() {
  await requireAdmin("/admin/orders");
  const orders = await db.order.findMany({
    where: { status: { in: ["paid", "shipped"] } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      user: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  const boardOrders: BoardOrder[] = orders.map((order) => ({
    id: order.id,
    number: formatOrderNumber(order.id),
    customer: order.user.name,
    totalCents: order.totalCents,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    status: order.status as "paid" | "shipped",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm">
          <Link href="/admin" className="text-indigo-700 underline">
            Admin dashboard
          </Link>
        </p>
        <h1 className="text-3xl font-bold">Order board</h1>
        <p className="mt-2 text-gray-600">
          Drag an order card from &ldquo;Paid&rdquo; to &ldquo;Shipped&rdquo;
          when it leaves the warehouse. Changes are saved immediately.
        </p>
      </div>
      <OrderBoard initialOrders={boardOrders} />
    </div>
  );
}
