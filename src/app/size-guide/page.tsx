import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Size guide" };

const CLOTHING = [
  ["XS", "82–87", "66–71"],
  ["S", "88–95", "72–79"],
  ["M", "96–103", "80–87"],
  ["L", "104–111", "88–95"],
  ["XL", "112–119", "96–103"],
];

const SHOES = [
  ["38", "5.5", "5"],
  ["40", "7", "6.5"],
  ["42", "8.5", "8"],
  ["44", "10", "9.5"],
  ["46", "12", "11.5"],
];

// Opened from the product page's "Size guide" link in a NEW TAB
// (target="_blank"). ?product=<slug> adds the product name to the heading.
export default async function SizeGuidePage({
  searchParams,
}: PageProps<"/size-guide">) {
  const { product: slug } = await searchParams;
  const product =
    typeof slug === "string"
      ? await db.product.findUnique({ where: { slug }, select: { name: true } })
      : null;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Size guide</h1>
        {product && (
          <p className="mt-2 text-gray-600" data-testid="size-guide-product">
            For {product.name}
          </p>
        )}
      </div>

      <SizeTable
        caption="Clothing sizes (cm)"
        headers={["Size", "Chest", "Waist"]}
        rows={CLOTHING}
      />
      <SizeTable
        caption="Shoe sizes"
        headers={["EU", "US", "UK"]}
        rows={SHOES}
      />
    </div>
  );
}

function SizeTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <table className="w-full rounded-lg bg-white text-left text-sm">
      <caption className="mb-2 text-left font-semibold">{caption}</caption>
      <thead>
        <tr className="border-b border-gray-200">
          {headers.map((header) => (
            <th key={header} scope="col" className="p-2">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([first, ...rest]) => (
          <tr key={first} className="border-b border-gray-100">
            <th scope="row" className="p-2">
              {first}
            </th>
            {rest.map((cell, i) => (
              <td key={i} className="p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
