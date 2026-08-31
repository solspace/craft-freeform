type CookieStore = Map<string, string>;

function parseSetCookie(
  header: string,
): { name: string; value: string } | null {
  const [pair] = header.split(";");
  const index = pair.indexOf("=");
  if (index === -1) {
    return null;
  }

  return {
    name: pair.slice(0, index).trim(),
    value: pair.slice(index + 1).trim(),
  };
}

function storeCookies(store: CookieStore, response: Response): void {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie") as string]
        : [];

  for (const cookie of setCookies) {
    const parsed = parseSetCookie(cookie);
    if (parsed) {
      store.set(parsed.name, parsed.value);
    }
  }
}

function cookieHeader(store: CookieStore): string | undefined {
  if (store.size === 0) {
    return undefined;
  }

  return [...store.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function createCookieFetch(
  baseFetch: typeof fetch = fetch,
): typeof fetch {
  const store: CookieStore = new Map();

  return async (input, init) => {
    const headers = new Headers(init?.headers);
    const existingCookie = cookieHeader(store);

    if (existingCookie) {
      headers.set("Cookie", existingCookie);
    }

    const response = await baseFetch(input, {
      ...init,
      credentials: init?.credentials ?? "include",
      headers,
    });

    storeCookies(store, response);

    return response;
  };
}
