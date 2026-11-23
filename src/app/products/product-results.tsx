"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { apiFetch } from "@/lib/api-client";
import type { ProductListResponse } from "@/lib/validation/products";
import { productsUrl } from "./url";

// Page-URL params that are passed on to the API. (?delay is forwarded by
// apiFetch itself.)
const API_KEYS = [
  "category",
  "minPrice",
  "maxPrice",
  "inStock",
  "sort",
  "page",
];

type Result =
  { key: string; data: ProductListResponse } | { key: string; error: string };

export function ProductResults() {
  const params = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const apiQuery = new URLSearchParams();
  for (const key of API_KEYS) {
    for (const value of params.getAll(key)) apiQuery.append(key, value);
  }
  const query = apiQuery.toString();
  // A new key means "fetch again": the filters changed or "Try again" was clicked.
  const key = `${query}#${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<ProductListResponse>(`/api/v1/products?${query}`, {
      signal: controller.signal,
    })
      .then((data) => setResult({ key, data }))
      .catch((error: Error) => {
        if (controller.signal.aborted) return; // a newer request replaced this one
        setResult({ key, error: error.message });
      });
    return () => controller.abort();
  }, [key, query]);

  // Loading until the result for the *current* key has arrived.
  if (result === null || result.key !== key) return <ResultsSkeleton />;

  if ("error" in result) {
    return (
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
        >
          <p>Could not load products: {result.error}</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const { products, pagination } = result.data;
  const first = (pagination.page - 1) * pagination.pageSize + 1;
  const last = first + products.length - 1;

  return (
    <section aria-labelledby="results-heading" className="flex flex-col gap-6">
      <h2
        id="results-heading"
        data-testid="results-count"
        className="text-sm font-medium text-gray-700"
      >
        {products.length > 0
          ? `Showing ${first}–${last} of ${pagination.total} products`
          : pagination.total > 0
            ? `No products on page ${pagination.page} (${pagination.total} products in total)`
            : "No products match your filters"}
      </h2>

      {products.length > 0 && (
        <div
          data-testid="product-grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          params={params}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <section aria-busy="true" aria-labelledby="results-heading">
      <h2 id="results-heading" className="sr-only">
        Results
      </h2>
      <p
        role="status"
        className="mb-6 h-5 w-48 animate-pulse rounded bg-gray-200"
      >
        <span className="sr-only">Loading products…</span>
      </p>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            data-testid="product-skeleton"
            className="flex animate-pulse flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <div className="aspect-4/3 bg-gray-200" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-2 h-9 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pagination({
  params,
  page,
  totalPages,
}: {
  params: URLSearchParams;
  page: number;
  totalPages: number;
}) {
  const hrefFor = (target: number) =>
    productsUrl(params, (next) => {
      if (target === 1) next.delete("page");
      else next.set("page", String(target));
    });

  const linkClass =
    "rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50";
  const disabledClass =
    "rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400";

  return (
    <nav aria-label="Pagination">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={linkClass}>
              Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}>
              Previous
            </span>
          )}
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={hrefFor(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? "page" : undefined}
              className={
                n === page
                  ? "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm text-white"
                  : linkClass
              }
            >
              {n}
            </Link>
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)} className={linkClass}>
              Next
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}>
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
