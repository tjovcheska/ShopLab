import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products";
import { productQuerySchema } from "@/lib/validation/products";

function readTerm(q: string | string[] | undefined): string {
  return typeof q === "string" ? q.trim().slice(0, 100) : "";
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const term = readTerm((await searchParams).q);
  return { title: term ? `Search: ${term}` : "Search" };
}

// Server-rendered results for /search?q=… (product names containing q).
export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const term = readTerm((await searchParams).q);

  if (!term) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-bold">Search</h1>
        <p className="text-gray-600">
          Type a product name in the search box at the top of the page.
        </p>
      </div>
    );
  }

  const { products, pagination } = await listProducts(
    productQuerySchema.parse({ q: term, pageSize: 100 }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Search results</h1>
        <p className="mt-1 text-gray-700" data-testid="search-summary">
          {pagination.total} {pagination.total === 1 ? "result" : "results"} for
          “{term}”
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600">
          No products match your search.{" "}
          <Link href="/products" className="text-indigo-700 underline">
            Browse all products
          </Link>
        </p>
      ) : (
        <section aria-label="Search results">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
