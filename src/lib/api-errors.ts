import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors } from "@/lib/errors";

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
  return apiError(400, "VALIDATION_ERROR", "Request validation failed.", {
    fields: fieldErrors(error),
  });
}
