import { resolveUrl } from "../utils/url.js";
import { fetchCsrfToken } from "./csrf.js";
export async function submitForm(options, params) {
    const fetchFn = options.fetch ?? fetch;
    const { manifest, request, files } = params;
    const csrf = await resolveCsrf(options, params);
    const submitUrl = resolveUrl(options.baseUrl, manifest.endpoints.submit.url);
    const hasFiles = files && Object.keys(files).length > 0;
    if (hasFiles) {
        return submitMultipart(fetchFn, submitUrl, options, request, files, csrf);
    }
    return submitJson(fetchFn, submitUrl, options, request, csrf);
}
async function resolveCsrf(options, params) {
    if (params.csrf !== undefined) {
        return params.csrf;
    }
    if (!params.manifest.security.csrf?.required) {
        return null;
    }
    const endpoint = params.manifest.security.csrf.tokenEndpoint ??
        params.manifest.endpoints.csrf?.url ??
        "/freeform/tokens";
    return fetchCsrfToken({
        baseUrl: options.baseUrl,
        endpoint,
        fetch: options.fetch,
        credentials: options.credentials,
    });
}
async function submitJson(fetchFn, url, options, request, csrf) {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    if (csrf) {
        headers["X-CSRF-Token"] = csrf.value;
    }
    const body = buildJsonBody(request, options.clientVersion);
    const response = await fetchFn(url, {
        method: "POST",
        credentials: options.credentials ?? "include",
        headers,
        body: JSON.stringify(body),
    });
    return parseSubmitResponse(response);
}
async function submitMultipart(fetchFn, url, options, request, files, csrf) {
    const formData = new FormData();
    const payload = buildJsonBody(request, options.clientVersion);
    formData.append("_freeform", JSON.stringify(payload));
    if (csrf) {
        formData.append(csrf.name, csrf.value);
    }
    for (const [handle, fileValue] of Object.entries(files)) {
        const list = Array.isArray(fileValue) ? fileValue : [fileValue];
        for (const file of list) {
            formData.append(`files[${handle}][]`, file);
        }
    }
    const response = await fetchFn(url, {
        method: "POST",
        credentials: options.credentials ?? "include",
        headers: { Accept: "application/json" },
        body: formData,
    });
    return parseSubmitResponse(response);
}
function buildJsonBody(request, clientVersion) {
    return {
        values: request.values,
        intent: request.intent,
        context: request.context ?? {},
        meta: {
            client: "@solspace/freeform-core",
            clientVersion,
            ...request.meta,
        },
    };
}
async function parseSubmitResponse(response) {
    const data = (await response.json());
    return {
        ...data,
        errors: data.errors ?? { fields: {}, form: [], page: [] },
    };
}
