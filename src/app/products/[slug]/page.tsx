import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { Rating } from "@/components/rating";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { LiveStock } from "./live-stock";
import { ProductLinks } from "./product-links";

// One query shared by generateMetadata and the page.
const getProduct = cache((slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { user: { select: { name: true } } },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product ? product.name : "Product not found" };
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const outOfStock = product.stock === 0;

  return (
    <div className="flex flex-col gap-10">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-indigo-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-indigo-700">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-indigo-700"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-gray-900">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={300}
          priority
          className="w-full rounded-lg border border-gray-200 bg-white"
        />

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <Rating value={product.rating} />
          <p className="text-2xl font-bold">
            {formatPrice(product.priceCents)}
          </p>
          {outOfStock && (
            <p className="w-fit rounded bg-gray-800 px-2 py-0.5 text-sm font-semibold text-white">
              Out of stock
            </p>
          )}
          <LiveStock productId={product.id} initialStock={product.stock} />
          <p className="text-gray-700">{product.description}</p>
          <ProductLinks slug={product.slug} />
          <div className="max-w-sm">
            <AddToCart
              productId={product.id}
              stock={product.stock}
              withQuantity
            />
          </div>
        </div>
      </div>

      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="mb-4 text-xl font-semibold">
          Customer reviews ({product.reviews.length})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <ul data-testid="reviews-list" className="flex flex-col gap-4">
            {product.reviews.map((review) => (
              <li key={review.id}>
                <article
                  aria-label={`Review by ${review.user.name}`}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <header className="mb-1 flex flex-wrap items-center gap-x-3">
                    <h3 className="font-semibold">{review.user.name}</h3>
                    <time
                      dateTime={review.createdAt.toISOString()}
                      className="text-sm text-gray-500"
                    >
                      {dateFormat.format(review.createdAt)}
                    </time>
                  </header>
                  <Rating value={review.rating} />
                  <p className="mt-2">{review.comment}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
