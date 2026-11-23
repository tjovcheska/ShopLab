const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Prices are stored as integer cents; format them for display. */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}
