const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Prices are stored as integer cents; format them for display. */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

/** Order 3 → "SL-000003" */
export function formatOrderNumber(orderId: number): string {
  return `SL-${String(orderId).padStart(6, "0")}`;
}

/** A calendar date stored as midnight UTC (e.g. Order.deliveryDate). */
export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
