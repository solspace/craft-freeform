import type { FreeformManifest } from "../types/manifest.js";
import type {
  SubmitFileMap,
  SubmitRequest,
  SubmitResponse,
} from "../types/submit.js";
import { resolveUrl } from "../utils/url.js";
import { type CsrfToken, fetchCsrfToken } from "./csrf.js";

export type SubmitClientOptions = {
  baseUrl: string;
  clientVersion: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
};

export type SubmitOptions = {
  manifest: FreeformManifest;
  request: SubmitRequest;
  files?: SubmitFileMap;
  csrf?: CsrfToken | null;
};

export async function submitForm(
  options: SubmitClientOptions,
  params: SubmitOptions,
): Promise<SubmitResponse> {
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

async function resolveCsrf(
  options: SubmitClientOptions,
  params: SubmitOptions,
): Promise<CsrfToken | null> {
  if (params.csrf !== undefined) {
    return params.csrf;
  }

  if (!params.manifest.security.csrf?.required) {
    return null;
  }

  const endpoint =
    params.manifest.security.csrf.tokenEndpoint ??
    params.manifest.endpoints.csrf?.url ??
    "/freeform/tokens";

  return fetchCsrfToken({
    baseUrl: options.baseUrl,
    endpoint,
    fetch: options.fetch,
    credentials: options.credentials,
  });
}

async function submitJson(
  fetchFn: typeof fetch,
  url: string,
  options: SubmitClientOptions,
  request: SubmitRequest,
  csrf: CsrfToken | null,
): Promise<SubmitResponse> {
  const headers: Record<string, string> = {
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

async function submitMultipart(
  fetchFn: typeof fetch,
  url: string,
  options: SubmitClientOptions,
  request: SubmitRequest,
  files: SubmitFileMap,
  csrf: CsrfToken | null,
): Promise<SubmitResponse> {
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

function buildJsonBody(
  request: SubmitRequest,
  clientVersion: string,
): Record<string, unknown> {
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

async function parseSubmitResponse(
  response: Response,
): Promise<SubmitResponse> {
  const data = (await response.json()) as SubmitResponse;

  return {
    ...data,
    errors: data.errors ?? { fields: {}, form: [], page: [] },
  };
}
