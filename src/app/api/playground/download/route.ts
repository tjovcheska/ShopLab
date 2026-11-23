// GET /api/playground/download — every product as a CSV attachment.
// Used by the download link on /playground/upload.
import { withChaos } from "@/lib/chaos";
import { db } from "@/lib/db";

/** Quotes a CSV field if it contains a comma, quote, or newline. */
function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const GET = withChaos(async () => {
  const products = await db.product.findMany({
    orderBy: { id: "asc" },
    include: { category: true },
  });
  const rows = [
    ["id", "name", "category", "price", "stock"],
    ...products.map((p) => [
      p.id,
      p.name,
      p.category.name,
      (p.priceCents / 100).toFixed(2),
      p.stock,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvField).join(",")).join("\n") + "\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shoplab-products.csv"',
    },
  });
});
