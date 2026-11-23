// GET /api/v1/openapi.json — the OpenAPI 3.1 document for this API.
import { apiRoute, json } from "@/lib/api/route";
import { openApiDocument } from "@/lib/openapi";

export const GET = apiRoute(async () => json(openApiDocument));
