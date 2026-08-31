import { resolveUrl } from "../utils/url.js";

export type CsrfToken = {
  name: string;
  value: string;
};

type TokenResponse = {
  csrf?: CsrfToken;
};

export type CsrfFetchOptions = {
  baseUrl: string;
  endpoint?: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
};

export async function fetchCsrfToken(
  options: CsrfFetchOptions,
): Promise<CsrfToken | null> {
  const fetchFn = options.fetch ?? fetch;
  const endpoint = options.endpoint ?? "/freeform/tokens";
  const response = await fetchFn(resolveUrl(options.baseUrl, endpoint), {
    method: "GET",
    credentials: options.credentials ?? "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token (${response.status}).`);
  }

  const data = (await response.json()) as TokenResponse;

  return data.csrf?.name && data.csrf?.value ? data.csrf : null;
}
