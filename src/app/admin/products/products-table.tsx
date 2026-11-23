"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteProductsAction,
  markOutOfStockAction,
} from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";
import { useAdoptDomValue } from "@/lib/use-adopt-dom-value";

type Row = {
  id: number;
  name: string;
  slug: string;
  category: string;
  priceCents: number;
  stock: number;
  rating: number;
};

type SortKey = "name" | "category" | "priceCents" | "stock" | "rating";
type Sort = { key: SortKey; direction: "ascending" | "descending" } | null;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "priceCents", label: "Price", numeric: true },
  { key: "stock", label: "Stock", numeric: true },
  { key: "rating", label: "Rating", numeric: true },
];

/**
 * Sort by clicking a header, filter by text, select rows with checkboxes, and
 * act on the selection. Names like "Ceramic Mug" / "Ceramic Mug Set" and
 * repeated categories make filtered locators necessary.
 */
export function ProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);
  useAdoptDomValue(filterRef, filter, setFilter);
  const [sort, setSort] = useState<Sort>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Drop selections of rows that no longer exist (e.g. after deleting).
  const selectedIds = [...selected].filter((id) =>
    products.some((p) => p.id === id),
  );

  const term = filter.trim().toLowerCase();
  const visible = products
    .filter(
      (p) =>
        !term ||
        [p.name, p.category].some((v) => v.toLowerCase().includes(term)),
    )
    .sort((a, b) => {
      if (!sort) return a.id - b.id;
      const x = a[sort.key];
      const y = b[sort.key];
      const result =
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y))) || a.id - b.id;
      return sort.direction === "ascending" ? result : -result;
    });

  const visibleSelected = visible.filter((p) => selected.has(p.id)).length;
  const allVisibleSelected =
    visible.length > 0 && visibleSelected === visible.length;

  // "Select all" shows a dash (indeterminate) when only some rows are selected.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        visibleSelected > 0 && !allVisibleSelected;
    }
  }, [visibleSelected, allVisibleSelected]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s?.key === key && s.direction === "ascending"
        ? { key, direction: "descending" }
        : { key, direction: "ascending" },
    );
  }

  function toggle(ids: number[], checked: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function runBulk(
    action: (ids: number[]) => Promise<{ ok: boolean; message: string }>,
  ) {
    startTransition(async () => {
      const result = await action(selectedIds);
      setMessage({ ok: result.ok, text: result.message });
      setSelected(new Set());
      router.refresh(); // reload the rows from the server
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="product-filter" className="text-sm font-medium">
            Filter products
          </label>
          <input
            ref={filterRef}
            id="product-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Name or category"
            className="w-72 rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p role="status" data-testid="admin-selected-count">
            {selectedIds.length} selected
          </p>
          <button
            type="button"
            disabled={selectedIds.length === 0 || pending}
            onClick={() => runBulk(markOutOfStockAction)}
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark out of stock
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || pending}
            onClick={() => setConfirmDelete(true)}
            className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete selected
          </button>
        </div>
      </div>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded-md px-3 py-2 text-sm ${
            message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}

      <table
        data-testid="admin-products-table"
        className="w-full text-left text-sm"
      >
        <caption className="sr-only">Products</caption>
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="w-10 p-2">
              <input
                ref={selectAllRef}
                type="checkbox"
                aria-label="Select all visible products"
                checked={allVisibleSelected}
                disabled={visible.length === 0}
                onChange={(e) =>
                  toggle(
                    visible.map((p) => p.id),
                    e.target.checked,
                  )
                }
              />
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={sort?.key === column.key ? sort.direction : "none"}
                className={`p-2 ${column.numeric ? "text-right" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="inline-flex items-center gap-1 font-semibold hover:text-indigo-700"
                >
                  {column.label}
                  <span aria-hidden="true" className="text-gray-400">
                    {sort?.key === column.key
                      ? sort.direction === "ascending"
                        ? "▲"
                        : "▼"
                      : "↕"}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr
              key={p.id}
              className={`border-b border-gray-100 ${selected.has(p.id) ? "bg-indigo-50" : ""}`}
            >
              <td className="p-2">
                <input
                  type="checkbox"
                  aria-label={`Select ${p.name}`}
                  checked={selected.has(p.id)}
                  onChange={(e) => toggle([p.id], e.target.checked)}
                />
              </td>
              <td className="p-2 font-medium">
                <Link
                  href={`/products/${p.slug}`}
                  className="hover:text-indigo-700"
                >
                  {p.name}
                </Link>
              </td>
              <td className="p-2">{p.category}</td>
              <td className="p-2 text-right">{formatPrice(p.priceCents)}</td>
              <td
                className={`p-2 text-right ${p.stock === 0 ? "font-semibold text-red-700" : ""}`}
              >
                {p.stock}
              </td>
              <td className="p-2 text-right">{p.rating}</td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td
                colSpan={COLUMNS.length + 1}
                className="p-4 text-center text-gray-600"
              >
                No products match “{filter.trim()}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-sm text-gray-600" data-testid="admin-row-count">
        Showing {visible.length} of {products.length} products
      </p>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete products?"
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          runBulk(deleteProductsAction);
        }}
      >
        Delete {selectedIds.length} selected{" "}
        {selectedIds.length === 1 ? "product" : "products"}? Products that
        appear in orders are kept.
      </ConfirmDialog>
    </div>
  );
}
