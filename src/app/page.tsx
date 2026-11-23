import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { NewArrivals } from "@/components/new-arrivals";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

// The layout's "%s | ShopLab" template only applies to child segments,
// so the home page spells out its full title.
export const metadata: Metadata = { title: { absolute: "Home | ShopLab" } };

export default async function HomePage() {
  // Render on every request so the page always shows the current database.
  await connection();

  const [categories, topRated] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    db.product.findMany({
      orderBy: [{ rating: "desc" }, { name: "asc" }],
      take: 8,
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-lg bg-indigo-700 px-6 py-10 text-white">
        <h1 className="text-3xl font-bold">Welcome to ShopLab</h1>
        <p className="mt-2 max-w-xl text-indigo-100">
          A practice shop for learning test automation with Playwright.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-md bg-white px-5 py-2 font-medium text-indigo-700 hover:bg-indigo-50"
        >
          Browse all products
        </Link>
      </section>

      {/* Appears after a random 1–3 second delay. */}
      <NewArrivals />

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-xl font-semibold">
          Shop by category
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-400"
              >
                <span className="block font-medium">{category.name}</span>
                <span className="text-sm text-gray-600">
                  {category._count.products} products
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="top-rated-heading">
        <h2 id="top-rated-heading" className="mb-4 text-xl font-semibold">
          Top rated
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topRated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
