"use client";

import Link from "next/link";
import { useState, useTransition, type DragEvent } from "react";
import { setOrderStatusAction } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";

export type BoardOrder = {
  id: number;
  number: string;
  customer: string;
  totalCents: number;
  itemCount: number;
  status: "paid" | "shipped";
};

const COLUMNS = [
  { status: "paid", title: "Paid" },
  { status: "shipped", title: "Shipped" },
] as const;

/**
 * Two-column board using native HTML5 drag and drop: drop a card anywhere in
 * the other column. Every card also has a button that does the same.
 */
export function OrderBoard({ initialOrders }: { initialOrders: BoardOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  function moveOrder(orderId: number, status: BoardOrder["status"]) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === status) return;
    const previous = orders;
    // Moved cards go to the bottom of their new column, straight away.
    setOrders([
      ...orders.filter((o) => o.id !== orderId),
      { ...order, status },
    ]);
    startTransition(async () => {
      const result = await setOrderStatusAction(orderId, status);
      if (!result.ok) setOrders(previous);
      setMessage(result.message);
    });
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    status: BoardOrder["status"],
  ) {
    event.preventDefault();
    setOverColumn(null);
    moveOrder(Number(event.dataTransfer.getData("text/plain")), status);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 md:grid-cols-2">
        {COLUMNS.map((column) => {
          const cards = orders.filter((o) => o.status === column.status);
          const other = COLUMNS.find((c) => c.status !== column.status)!;
          return (
            <section
              key={column.status}
              aria-label={column.title}
              data-testid={`order-column-${column.status}`}
              onDragOver={(e) => {
                e.preventDefault(); // allows dropping here
                setOverColumn(column.status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn(null);
                }
              }}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`flex min-h-64 flex-col gap-2 rounded-lg border-2 border-dashed p-3 ${
                overColumn === column.status
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h2 className="font-semibold">
                {column.title} ({cards.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {cards.map((order) => (
                  <li
                    key={order.id}
                    draggable
                    aria-label={`Order ${order.number}`}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(order.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setOverColumn(null)}
                    className="flex cursor-grab items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-indigo-700 underline"
                      >
                        {order.number}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {order.customer} · {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"} ·{" "}
                        {formatPrice(order.totalCents)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveOrder(order.id, other.status)}
                      className="rounded px-2 py-1 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      {column.status === "paid"
                        ? "Mark as shipped"
                        : "Back to paid"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p
        role="status"
        data-testid="board-status"
        className="text-sm text-gray-700"
      >
        {message}
      </p>
    </div>
  );
}
