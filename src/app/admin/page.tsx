import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// The page's metadata also applies to the 403 page that forbidden() renders,
// so customers must get the "Access denied" title here.
export async function generateMetadata(): Promise<Metadata> {
  const user = await getCurrentUser();
  return {
    title: user?.role === "admin" ? "Admin dashboard" : "Access denied",
  };
}

// Admin-only. Anonymous visitors are sent to /login; customers get a 403.
export default async function AdminPage() {
  await requireAdmin("/admin");

  const [users, products, outOfStock, orders] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.product.count({ where: { stock: 0 } }),
    db.order.count(),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Products", value: products },
    { label: "Out of stock", value: outOfStock },
    { label: "Orders", value: orders },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin dashboard</h1>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <dt className="text-sm text-gray-600">{stat.label}</dt>
            <dd className="text-2xl font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="Admin" className="mt-8">
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link
              href="/admin/orders"
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-400"
            >
              <span className="block font-semibold">Order board</span>
              <span className="text-sm text-gray-600">
                Drag orders from Paid to Shipped
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/products"
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-400"
            >
              <span className="block font-semibold">Manage products</span>
              <span className="text-sm text-gray-600">
                Sort, filter, bulk-edit, export CSV
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
