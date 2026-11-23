import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderNumber, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order history" };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function OrderHistoryPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { items: { select: { quantity: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Order history</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">
          You have not placed any orders yet.{" "}
          <Link href="/products" className="text-indigo-700 underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <table
          data-testid="order-history"
          className="w-full rounded-lg bg-white text-left text-sm"
        >
          <caption className="sr-only">Your orders, newest first</caption>
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th scope="col" className="p-3">
                Order
              </th>
              <th scope="col" className="p-3">
                Date
              </th>
              <th scope="col" className="p-3 text-right">
                Items
              </th>
              <th scope="col" className="p-3 text-right">
                Total
              </th>
              <th scope="col" className="p-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100">
                <th scope="row" className="p-3 font-medium">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-indigo-700 underline"
                  >
                    {formatOrderNumber(order.id)}
                  </Link>
                </th>
                <td className="p-3">{dateFormat.format(order.createdAt)}</td>
                <td className="p-3 text-right">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="p-3 text-right">
                  {formatPrice(order.totalCents)}
                </td>
                <td className="p-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
