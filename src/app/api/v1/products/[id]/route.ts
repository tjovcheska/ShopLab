// GET /api/v1/products/:id — one product, including description and stock.
// Used by the "Live stock" widget on the product detail page.
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, validationError } from "@/lib/api-errors";
import { withChaos } from "@/lib/chaos";
import { getProductById } from "@/lib/products";

const idMessage = "Must be a positive whole number.";
const idSchema = z.coerce
  .number({ error: idMessage })
  .int(idMessage)
  .positive(idMessage);

export const GET = withChaos(
  async (
    _request: NextRequest,
    context: RouteContext<"/api/v1/products/[id]">,
  ) => {
    const { id } = await context.params;
    const parsed = z.object({ id: idSchema }).safeParse({ id });
    if (!parsed.success) return validationError(parsed.error);

    const product = await getProductById(parsed.data.id);
    if (!product) {
      return apiError(404, "NOT_FOUND", `Product ${parsed.data.id} not found.`);
    }
    return NextResponse.json({ product });
  },
);
