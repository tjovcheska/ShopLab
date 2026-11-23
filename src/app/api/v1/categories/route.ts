// GET /api/v1/categories — all categories with their product counts (public).
import { apiRoute, json } from "@/lib/api/route";
import { db } from "@/lib/db";

export const GET = apiRoute(async () => {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
    })),
  });
});
