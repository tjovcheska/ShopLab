"use client";

import { useEffect, useRef, useState } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Team";
  city: string;
  joined: string; // YYYY-MM-DD
  orders: number;
};

// Fixed data. Duplicates are deliberate: two "Alex Smith" and two "Sam Lee"
// rows (only the email tells them apart), and plans and cities repeat.
const CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Alex Smith",
    email: "alex.smith@example.test",
    plan: "Pro",
    city: "London",
    joined: "2025-03-14",
    orders: 12,
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@example.test",
    plan: "Team",
    city: "Toronto",
    joined: "2024-11-02",
    orders: 31,
  },
  {
    id: 3,
    name: "Sam Lee",
    email: "sam.lee@example.test",
    plan: "Free",
    city: "Berlin",
    joined: "2026-01-20",
    orders: 2,
  },
  {
    id: 4,
    name: "Maria Garcia",
    email: "maria@example.test",
    plan: "Pro",
    city: "Madrid",
    joined: "2025-07-08",
    orders: 9,
  },
  {
    id: 5,
    name: "Alex Smith",
    email: "alex.smith2@example.test",
    plan: "Free",
    city: "Toronto",
    joined: "2026-05-30",
    orders: 1,
  },
  {
    id: 6,
    name: "Chen Wei",
    email: "chen.wei@example.test",
    plan: "Team",
    city: "Singapore",
    joined: "2024-06-17",
    orders: 44,
  },
  {
    id: 7,
    name: "Fatima Khan",
    email: "fatima@example.test",
    plan: "Pro",
    city: "London",
    joined: "2025-09-23",
    orders: 15,
  },
  {
    id: 8,
    name: "Jonas Berg",
    email: "jonas@example.test",
    plan: "Free",
    city: "Oslo",
    joined: "2026-02-11",
    orders: 0,
  },
  {
    id: 9,
    name: "Sam Lee",
    email: "sam.lee.work@example.test",
    plan: "Team",
    city: "Seattle",
    joined: "2025-01-05",
    orders: 27,
  },
  {
    id: 10,
    name: "Olivia Brown",
    email: "olivia@example.test",
    plan: "Pro",
    city: "Berlin",
    joined: "2025-12-01",
    orders: 6,
  },
  {
    id: 11,
    name: "Noah Wilson",
    email: "noah@example.test",
    plan: "Free",
    city: "Seattle",
    joined: "2026-08-19",
    orders: 3,
  },
  {
    id: 12,
    name: "Ana Silva",
    email: "ana@example.test",
    plan: "Team",
    city: "Lisbon",
    joined: "2024-09-28",
    orders: 38,
  },
];

type SortKey = "name" | "plan" | "city" | "joined" | "orders";
type Sort = { key: SortKey; direction: "ascending" | "descending" } | null;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "plan", label: "Plan" },
  { key: "city", label: "City" },
  { key: "joined", label: "Joined" },
  { key: "orders", label: "Orders", numeric: true },
];

function compare(a: Customer, b: Customer, key: SortKey): number {
  const x = a[key];
  const y = b[key];
  if (typeof x === "number" && typeof y === "number") return x - y;
  return String(x).localeCompare(String(y));
}

export function CustomerTable() {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<Sort>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const term = filter.trim().toLowerCase();
  const visible = CUSTOMERS.filter(
    (c) =>
      !term ||
      [c.name, c.email, c.plan, c.city].some((v) =>
        v.toLowerCase().includes(term),
      ),
  ).sort((a, b) => {
    if (!sort) return a.id - b.id;
    const result = compare(a, b, sort.key) || a.id - b.id; // ties: original order
    return sort.direction === "ascending" ? result : -result;
  });

  const visibleSelected = visible.filter((c) => selected.has(c.id)).length;
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

  function toggleRow(id: number, checked: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      for (const c of visible) {
        if (checked) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="customer-filter" className="text-sm font-medium">
            Filter customers
          </label>
          <input
            id="customer-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Name, email, plan, or city"
            className="w-72 rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <p role="status" data-testid="selected-count">
            {selected.size} selected
          </p>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => setSelected(new Set())}
            className="text-indigo-700 underline disabled:text-gray-400 disabled:no-underline"
          >
            Clear selection
          </button>
        </div>
      </div>

      <table data-testid="customer-table" className="w-full text-left text-sm">
        <caption className="sr-only">Customers</caption>
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="w-10 p-2">
              <input
                ref={selectAllRef}
                type="checkbox"
                aria-label="Select all visible customers"
                checked={allVisibleSelected}
                disabled={visible.length === 0}
                onChange={(e) => toggleAllVisible(e.target.checked)}
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
            <th scope="col" className="p-2">
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((customer) => (
            <tr
              key={customer.id}
              className={`border-b border-gray-100 ${
                selected.has(customer.id) ? "bg-indigo-50" : ""
              }`}
            >
              <td className="p-2">
                <input
                  type="checkbox"
                  aria-label={`Select ${customer.name}`}
                  checked={selected.has(customer.id)}
                  onChange={(e) => toggleRow(customer.id, e.target.checked)}
                />
              </td>
              <td className="p-2 font-medium">{customer.name}</td>
              <td className="p-2">{customer.plan}</td>
              <td className="p-2">{customer.city}</td>
              <td className="p-2">{customer.joined}</td>
              <td className="p-2 text-right">{customer.orders}</td>
              <td className="p-2 text-gray-600">{customer.email}</td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td
                colSpan={COLUMNS.length + 2}
                className="p-4 text-center text-gray-600"
              >
                No customers match “{filter.trim()}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-sm text-gray-600" data-testid="row-count">
        Showing {visible.length} of {CUSTOMERS.length} customers
      </p>
    </div>
  );
}
