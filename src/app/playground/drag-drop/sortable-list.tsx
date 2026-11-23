"use client";

import { useState, type DragEvent } from "react";

const INITIAL = ["Apples", "Bananas", "Cherries", "Dates", "Elderberries"];

/** Moves the item at `from` so that it ends up at index `to`. */
function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Drop an item onto another item: the dragged item takes that item's place,
 * and the items in between shift by one.
 */
export function SortableList() {
  const [items, setItems] = useState(INITIAL);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function handleDragStart(event: DragEvent<HTMLLIElement>, item: string) {
    // Firefox only starts a drag if some data is set.
    event.dataTransfer.setData("text/plain", item);
    event.dataTransfer.effectAllowed = "move";
    setDragging(item);
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, target: string) {
    event.preventDefault();
    const dragged = event.dataTransfer.getData("text/plain");
    const from = items.indexOf(dragged);
    const to = items.indexOf(target);
    if (from >= 0 && to >= 0 && from !== to) setItems(move(items, from, to));
    setDragging(null);
    setOver(null);
  }

  return (
    <section
      aria-labelledby="sortable-heading"
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 id="sortable-heading" className="mb-1 text-xl font-semibold">
        Sortable list
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Drag a fruit onto another one to reorder the list.
      </p>
      <ol
        aria-label="Fruits"
        data-testid="sortable-list"
        className="flex max-w-md flex-col gap-2"
      >
        {items.map((item, index) => (
          <li
            key={item}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnter={() => setOver(item)}
            onDragOver={(e) => e.preventDefault()} // allows dropping here
            onDragLeave={() => setOver((o) => (o === item ? null : o))}
            onDrop={(e) => handleDrop(e, item)}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            className={`flex cursor-grab items-center gap-3 rounded-md border px-3 py-2 ${
              over === item && dragging !== item
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-gray-50"
            } ${dragging === item ? "opacity-50" : ""}`}
          >
            <span aria-hidden="true" className="text-gray-400">
              ⠿
            </span>
            <span className="flex-1">{item}</span>
            <button
              type="button"
              aria-label={`Move ${item} up`}
              disabled={index === 0}
              onClick={() => setItems(move(items, index, index - 1))}
              className="rounded px-2 hover:bg-gray-200 disabled:text-gray-300"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${item} down`}
              disabled={index === items.length - 1}
              onClick={() => setItems(move(items, index, index + 1))}
              className="rounded px-2 hover:bg-gray-200 disabled:text-gray-300"
            >
              ↓
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-gray-700" aria-live="polite">
        Order: <span data-testid="sortable-order">{items.join(", ")}</span>
      </p>
      <button
        type="button"
        onClick={() => setItems(INITIAL)}
        className="mt-2 text-sm text-indigo-700 underline"
      >
        Reset list
      </button>
    </section>
  );
}
