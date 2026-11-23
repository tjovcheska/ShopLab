import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { QuickView } from "@/components/quick-view";
import { Rating } from "@/components/rating";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  rating: number;
  imageUrl: string;
};

// Each card is an <article> named by its heading, so tests can target one
// card with getByRole("article", { name: "Yoga Mat" }). The "Add to cart"
// buttons all share the same name and have no test ID: filter by card first.
// "Quick view" only becomes visible while the card is hovered.
export function ProductCard({ product }: { product: ProductCardData }) {
  const headingId = `product-${product.slug}-name`;
  const outOfStock = product.stock === 0;
  return (
    <article
      aria-labelledby={headingId}
      className="group/card flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <div className="relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={300}
          className="aspect-4/3 w-full object-cover"
        />
        {outOfStock && (
          <span className="absolute top-2 left-2 rounded bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
        <QuickView productId={product.id} name={product.name} />
      </div>
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
        <Rating value={product.rating} />
        <div className="mt-auto pt-3">
          <AddToCart productId={product.id} stock={product.stock} />
        </div>
      </div>
    </article>
  );
}
