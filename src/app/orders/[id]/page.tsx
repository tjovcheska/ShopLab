import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getDeliveryOption } from "@/lib/checkout-options";
import { db } from "@/lib/db";
import {
  formatDeliveryDate,
  formatOrderNumber,
  formatPrice,
} from "@/lib/format";
import { getCountry, getRegionName } from "@/lib/regions";
import type { ShippingAddress } from "@/lib/validation/checkout";

/** The order, if it exists and the current user may see it. */
const getVisibleOrder = cache(async (rawId: string) => {
  const user = await getCurrentUser();
  const id = Number(rawId);
  if (!user || !Number.isInteger(id) || id < 1) return null;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });
  // Customers only see their own orders; admins see all.
  if (!order || (order.userId !== user.id && user.role !== "admin"))
    return null;
  return order;
});

export async function generateMetadata({
  params,
}: PageProps<"/orders/[id]">): Promise<Metadata> {
  const order = await getVisibleOrder((await params).id);
  return {
    title: order ? `Order ${formatOrderNumber(order.id)}` : "Order not found",
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/orders/${id}`);
  const order = await getVisibleOrder(id);
  if (!order) notFound();

  const address = order.shippingAddress as ShippingAddress;
  const itemsCents = order.totalCents - order.shippingCents;
  const delivery = getDeliveryOption(order.deliveryMethod ?? "");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {placed && (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-800"
        >
          Thank you! Your order has been placed.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">
          Order{" "}
          <span data-testid="order-number">{formatOrderNumber(order.id)}</span>
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-gray-600">
          Placed on {dateFormat.format(order.createdAt)}
        </p>
        <a
          href={`/orders/${order.id}/invoice`}
          download
          className="text-sm text-indigo-700 underline"
        >
          Download invoice (CSV)
        </a>
        {order.status === "paid" && order.userId === user.id && (
          <CancelOrderButton
            orderId={order.id}
            orderNumber={formatOrderNumber(order.id)}
          />
        )}
      </div>

      <table className="w-full rounded-lg bg-white text-left text-sm">
        <caption className="mb-2 text-left font-semibold">Items</caption>
        <thead>
          <tr className="border-b border-gray-200 text-gray-600">
            <th scope="col" className="p-2">
              Product
            </th>
            <th scope="col" className="p-2 text-right">
              Quantity
            </th>
            <th scope="col" className="p-2 text-right">
              Price
            </th>
            <th scope="col" className="p-2 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <th scope="row" className="p-2 font-normal">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="hover:text-indigo-700"
                >
                  {item.product.name}
                </Link>
              </th>
              <td className="p-2 text-right">{item.quantity}</td>
              <td className="p-2 text-right">{formatPrice(item.priceCents)}</td>
              <td className="p-2 text-right">
                {formatPrice(item.priceCents * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="p-2 text-right font-normal">
              Subtotal
            </th>
            <td className="p-2 text-right">{formatPrice(itemsCents)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan={3} className="p-2 text-right font-normal">
              Shipping{delivery ? ` (${delivery.label})` : ""}
            </th>
            <td className="p-2 text-right">
              {formatPrice(order.shippingCents)}
            </td>
          </tr>
          <tr className="text-base font-bold">
            <th scope="row" colSpan={3} className="p-2 text-right">
              Total
            </th>
            <td className="p-2 text-right" data-testid="order-total">
              {formatPrice(order.totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className="grid gap-4 rounded-lg bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Ship to</dt>
          <dd>
            {address.fullName}
            <br />
            {address.line1}
            {address.line2 && (
              <>
                <br />
                {address.line2}
              </>
            )}
            <br />
            {address.city},{" "}
            {getRegionName(address.country, address.region) ?? address.region}{" "}
            {address.postalCode}
            <br />
            {getCountry(address.country)?.name ?? address.country}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Delivery date</dt>
          <dd>
            {order.deliveryDate
              ? formatDeliveryDate(order.deliveryDate)
              : "Not scheduled"}
          </dd>
        </div>
      </dl>

      <p>
        <Link href="/account/orders" className="text-indigo-700 underline">
          View all your orders
        </Link>
      </p>
    </div>
  );
}
