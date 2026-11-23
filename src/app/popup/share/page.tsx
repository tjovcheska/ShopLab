import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ShareActions } from "./share-actions";

async function getProduct(slug: string | string[] | undefined) {
  if (typeof slug !== "string") return null;
  return db.product.findUnique({
    where: { slug },
    select: { name: true, slug: true },
  });
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/popup/share">): Promise<Metadata> {
  const product = await getProduct((await searchParams).product);
  return { title: product ? `Share: ${product.name}` : "Share" };
}

// Opened by the product page's "Share" button with window.open(), as a small
// popup window. The site header and footer are left out for /popup/* pages.
export default async function SharePopupPage({
  searchParams,
}: PageProps<"/popup/share">) {
  const product = await getProduct((await searchParams).product);

  return (
    <main className="flex flex-col gap-4 bg-white p-6">
      {product ? (
        <>
          <h1 className="text-xl font-semibold">Share {product.name}</h1>
          <ShareActions name={product.name} slug={product.slug} />
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold">Share</h1>
          <p role="alert" className="text-red-700">
            Product not found.
          </p>
        </>
      )}
    </main>
  );
}
