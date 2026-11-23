"use client";

import { useEffect, useRef, useState } from "react";
import {
  earliestDeliveryDate,
  formatLongDate,
  isSelectableDeliveryDate,
  latestDeliveryDate,
  parseISODate,
  toISODate,
} from "@/lib/dates";

const WEEKDAYS = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
];

type Month = { year: number; month: number }; // month: 0–11

function monthOf(iso: string): Month {
  const date = parseISODate(iso);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function shiftMonth({ year, month }: Month, delta: number): Month {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

const monthKey = (m: Month) => m.year * 12 + m.month;

/** The weeks (Mon–Sun rows) of a month; null = day outside the month. */
function calendarWeeks({ year, month }: Month): (string | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (string | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * A custom date picker (not <input type="date">). A button opens a calendar
 * popup; weekends, dates before the earliest delivery day, and dates more
 * than 60 days ahead are disabled. `today` is "YYYY-MM-DD".
 */
export function DatePicker({
  id,
  label,
  value,
  onChange,
  today,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  today: string;
  error?: string;
}) {
  const earliest = earliestDeliveryDate(today);
  const latest = latestDeliveryDate(today);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState<Month>(monthOf(value || earliest));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const errorId = `${id}-error`;
  const monthLabelId = `${id}-month`;

  // While open: Escape (wherever focus is) or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !popupRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // When the calendar opens, move focus to the selected (or first
  // available) day so keyboard users can Tab through the dates.
  useEffect(() => {
    if (!open) return;
    const popup = popupRef.current;
    const day =
      popup?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]') ??
      popup?.querySelector<HTMLButtonElement>("td button:not(:disabled)");
    day?.focus();
  }, [open]);

  function toggle() {
    if (!open) setVisible(monthOf(value || earliest));
    setOpen(!open);
  }

  function pick(iso: string) {
    onChange(iso);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const canGoBack = monthKey(visible) > monthKey(monthOf(earliest));
  const canGoForward = monthKey(visible) < monthKey(monthOf(latest));
  const monthName = new Date(visible.year, visible.month, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative w-fit">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={error ? errorId : undefined}
          data-testid="delivery-date-button"
          onClick={toggle}
          className={`min-w-72 rounded-md border bg-white px-3 py-2 text-left ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          {value ? formatLongDate(value) : "Choose a date"}
        </button>

        {open && (
          <div
            ref={popupRef}
            role="dialog"
            aria-label="Choose delivery date"
            className="absolute top-full left-0 z-30 mt-1 w-80 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoBack}
                onClick={() => setVisible((m) => shiftMonth(m, -1))}
                className="rounded px-2 py-1 hover:bg-gray-100 disabled:text-gray-300"
              >
                ‹
              </button>
              <p id={monthLabelId} aria-live="polite" className="font-semibold">
                {monthName}
              </p>
              <button
                type="button"
                aria-label="Next month"
                disabled={!canGoForward}
                onClick={() => setVisible((m) => shiftMonth(m, 1))}
                className="rounded px-2 py-1 hover:bg-gray-100 disabled:text-gray-300"
              >
                ›
              </button>
            </div>
            <table
              aria-labelledby={monthLabelId}
              className="w-full text-center text-sm"
            >
              <thead>
                <tr>
                  {WEEKDAYS.map(([short, full]) => (
                    <th
                      key={short}
                      scope="col"
                      abbr={full}
                      className="py-1 font-medium text-gray-500"
                    >
                      {short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarWeeks(visible).map((week, i) => (
                  <tr key={i}>
                    {week.map((iso, j) => (
                      <td key={j} className="p-0.5">
                        {iso && (
                          <button
                            type="button"
                            aria-label={formatLongDate(iso)}
                            aria-pressed={iso === value}
                            disabled={!isSelectableDeliveryDate(iso, today)}
                            onClick={() => pick(iso)}
                            className={`h-9 w-9 rounded-full ${
                              iso === value
                                ? "bg-indigo-600 text-white"
                                : "hover:bg-indigo-50"
                            } disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent`}
                          >
                            {parseISODate(iso).getDate()}
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500">
              Weekends are unavailable. Earliest delivery:{" "}
              {formatLongDate(earliest)}.
            </p>
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
