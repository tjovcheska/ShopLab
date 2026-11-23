import type { Metadata } from "next";
import { KanbanBoard } from "./kanban-board";
import { SortableList } from "./sortable-list";

export const metadata: Metadata = { title: "Drag and drop playground" };

export default function DragDropPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Drag and drop playground</h1>
        <p className="mt-2 text-gray-600">
          Both widgets use native HTML5 drag and drop (<code>draggable</code>,{" "}
          <code>dragstart</code>, <code>dragover</code>, <code>drop</code>).
          Every item also has buttons that do the same thing without dragging.
        </p>
      </div>
      <SortableList />
      <KanbanBoard />
    </div>
  );
}
