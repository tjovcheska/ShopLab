// Browser-side helper for calling ShopLab's own API.

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * fetch() for /api/... paths. If the page URL has ?delay=<ms>, the same
 * delay is forwarded to the API, so "?delay" works on any page.
 * (The shoplab_delay / shoplab_flaky cookies are sent automatically.)
 * Throws ApiError for non-2xx responses.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = new URL(path, window.location.origin);
  const pageDelay = new URLSearchParams(window.location.search).get("delay");
  if (pageDelay && !url.searchParams.has("delay")) {
    url.searchParams.set("delay", pageDelay);
  }

  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `Request failed with status ${response.status}.`,
    );
  }
  return body as T;
}
