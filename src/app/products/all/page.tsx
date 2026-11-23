import type { Metadata } from "next";
import { InfiniteProductList } from "./infinite-product-list";

export const metadata: Metadata = { title: "All products" };

export default function AllProductsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">All products</h1>
      <p className="mb-6 text-gray-600">
        Scroll down to load more products, 12 at a time.
      </p>
      <InfiniteProductList />
    </div>
  );
}
