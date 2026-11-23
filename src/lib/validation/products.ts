// Query parameters for the product list. Shared by GET /api/v1/products and
// the /products page, so the page URL and the API URL use the same names:
//
//   ?q=mug                              name contains (case-insensitive)
//   &category=books&category=clothing   one or more category slugs
//   &minPrice=10&maxPrice=50            whole dollars, inclusive
//   &inStock=true                       hide out-of-stock products
//   &sort=price-asc                     see SORT_OPTIONS
//   &page=2&pageSize=12
import { z } from "zod";

export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "price-asc", label: "Price (low to high)" },
  { value: "price-desc", label: "Price (high to low)" },
  { value: "rating-desc", label: "Rating (high to low)" },
  { value: "newest", label: "Newest" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "name-asc";
export const PAGE_SIZE = 12;

const sortValues = SORT_OPTIONS.map((option) => option.value) as [
  SortValue,
  ...SortValue[],
];

const wholeDollars = z.coerce
  .number({ error: "Must be a number." })
  .int("Must be a whole number of dollars.")
  .min(0, "Must be 0 or more.");

export const productQuerySchema = z
  .object({
    q: z.string().trim().max(100, "Must be 100 characters or less.").optional(),
    category: z.array(z.string().min(1)).default([]),
    minPrice: wholeDollars.optional(),
    maxPrice: wholeDollars.optional(),
    inStock: z
      .enum(["true", "false", "1", "0"], {
        error: 'Must be "true" or "false".',
      })
      .transform((value) => value === "true" || value === "1")
      .default(false),
    sort: z
      .enum(sortValues, {
        error: `Must be one of: ${sortValues.join(", ")}.`,
      })
      .default(DEFAULT_SORT),
    page: z.coerce.number().int().min(1, "Must be 1 or more.").default(1),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(100, "Must be 100 or less.")
      .default(PAGE_SIZE),
  })
  .refine(
    (q) =>
      q.minPrice === undefined ||
      q.maxPrice === undefined ||
      q.minPrice <= q.maxPrice,
    {
      message: "minPrice must not be greater than maxPrice.",
      path: ["minPrice"],
    },
  );

export type ProductQuery = z.infer<typeof productQuerySchema>;

/** Turns URL search params into the plain object the schema expects. */
export function searchParamsToQueryInput(params: URLSearchParams) {
  const input: Record<string, unknown> = {
    category: params.getAll("category"),
  };
  for (const key of [
    "q",
    "minPrice",
    "maxPrice",
    "inStock",
    "sort",
    "page",
    "pageSize",
  ]) {
    const value = params.get(key);
    if (value !== null && value !== "") input[key] = value;
  }
  return input;
}

/** Shape of each product in API responses. */
export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  rating: number;
  imageUrl: string;
  category: { id: number; name: string; slug: string };
};

export type ProductListResponse = {
  products: ProductListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
