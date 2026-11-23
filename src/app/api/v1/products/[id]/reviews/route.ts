// GET  /api/v1/products/:id/reviews — reviews, newest first (public).
// POST /api/v1/products/:id/reviews — add your review (login required).
import {
  apiRoute,
  json,
  parseId,
  readJson,
  requireApiUser,
} from "@/lib/api/route";
import { serializeReview } from "@/lib/api/serialize";
import { createReview, listReviews } from "@/lib/services/reviews";
import { reviewCreateSchema } from "@/lib/validation/api";

type Context = RouteContext<"/api/v1/products/[id]/reviews">;

export const GET = apiRoute<Context>(async (_request, context) => {
  const productId = parseId((await context.params).id);
  const reviews = await listReviews(productId);
  return json({ reviews: reviews.map(serializeReview) });
});

export const POST = apiRoute<Context>(async (request, context) => {
  const user = await requireApiUser(request);
  const productId = parseId((await context.params).id);
  const input = await readJson(request, reviewCreateSchema);
  const review = await createReview(user.id, productId, input);
  return json({ review: serializeReview(review) }, 201);
});
