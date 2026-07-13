function parseSetCookie(header) {
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
function storeCookies(store, response) {
  const headers = response.headers;
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie")]
        : [];
  for (const cookie of setCookies) {
    const parsed = parseSetCookie(cookie);
    if (parsed) {
      store.set(parsed.name, parsed.value);
    }
  }
}
function cookieHeader(store) {
  if (store.size === 0) {
    return undefined;
  }
  return [...store.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}
export function createCookieFetch(baseFetch = fetch) {
  const store = new Map();
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
