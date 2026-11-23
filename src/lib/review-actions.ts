"use server";
// "Write a review" form on the product page.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";
import { createReview } from "@/lib/services/reviews";
import { filesFrom } from "@/lib/upload";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export type ReviewFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Partial<Record<"rating" | "comment" | "photos", string>>;
};

const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Choose a rating from 1 to 5 stars.")
    .max(5, "Choose a rating from 1 to 5 stars."),
  comment: z
    .string()
    .trim()
    .min(1, "Write a few words about the product.")
    .max(1000, "Keep it under 1000 characters."),
});

export async function submitReviewAction(
  productId: number,
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      message: "Please log in to write a review.",
      fieldErrors: {},
    };
  }

  const fieldErrors: ReviewFormState["fieldErrors"] = {};
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating") ?? "0",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "rating" | "comment";
      fieldErrors[field] ??= issue.message;
    }
  }

  const photos = filesFrom(formData, "photos");
  if (photos.length > MAX_PHOTOS) {
    fieldErrors.photos = `Attach at most ${MAX_PHOTOS} photos.`;
  } else if (photos.some((f) => !f.type.startsWith("image/"))) {
    fieldErrors.photos = "Photos must be image files.";
  } else if (photos.some((f) => f.size > MAX_PHOTO_BYTES)) {
    fieldErrors.photos = "Each photo must be 2 MB or smaller.";
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: null, fieldErrors };
  }

  try {
    await createReview(
      user.id,
      productId,
      parsed.data,
      // Only the name, size, and type of each photo are stored.
      photos.map((f) => ({
        fileName: f.name,
        sizeBytes: f.size,
        mimeType: f.type,
      })),
    );
  } catch (error) {
    if (error instanceof ShopError) {
      return { ok: false, message: error.message, fieldErrors: {} };
    }
    throw error;
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (product) revalidatePath(`/products/${product.slug}`);
  return {
    ok: true,
    message: "Thanks! Your review has been posted.",
    fieldErrors: {},
  };
}
