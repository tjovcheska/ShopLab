"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Region } from "@/lib/regions";

/**
 * A custom dropdown built from <div>s (the ARIA "select-only combobox"
 * pattern), NOT a native <select>. Playwright's selectOption() does not work
 * on it: open it with a click, then click an option.
 *
 * Keyboard: Enter/Space/ArrowDown opens; ArrowUp/ArrowDown/Home/End move;
 * Enter/Space picks; Escape closes; typing a letter jumps to that option.
 */
export function RegionSelect({
  id,
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Select…",
}: {
  id: string;
  label: string;
  options: Region[];
  value: string;
  onChange: (code: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboRef = useRef<HTMLDivElement>(null);

  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const selectedIndex = options.findIndex((o) => o.code === value);
  const selected = options[selectedIndex];

  function openList() {
    setOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function choose(index: number) {
    onChange(options[index].code);
    setOpen(false);
    comboRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (activeIndex >= 0) choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        // Type-ahead: jump to the first option starting with that letter.
        if (event.key.length === 1) {
          const index = options.findIndex((o) =>
            o.name.toLowerCase().startsWith(event.key.toLowerCase()),
          );
          if (index >= 0) setActiveIndex(index);
        }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-sm font-medium">
        {label}
      </span>
      <div className="relative">
        <div
          ref={comboRef}
          id={id}
          role="combobox"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          data-testid="region-select"
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}
          className={`flex cursor-pointer items-center justify-between rounded-md border bg-white px-3 py-2 focus:ring-2 focus:outline-none ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        >
          <span className={selected ? "" : "text-gray-400"}>
            {selected ? selected.name : placeholder}
          </span>
          <span aria-hidden="true">▾</span>
        </div>

        {open && (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {options.map((option, index) => (
              <div
                key={option.code}
                id={optionId(index)}
                role="option"
                aria-selected={option.code === value}
                // Keep focus on the combobox so onBlur does not close the
                // list before the click is handled.
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`cursor-pointer px-3 py-2 ${
                  index === activeIndex ? "bg-indigo-50 text-indigo-900" : ""
                } ${option.code === value ? "font-semibold" : ""}`}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
