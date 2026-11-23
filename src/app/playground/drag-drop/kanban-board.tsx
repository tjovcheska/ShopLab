"use client";

import { useState, type DragEvent } from "react";

type Column = "todo" | "done";

const COLUMNS: { id: Column; title: string }[] = [
  { id: "todo", title: "To do" },
  { id: "done", title: "Done" },
];

type Card = { id: string; title: string; column: Column };

const INITIAL: Card[] = [
  { id: "c1", title: "Write login test", column: "todo" },
  { id: "c2", title: "Add page objects", column: "todo" },
  { id: "c3", title: "Fix flaky checkout test", column: "todo" },
  { id: "c4", title: "Set up CI", column: "done" },
];

/** Drag a card into the other column (drop anywhere on the column). */
export function KanbanBoard() {
  const [cards, setCards] = useState(INITIAL);
  const [overColumn, setOverColumn] = useState<Column | null>(null);

  function moveCard(id: string, column: Column) {
    setCards((list) => {
      const card = list.find((c) => c.id === id);
      if (!card || card.column === column) return list;
      // Moved cards go to the bottom of their new column.
      return [...list.filter((c) => c.id !== id), { ...card, column }];
    });
  }

  function handleDrop(event: DragEvent<HTMLElement>, column: Column) {
    event.preventDefault();
    moveCard(event.dataTransfer.getData("text/plain"), column);
    setOverColumn(null);
  }

  return (
    <section
      aria-labelledby="board-heading"
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 id="board-heading" className="mb-1 text-xl font-semibold">
        Task board
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Drag cards between the two columns.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {COLUMNS.map((column) => {
          const columnCards = cards.filter((c) => c.column === column.id);
          const other = COLUMNS.find((c) => c.id !== column.id)!;
          return (
            <section
              key={column.id}
              aria-label={column.title}
              data-testid={`column-${column.id}`}
              onDragOver={(e) => {
                e.preventDefault(); // allows dropping here
                setOverColumn(column.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn(null);
                }
              }}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex min-h-48 flex-col gap-2 rounded-md border-2 border-dashed p-3 ${
                overColumn === column.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h3 className="font-semibold">
                {column.title} ({columnCards.length})
              </h3>
              <ul className="flex flex-col gap-2">
                {columnCards.map((card) => (
                  <li
                    key={card.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", card.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setOverColumn(null)}
                    className="flex cursor-grab items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <span>{card.title}</span>
                    <button
                      type="button"
                      aria-label={`Move “${card.title}” to ${other.title}`}
                      onClick={() => moveCard(card.id, other.id)}
                      className="rounded px-2 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      {column.id === "todo" ? "→" : "←"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
