// Any other /api/test/... path: JSON 404 (whether test hooks are on or off).
import { testRoute } from "@/lib/api/route";
import { ShopError } from "@/lib/errors";

const notFound = testRoute(async (request) => {
  throw new ShopError(
    404,
    "NOT_FOUND",
    `No test endpoint ${request.method} ${request.nextUrl.pathname}.`,
  );
});

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
