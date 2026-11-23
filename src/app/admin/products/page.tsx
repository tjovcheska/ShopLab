import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductsTable } from "./products-table";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getCurrentUser();
  return {
    title: user?.role === "admin" ? "Manage products" : "Access denied",
  };
}

export default async function AdminProductsPage() {
  await requireAdmin("/admin/products");
  const products = await db.product.findMany({
    orderBy: { id: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm">
          <Link href="/admin" className="text-indigo-700 underline">
            Admin dashboard
          </Link>
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold">Manage products</h1>
          <a
            href="/admin/products/export"
            download
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Export CSV
          </a>
        </div>
      </div>
      <ProductsTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category.name,
          priceCents: p.priceCents,
          stock: p.stock,
          rating: p.rating,
        }))}
      />
    </div>
  );
}
