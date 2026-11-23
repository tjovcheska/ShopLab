"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { submitReviewAction, type ReviewFormState } from "@/lib/review-actions";

const initialState: ReviewFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

/**
 * The star rating is a <shoplab-rating> Web Component: its buttons live in an
 * OPEN shadow root (see src/components/shoplab-rating-element.ts). The chosen
 * value is copied into a hidden input so the form can submit it.
 * Photos use a multiple file input.
 */
export function ReviewForm({
  productId,
  alreadyReviewed,
}: {
  productId: number;
  alreadyReviewed: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitReviewAction.bind(null, productId),
    initialState,
  );
  const [rating, setRating] = useState(0);
  const ratingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Define the custom element in the browser only (it extends HTMLElement).
    import("@/components/shoplab-rating-element");
    const element = ratingRef.current;
    function onChange(event: Event) {
      setRating((event as CustomEvent<{ value: number }>).detail.value);
    }
    element?.addEventListener("rating-change", onChange);
    return () => element?.removeEventListener("rating-change", onChange);
  }, []);

  if (state.ok) {
    return (
      <p
        role="status"
        className="rounded-md bg-green-50 px-4 py-3 text-green-800"
      >
        {state.message}
      </p>
    );
  }

  if (alreadyReviewed) {
    return <p className="text-gray-600">You have reviewed this product.</p>;
  }

  // Submit by hand: React resets a form after <form action> runs, which
  // would wipe the comment when the server reports an error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const errors = state.fieldErrors;
  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      aria-label="Write a review"
      className="flex max-w-xl flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h3 className="text-lg font-semibold">Write a review</h3>

      {state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Your rating</span>
        <shoplab-rating
          ref={ratingRef}
          id="review-rating"
          label="Your rating"
          value="0"
          aria-describedby={errors.rating ? "review-rating-error" : undefined}
        />
        <input type="hidden" name="rating" value={rating} />
        {errors.rating && (
          <p id="review-rating-error" className="text-sm text-red-600">
            {errors.rating}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Your review
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={4}
          maxLength={1000}
          aria-invalid={errors.comment ? true : undefined}
          aria-describedby={errors.comment ? "review-comment-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.comment && (
          <p id="review-comment-error" className="text-sm text-red-600">
            {errors.comment}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-photos" className="text-sm font-medium">
          Add photos (optional, up to 3)
        </label>
        <input
          id="review-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          data-testid="review-photos"
          aria-describedby={errors.photos ? "review-photos-error" : undefined}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
        />
        {errors.photos && (
          <p id="review-photos-error" className="text-sm text-red-600">
            {errors.photos}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Submit review"}
      </button>
    </form>
  );
}
