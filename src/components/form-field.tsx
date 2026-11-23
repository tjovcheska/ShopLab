"use client";

import { useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { useAdoptDomValue } from "@/lib/use-adopt-dom-value";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

/**
 * A labelled input with an optional hint and error message below it.
 * The input points at both with aria-describedby, and sets aria-invalid when
 * there is an error, so tests can use getByLabel() and
 * toHaveAccessibleDescription() / toHaveAttribute("aria-invalid", "true").
 *
 * For controlled inputs (value + onChange), text typed before React hydrated
 * the page is kept (see useAdoptDomValue).
 */
export function FormField({
  id,
  label,
  error,
  hint,
  ...inputProps
}: FormFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  useAdoptDomValue(ref, String(inputProps.value ?? ""), () => {
    const input = ref.current;
    if (input && inputProps.value !== undefined && inputProps.onChange) {
      // Same shape the parent's onChange reads: event.target.value.
      inputProps.onChange({
        target: input,
        currentTarget: input,
      } as ChangeEvent<HTMLInputElement>);
    }
  });

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
        }`}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
