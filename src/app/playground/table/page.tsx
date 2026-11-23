import type { Metadata } from "next";
import { CustomerTable } from "./customer-table";

export const metadata: Metadata = { title: "Table playground" };

export default function TablePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Table playground</h1>
        <p className="mt-2 text-gray-600">
          Sort by clicking a column header, filter with the search box, and
          select rows with the checkboxes. Some rows share the same name, plan,
          or city on purpose.
        </p>
      </div>
      <CustomerTable />
    </div>
  );
}
