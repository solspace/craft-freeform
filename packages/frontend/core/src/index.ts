import { fetchCsrfToken } from "./client/csrf.js";
import {
  type FetchManifestOptions,
  fetchManifest,
} from "./client/manifest-client.js";
import { type SubmitOptions, submitForm } from "./client/submit-client.js";
import { createExtensionRegistry } from "./extensions/registry.js";
import { createFormState, type FormState } from "./state/form-state.js";
import type { FreeformManifest } from "./types/manifest.js";
import type { SubmitResponse } from "./types/submit.js";
import { PACKAGE_VERSION } from "./version.js";

export { PACKAGE_VERSION } from "./version.js";
export const CLIENT_NAME = "@solspace/freeform-core";

export type FreeformClientOptions = {
  baseUrl: string;
  clientVersion?: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
};

export class FreeformClient {
  readonly baseUrl: string;

  readonly clientVersion: string;

  readonly fetch: typeof globalThis.fetch;

  readonly credentials: RequestCredentials;

  readonly extensions = createExtensionRegistry();

  constructor(options: FreeformClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.clientVersion = options.clientVersion ?? PACKAGE_VERSION;
    this.fetch = options.fetch ?? fetch;
    this.credentials = options.credentials ?? "include";
  }

  async loadManifest(params: FetchManifestOptions): Promise<FreeformManifest> {
    const manifest = await fetchManifest(this.asClientOptions(), params);
    this.extensions.assertRequired(manifest.requiredExtensions ?? []);

    return manifest;
  }

  createState(manifest: FreeformManifest): FormState {
    return createFormState({ manifest });
  }

  async submit(params: SubmitOptions): Promise<SubmitResponse> {
    return submitForm(this.asClientOptions(), params);
  }

  async fetchCsrf(manifest: FreeformManifest) {
    const endpoint =
      manifest.security.csrf?.tokenEndpoint ??
      manifest.endpoints.csrf?.url ??
      "/freeform/tokens";

    return fetchCsrfToken({
      baseUrl: this.baseUrl,
      endpoint,
      fetch: this.fetch,
      credentials: this.credentials,
    });
  }

  private asClientOptions() {
    return {
      baseUrl: this.baseUrl,
      clientVersion: this.clientVersion,
      fetch: this.fetch,
      credentials: this.credentials,
    };
  }
}

export function createFreeformClient(
  options: FreeformClientOptions,
): FreeformClient {
  return new FreeformClient(options);
}

export * from "./calculation/evaluate.js";
export * from "./client/csrf.js";
export * from "./client/manifest-client.js";
export * from "./client/submit-client.js";
export * from "./conditionals/evaluator.js";
export * from "./conditionals/operators.js";
export * from "./extensions/registry.js";
export * from "./state/form-state.js";
export * from "./types/manifest.js";
export * from "./types/submit.js";
export * from "./utils/cookie-fetch.js";
export * from "./utils/url.js";

export const FIELD_RENDERERS = {
  TEXT: "text",
  TEXTAREA: "textarea",
  EMAIL: "email",
  NUMBER: "number",
  PHONE: "phone",
  HIDDEN: "hidden",
  SELECT: "select",
  CHECKBOX: "checkbox",
  CHECKBOXES: "checkboxes",
  RADIO: "radio",
  FILE: "file",
  DATETIME: "datetime",
  CONFIRMATION: "confirmation",
  RATING: "rating",
  OPINION_SCALE: "opinion-scale",
  SIGNATURE: "signature",
  TABLE: "table",
  HTML: "html",
  BUTTON: "button",
  SUBMIT: "submit",
  CALCULATION: "calculation",
} as const;
