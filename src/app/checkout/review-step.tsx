"use client";

import { getDeliveryOption } from "@/lib/checkout-options";
import { formatLongDate } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { getCountry, getRegionName } from "@/lib/regions";
import type { DeliveryInput, ShippingInput } from "@/lib/validation/checkout";
import type { ApprovedPayment } from "./payment-step";

export type ReviewItem = {
  id: number;
  name: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
};

export function ReviewStep({
  items,
  subtotalCents,
  shipping,
  delivery,
  payment,
}: {
  items: ReviewItem[];
  subtotalCents: number;
  shipping: ShippingInput;
  delivery: DeliveryInput;
  payment: ApprovedPayment;
}) {
  const option = getDeliveryOption(delivery.method)!;
  const totalCents = subtotalCents + option.priceCents;

  return (
    <div className="flex flex-col gap-6">
      <table data-testid="order-summary" className="w-full text-left text-sm">
        <caption className="mb-2 text-left font-semibold">
          Order summary
        </caption>
        <thead>
          <tr className="border-b border-gray-200 text-gray-600">
            <th scope="col" className="py-2">
              Product
            </th>
            <th scope="col" className="py-2 text-right">
              Quantity
            </th>
            <th scope="col" className="py-2 text-right">
              Price
            </th>
            <th scope="col" className="py-2 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <th scope="row" className="py-2 font-normal">
                {item.name}
              </th>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                {formatPrice(item.priceCents)}
              </td>
              <td className="py-2 text-right">
                {formatPrice(item.lineTotalCents)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="pt-3 text-right font-normal">
              Subtotal
            </th>
            <td className="pt-3 text-right">{formatPrice(subtotalCents)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan={3} className="text-right font-normal">
              Shipping ({option.label})
            </th>
            <td className="text-right">{formatPrice(option.priceCents)}</td>
          </tr>
          <tr className="text-base font-bold">
            <th scope="row" colSpan={3} className="pt-2 text-right">
              Total
            </th>
            <td className="pt-2 text-right" data-testid="order-total">
              {formatPrice(totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold">Ship to</dt>
          <dd>
            {shipping.fullName}
            <br />
            {shipping.line1}
            {shipping.line2 && (
              <>
                <br />
                {shipping.line2}
              </>
            )}
            <br />
            {shipping.city}, {getRegionName(shipping.country, shipping.region)}{" "}
            {shipping.postalCode}
            <br />
            {getCountry(shipping.country)?.name}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Delivery</dt>
          <dd>
            {option.label}
            <br />
            {formatLongDate(delivery.date)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Payment</dt>
          <dd>
            {payment.brand} ending in {payment.last4}
          </dd>
        </div>
      </dl>
    </div>
  );
}
