// GET /admin/products/export — every product as a CSV attachment (admin only).
// Used by the "Export CSV" link on /admin/products.
import { getCurrentUser } from "@/lib/auth";
import { withChaos } from "@/lib/chaos";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";

export const GET = withChaos(async () => {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return new Response("Admin access required.", { status: 403 });
  }
  const products = await db.product.findMany({
    orderBy: { id: "asc" },
    include: { category: true },
  });
  const csv = toCsv([
    ["id", "name", "category", "price", "stock"],
    ...products.map((p) => [
      p.id,
      p.name,
      p.category.name,
      (p.priceCents / 100).toFixed(2),
      p.stock,
    ]),
  ]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shoplab-products.csv"',
    },
  });
});
