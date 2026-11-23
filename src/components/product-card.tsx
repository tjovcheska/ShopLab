import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  rating: number;
  imageUrl: string;
};

// Each card is an <article> named by its heading, so tests can target one
// card with getByRole("article", { name: "Yoga Mat" }).
export function ProductCard({ product }: { product: ProductCardData }) {
  const headingId = `product-${product.slug}-name`;
  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={400}
        height={300}
        className="aspect-4/3 w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 id={headingId} className="font-semibold">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-indigo-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-lg font-bold">{formatPrice(product.priceCents)}</p>
        <p className="text-sm text-gray-600">
          <span aria-hidden="true">
            {"★".repeat(product.rating)}
            {"☆".repeat(5 - product.rating)}
          </span>
          <span className="sr-only">Rated {product.rating} out of 5</span>
        </p>
        {product.stock === 0 && (
          <p className="mt-auto w-fit rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            Out of stock
          </p>
        )}
      </div>
    </article>
  );
}
