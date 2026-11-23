import type { z } from "zod";

/**
 * An expected failure (not a bug) with an HTTP status and a stable code,
 * e.g. new ShopError(409, "EMAIL_TAKEN", "An account with this email…").
 *
 * Services throw it. The REST API turns it into
 *   { "error": { "code", "message", "details"? } }
 * and the web pages show its message.
 */
export class ShopError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

/** One message per invalid field, e.g. { "shippingAddress.city": "…" }. */
export function fieldErrors(
  error: z.ZodError,
  prefix = "",
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key =
      [prefix, ...issue.path].filter((p) => p !== "").join(".") || "(root)";
    fields[key] ??= issue.message;
  }
  return fields;
}

/** 400 VALIDATION_ERROR listing the invalid fields. */
export function validationFailure(error: z.ZodError, prefix = ""): ShopError {
  return new ShopError(400, "VALIDATION_ERROR", "Request validation failed.", {
    fields: fieldErrors(error, prefix),
  });
}
