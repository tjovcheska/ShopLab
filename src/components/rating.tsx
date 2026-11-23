/** Star rating: stars are hidden from assistive tech, the text is not. */
export function Rating({ value }: { value: number }) {
  return (
    <p className="text-sm text-amber-600">
      <span aria-hidden="true">
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
      <span className="sr-only">Rated {value} out of 5</span>
    </p>
  );
}
