// Any other /api/v1/... path: a JSON 404 instead of Next.js's HTML 404 page,
// so the API answers in JSON only.
import { apiRoute } from "@/lib/api/route";
import { ShopError } from "@/lib/errors";

const notFound = apiRoute(async (request) => {
  throw new ShopError(
    404,
    "NOT_FOUND",
    `No API endpoint ${request.method} ${request.nextUrl.pathname}. See /api-docs.`,
  );
});

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
