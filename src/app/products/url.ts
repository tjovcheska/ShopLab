// URL helpers for the /products page. All filter state lives in the query
// string; these helpers build the next URL from the current one.

/** Query keys that are filters. Changing any of them resets to page 1. */
export const FILTER_KEYS = ["category", "minPrice", "maxPrice", "inStock"];

/**
 * Copies `current`, applies `change`, and returns "/products?…".
 * Other params (like ?delay=) are kept.
 */
export function productsUrl(
  current: URLSearchParams,
  change: (params: URLSearchParams) => void,
): string {
  const params = new URLSearchParams(current);
  change(params);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

/** Reads a whole number from the URL, clamped to [min, max]. */
export function readInt(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = Number(params.get(key));
  if (params.get(key) === null || !Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}
