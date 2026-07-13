import { fetchCsrfToken } from "./client/csrf.js";
import { fetchManifest } from "./client/manifest-client.js";
import { submitForm } from "./client/submit-client.js";
import { createExtensionRegistry } from "./extensions/registry.js";
import { createFormState } from "./state/form-state.js";
export const PACKAGE_VERSION = "5.15.19";
export const CLIENT_NAME = "@solspace/freeform-core";
export class FreeformClient {
  baseUrl;
  clientVersion;
  fetch;
  credentials;
  extensions = createExtensionRegistry();
  constructor(options) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.clientVersion = options.clientVersion ?? PACKAGE_VERSION;
    this.fetch = options.fetch ?? fetch;
    this.credentials = options.credentials ?? "include";
  }
  async loadManifest(params) {
    const manifest = await fetchManifest(this.asClientOptions(), params);
    this.extensions.assertRequired(manifest.requiredExtensions ?? []);
    return manifest;
  }
  createState(manifest) {
    return createFormState({ manifest });
  }
  async submit(params) {
    return submitForm(this.asClientOptions(), params);
  }
  async fetchCsrf(manifest) {
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
  asClientOptions() {
    return {
      baseUrl: this.baseUrl,
      clientVersion: this.clientVersion,
      fetch: this.fetch,
      credentials: this.credentials,
    };
  }
}
export function createFreeformClient(options) {
  return new FreeformClient(options);
}
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
};
