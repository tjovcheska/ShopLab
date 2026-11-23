// Building blocks shared by every /api/v1 and /api/test route handler.
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-errors";
import { withChaos } from "@/lib/chaos";
import { db } from "@/lib/db";
import { ShopError, validationFailure } from "@/lib/errors";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

type Handler<Context> = (
  request: NextRequest,
  context: Context,
) => Promise<Response>;

/**
 * A thrown ShopError becomes its JSON error response; anything else becomes
 * 500 INTERNAL_ERROR (and is logged).
 */
export function handleErrors<Context>(
  handler: Handler<Context>,
): Handler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ShopError) {
        return apiError(error.status, error.code, error.message, error.details);
      }
      console.error(error);
      return apiError(500, "INTERNAL_ERROR", "Something went wrong.");
    }
  };
}

/** For /api/v1 routes: chaos delay / flaky mode + JSON errors. */
export function apiRoute<Context = unknown>(handler: Handler<Context>) {
  return withChaos(handleErrors(handler));
}

/**
 * For /api/test routes: a JSON 404 unless TEST_HOOKS_ENABLED=true, and no
 * chaos (health checks and resets must not fail randomly or slow down).
 */
export function testRoute<Context = unknown>(handler: Handler<Context>) {
  const inner = handleErrors(handler);
  return async (request: NextRequest, context: Context) => {
    if (process.env.TEST_HOOKS_ENABLED !== "true") {
      return apiError(404, "NOT_FOUND", "Not found.");
    }
    return inner(request, context);
  };
}

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

export const noContent = () => new Response(null, { status: 204 });

/** Parses the JSON body and validates it. Throws 400 on failure. */
export async function readJson<Schema extends z.ZodType>(
  request: NextRequest,
  schema: Schema,
): Promise<z.output<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ShopError(
      400,
      "INVALID_JSON",
      "The request body must be valid JSON.",
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw validationFailure(parsed.error);
  return parsed.data;
}

/** Like readJson, but an empty body counts as {} (for optional bodies). */
export async function readOptionalJson<Schema extends z.ZodType>(
  request: NextRequest,
  schema: Schema,
): Promise<z.output<Schema>> {
  const text = await request.text();
  let body: unknown = {};
  if (text.trim() !== "") {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ShopError(
        400,
        "INVALID_JSON",
        "The request body must be valid JSON.",
      );
    }
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw validationFailure(parsed.error);
  return parsed.data;
}

const idMessage = "Must be a positive whole number.";
const idSchema = z.coerce
  .number({ error: idMessage })
  .int(idMessage)
  .positive(idMessage);

/** Parses an `:id` path parameter. Throws 400 if it is not a positive integer. */
export function parseId(raw: string, name = "id"): number {
  const parsed = z.object({ [name]: idSchema }).safeParse({ [name]: raw });
  if (!parsed.success) throw validationFailure(parsed.error);
  return parsed.data[name] as number;
}

export type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
};

/**
 * The caller, from `Authorization: Bearer <token>` or else the session
 * cookie. Both carry the same signed token (see src/lib/session.ts).
 * A Bearer header that is present but invalid is an error, not "anonymous".
 */
export async function getApiUser(
  request: NextRequest,
): Promise<ApiUser | null> {
  const header = request.headers.get("authorization");
  let userId: number | null;
  if (header !== null) {
    const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
    userId = match ? verifySessionToken(match[1]) : null;
    if (userId === null) {
      throw new ShopError(
        401,
        "UNAUTHORIZED",
        "Invalid or expired bearer token.",
      );
    }
  } else {
    userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (userId === null) return null;
  }
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function requireApiUser(request: NextRequest): Promise<ApiUser> {
  const user = await getApiUser(request);
  if (!user) {
    throw new ShopError(
      401,
      "UNAUTHORIZED",
      "Authentication required. Send the session cookie or an Authorization: Bearer <token> header.",
    );
  }
  return user;
}

export async function requireApiAdmin(request: NextRequest): Promise<ApiUser> {
  const user = await requireApiUser(request);
  if (user.role !== "admin") {
    throw new ShopError(403, "FORBIDDEN", "Admin access required.");
  }
  return user;
}
