import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * Every API error uses the same JSON shape:
 *   { "error": { "code": string, "message": string, "details"?: object } }
 */
export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

/** 400 response listing which query/body fields were invalid. */
export function validationError(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)";
    fields[key] ??= issue.message;
  }
  return apiError(400, "VALIDATION_ERROR", "Request validation failed.", {
    fields,
  });
}
