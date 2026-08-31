import { resolveUrl } from "../utils/url.js";
export async function fetchCsrfToken(options) {
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
    const data = (await response.json());
    return data.csrf?.name && data.csrf?.value ? data.csrf : null;
}
