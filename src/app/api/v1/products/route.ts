// GET /api/v1/products — paginated, filterable, sortable product list.
// Query parameters are documented in src/lib/validation/products.ts.
import { NextResponse, type NextRequest } from "next/server";
import { validationError } from "@/lib/api-errors";
import { withChaos } from "@/lib/chaos";
import { listProducts } from "@/lib/products";
import {
  productQuerySchema,
  searchParamsToQueryInput,
} from "@/lib/validation/products";

export const GET = withChaos(async (request: NextRequest) => {
  const parsed = productQuerySchema.safeParse(
    searchParamsToQueryInput(request.nextUrl.searchParams),
  );
  if (!parsed.success) return validationError(parsed.error);

  return NextResponse.json(await listProducts(parsed.data));
});
