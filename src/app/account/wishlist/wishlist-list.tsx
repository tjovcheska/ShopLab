"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type DragEvent } from "react";
import { z } from "zod";
import { formatPrice } from "@/lib/format";
import {
  removeFromWishlistAction,
  reorderWishlistAction,
} from "@/lib/wishlist-actions";

type Item = {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    priceCents: number;
    stock: number;
    imageUrl: string;
  };
};

/** Moves the item at `from` so that it ends up at index `to`. */
function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const emailSchema = z.email();

/**
 * Reorder with native HTML5 drag and drop (drop a product onto another to
 * take its place) or with the up/down buttons. Every change is saved.
 */
export function WishlistList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [, startTransition] = useTransition();

  function save(next: Item[], previous: Item[]) {
    setItems(next);
    setStatus("Saving…");
    startTransition(async () => {
      const result = await reorderWishlistAction(next.map((item) => item.id));
      if (!result.ok) setItems(previous); // undo if the server refused
      setStatus(result.message);
    });
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, targetId: number) {
    event.preventDefault();
    const draggedId = Number(event.dataTransfer.getData("text/plain"));
    const from = items.findIndex((item) => item.id === draggedId);
    const to = items.findIndex((item) => item.id === targetId);
    setDragging(null);
    setOver(null);
    if (from >= 0 && to >= 0 && from !== to) save(move(items, from, to), items);
  }

  function remove(item: Item) {
    const previous = items;
    setItems(items.filter((i) => i.id !== item.id));
    startTransition(async () => {
      const result = await removeFromWishlistAction(item.id);
      if (!result.ok) setItems(previous);
      setStatus(result.ok ? `Removed ${item.product.name}.` : result.message);
    });
  }

  // Native browser dialogs: prompt() asks for an address, alert() answers.
  function share() {
    const email = window.prompt(
      "Who should we send your wishlist to? Enter their email address.",
    );
    if (email === null) return; // Cancel
    const trimmed = email.trim();
    if (!emailSchema.safeParse(trimmed).success) {
      window.alert(`“${trimmed}” is not a valid email address.`);
      return;
    }
    window.alert(`Your wishlist was sent to ${trimmed}.`);
    setStatus(`Shared with ${trimmed}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ol aria-label="Wishlist" className="flex max-w-2xl flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => {
              // Firefox only starts a drag if some data is set.
              e.dataTransfer.setData("text/plain", String(item.id));
              e.dataTransfer.effectAllowed = "move";
              setDragging(item.id);
            }}
            onDragEnter={() => setOver(item.id)}
            onDragOver={(e) => e.preventDefault()} // allows dropping here
            onDragLeave={() => setOver((o) => (o === item.id ? null : o))}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            className={`flex cursor-grab items-center gap-3 rounded-lg border bg-white p-3 ${
              over === item.id && dragging !== item.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200"
            } ${dragging === item.id ? "opacity-50" : ""}`}
          >
            <span aria-hidden="true" className="text-gray-400">
              ⠿
            </span>
            <Image
              src={item.product.imageUrl}
              alt=""
              width={64}
              height={48}
              className="h-12 w-16 rounded object-cover"
            />
            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-medium hover:text-indigo-700"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-600">
                {formatPrice(item.product.priceCents)}
                {item.product.stock === 0 && " · Out of stock"}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Move ${item.product.name} up`}
              disabled={index === 0}
              onClick={() => save(move(items, index, index - 1), items)}
              className="rounded px-2 hover:bg-gray-100 disabled:text-gray-300"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${item.product.name} down`}
              disabled={index === items.length - 1}
              onClick={() => save(move(items, index, index + 1), items)}
              className="rounded px-2 hover:bg-gray-100 disabled:text-gray-300"
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`Remove ${item.product.name} from wishlist`}
              onClick={() => remove(item)}
              className="rounded px-2 text-sm text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={share}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Share wishlist
        </button>
        <p
          role="status"
          data-testid="wishlist-status"
          className="text-sm text-gray-600"
        >
          {status}
        </p>
      </div>
    </div>
  );
}
