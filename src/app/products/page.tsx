import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { getMaxPriceDollars } from "@/lib/products";
import { ProductFilters } from "./product-filters";
import { ProductResults } from "./product-results";

export const metadata: Metadata = { title: "Products" };

// The filters live in the URL (?category=…&sort=…&page=…), so every view is
// bookmarkable. The product grid itself is fetched in the browser from
// GET /api/v1/products, so chaos delay and flaky mode affect it.
export default async function ProductsPage() {
  await connection();
  const [categories, priceMax] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    getMaxPriceDollars(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Products</h1>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters">
          <Suspense>
            <ProductFilters categories={categories} priceMax={priceMax} />
          </Suspense>
        </aside>
        <Suspense>
          <ProductResults />
        </Suspense>
      </div>
    </div>
  );
}
