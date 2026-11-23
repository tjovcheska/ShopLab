"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { addToWishlistAction } from "@/lib/wishlist-actions";

export function WishlistButton({
  productId,
  initiallySaved,
}: {
  productId: number;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await addToWishlistAction(productId);
      if (!result.ok && result.reason === "login-required") {
        const here = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(here)}`);
        return;
      }
      if (result.ok) {
        setSaved(true);
        showToast({ title: "Added to wishlist", description: result.message });
      }
    });
  }

  if (saved) {
    return (
      <a href="/account/wishlist" className="text-sm text-indigo-700 underline">
        ♥ In your wishlist
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={add}
      disabled={pending}
      className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
    >
      ♡ Add to wishlist
    </button>
  );
}
