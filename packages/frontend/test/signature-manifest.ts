import type { FreeformManifest } from "../core/src/types/manifest.js";

export const signatureManifest: FreeformManifest = {
  schemaVersion: "1.0",
  pluginVersion: "5.17.2",
  minimumClientVersion: "1.0.0",
  generatedAt: "2026-10-19T00:00:00Z",
  site: {
    id: 1,
    handle: "default",
    language: "en",
    baseUrl: "https://example.test",
  },
  form: {
    id: 1,
    uid: "signature-form",
    handle: "signatureForm",
    name: "Signature form",
    type: "form",
    multiPage: false,
  },
  fields: {
    signature: {
      id: 1,
      uid: "signature",
      handle: "signature",
      type: "signature",
      label: "Signature",
      required: true,
      defaultValue: "",
      frontend: { renderer: "signature", extension: "signature", config: {} },
    },
  },
  layout: { pages: [] },
  endpoints: {
    manifest: { method: "GET", url: "/manifest" },
    submit: {
      method: "POST",
      url: "/submit",
      encodings: ["application/json"],
      defaultEncoding: "application/json",
    },
  },
  settings: { multiPage: false, ajax: true, mode: "submit" },
  conditionals: { fields: [], pages: [], buttons: [], submit: [] },
  security: {},
};
