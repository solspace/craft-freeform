import { describe, expect, it } from "vitest";
import type { FreeformManifest } from "../types/manifest.js";
import { FormState } from "./form-state.js";

const manifest: FreeformManifest = {
  schemaVersion: "1.0",
  pluginVersion: "5.16.0",
  minimumClientVersion: "0.1.0",
  generatedAt: "2026-08-16T00:00:00Z",
  site: {
    id: 1,
    handle: "default",
    language: "en",
    baseUrl: "https://example.com",
  },
  form: {
    id: 1,
    uid: "form-uid",
    handle: "multiPage",
    name: "Multi Page",
    type: "form",
    multiPage: true,
  },
  endpoints: {
    manifest: { method: "GET", url: "/manifest" },
    submit: {
      method: "POST",
      url: "/submit",
      encodings: ["application/json"],
      defaultEncoding: "application/json",
    },
  },
  settings: { multiPage: true, ajax: true, mode: "public" },
  layout: {
    pages: [
      {
        id: 1,
        uid: "page-1",
        index: 0,
        label: "Page 1",
        buttons: { back: null, next: null, submit: { label: "Next" } },
        rows: [],
      },
      {
        id: 2,
        uid: "page-2",
        index: 1,
        label: "Page 2",
        buttons: {
          back: { label: "Back" },
          next: null,
          submit: { label: "Submit" },
        },
        rows: [],
      },
    ],
  },
  fields: {},
  conditionals: { fields: [], pages: [], buttons: [], submit: [] },
  security: {},
};

describe("FormState", () => {
  it("resends the server-issued multi-page state token", () => {
    const state = new FormState({ manifest });

    state.applySubmitResponse({
      success: true,
      status: "page_valid",
      complete: false,
      page: { currentIndex: 1 },
      state: { pageIndex: 1, token: "state-token" },
      errors: { fields: {}, form: [], page: [] },
    });

    expect(state.currentPageIndex).toBe(1);
    expect(state.getSubmitContext()).toEqual({ stateToken: "state-token" });
  });
});
