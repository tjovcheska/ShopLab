// GET /orders/:id/invoice — the order as a CSV invoice (download).
// Customers can download their own invoices; admins any invoice.
import { getCurrentUser } from "@/lib/auth";
import { getDeliveryOption } from "@/lib/checkout-options";
import { toCsv } from "@/lib/csv";
import { formatOrderNumber } from "@/lib/format";
import { getVisibleOrder } from "@/lib/services/orders";
import type { ShippingAddress } from "@/lib/validation/checkout";

const money = (cents: number) => (cents / 100).toFixed(2);

export async function GET(
  _request: Request,
  context: RouteContext<"/orders/[id]/invoice">,
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in.", { status: 401 });
  const id = Number((await context.params).id);
  const order =
    Number.isInteger(id) && id > 0 ? await getVisibleOrder(id, user) : null;
  if (!order) return new Response("Order not found.", { status: 404 });

  const number = formatOrderNumber(order.id);
  const address = order.shippingAddress as ShippingAddress;
  const delivery = getDeliveryOption(order.deliveryMethod ?? "");
  const csv = toCsv([
    ["Invoice", number],
    ["Date", order.createdAt.toISOString().slice(0, 10)],
    ["Customer", address.fullName],
    ["Status", order.status],
    [],
    ["Product", "Quantity", "Unit price", "Line total"],
    ...order.items.map((item) => [
      item.product.name,
      item.quantity,
      money(item.priceCents),
      money(item.priceCents * item.quantity),
    ]),
    [],
    ["Subtotal", "", "", money(order.totalCents - order.shippingCents)],
    [
      `Shipping (${delivery?.label ?? "standard"})`,
      "",
      "",
      money(order.shippingCents),
    ],
    ["Total", "", "", money(order.totalCents)],
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoice-${number}.csv"`,
    },
  });
}
