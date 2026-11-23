"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * A tooltip that is ADDED to the DOM only while the mouse is over the trigger
 * (and removed when it leaves). Hover-only on purpose: focus and click do not
 * open it, so tests must use hover().
 */
export function HoverTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="cursor-help border-b border-dashed border-gray-500 text-sm"
      >
        {label}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-full left-0 z-20 mt-2 w-64 rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
        >
          {children}
        </span>
      )}
    </span>
  );
}
