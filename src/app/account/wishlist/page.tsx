import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listWishlist } from "@/lib/services/wishlist";
import { WishlistList } from "./wishlist-list";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");
  const items = await listWishlist(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Your wishlist</h1>
        <p className="mt-2 text-gray-600">
          Drag products to put your favourites first. The order is saved
          automatically.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-600" data-testid="empty-wishlist">
          Your wishlist is empty.{" "}
          <Link href="/products" className="text-indigo-700 underline">
            Find something you like
          </Link>
        </p>
      ) : (
        <WishlistList
          initialItems={items.map((item) => ({
            id: item.id,
            product: item.product,
          }))}
        />
      )}
    </div>
  );
}
