// Calendar-date helpers for the delivery date picker.
//
// Delivery dates are plain calendar dates written as "YYYY-MM-DD" strings,
// with no time and no time zone, so the browser and the server agree on
// which day was picked. (They are stored as midnight UTC in the database.)

export const EARLIEST_DELIVERY_DAYS = 2; // earliest = 2 days from today
export const DELIVERY_WINDOW_DAYS = 60; // how far ahead dates can be picked

/** "YYYY-MM-DD" for a Date, using its local calendar day. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses "YYYY-MM-DD" into a Date at local midnight. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isWeekend(iso: string): boolean {
  const day = parseISODate(iso).getDay();
  return day === 0 || day === 6;
}

export function isValidISODate(iso: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(iso) && toISODate(parseISODate(iso)) === iso
  );
}

/** The first weekday that is at least 2 days after `today`. */
export function earliestDeliveryDate(today: string): string {
  let date = addDays(today, EARLIEST_DELIVERY_DAYS);
  while (isWeekend(date)) date = addDays(date, 1);
  return date;
}

export function latestDeliveryDate(today: string): string {
  return addDays(today, DELIVERY_WINDOW_DAYS);
}

/** True if `iso` can be picked: a weekday between earliest and latest. */
export function isSelectableDeliveryDate(iso: string, today: string): boolean {
  return (
    isValidISODate(iso) &&
    !isWeekend(iso) &&
    iso >= earliestDeliveryDate(today) &&
    iso <= latestDeliveryDate(today)
  );
}

/** "Wednesday, November 25, 2026" */
export function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Server-side check. The browser picked the date using the customer's own
 * "today", which can be a day before or after the server's. Accept a date
 * that is valid for either neighbouring day.
 */
export function isAcceptableDeliveryDate(iso: string, serverToday: string) {
  return (
    isValidISODate(iso) &&
    !isWeekend(iso) &&
    iso >= earliestDeliveryDate(addDays(serverToday, -1)) &&
    iso <= latestDeliveryDate(addDays(serverToday, 1))
  );
}
