import { describe, expect, it } from "vitest";
import type { FreeformManifest } from "../types/manifest.js";
import { FormState } from "./form-state.js";

const baseManifest: FreeformManifest = {
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
    const state = new FormState({ manifest: baseManifest });

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

  it("does not seed unchecked checkbox defaults as the checked value", () => {
    const manifest: FreeformManifest = {
      ...baseManifest,
      fields: {
        newsletter: {
          id: 1,
          uid: "newsletter",
          handle: "newsletter",
          type: "checkbox",
          label: "Subscribe",
          required: false,
          defaultValue: "yes",
          frontend: {
            config: { checkedByDefault: false, checkedValue: "yes" },
          },
        },
      },
    };

    const state = new FormState({ manifest });
    expect(state.getValue("newsletter")).toBe("");
    expect(state.getValuesForSubmit()).toEqual({ newsletter: "" });
  });

  it("seeds checked-by-default checkboxes with the configured value", () => {
    const manifest: FreeformManifest = {
      ...baseManifest,
      fields: {
        agree: {
          id: 1,
          uid: "agree",
          handle: "agree",
          type: "checkbox",
          label: "Agree",
          required: true,
          defaultValue: "yes",
          frontend: {
            config: { checkedByDefault: true, checkedValue: "yes" },
          },
        },
      },
    };

    const state = new FormState({ manifest });
    expect(state.getValue("agree")).toBe("yes");
  });

  it("honors profile hidden/locked fields and resends properties", () => {
    const manifest: FreeformManifest = {
      ...baseManifest,
      fields: {
        title: {
          id: 1,
          uid: "title",
          handle: "title",
          type: "text",
          label: "Title",
          required: true,
        },
        eventId: {
          id: 2,
          uid: "eventId",
          handle: "eventId",
          type: "hidden",
          label: "Event",
          required: false,
        },
        status: {
          id: 3,
          uid: "status",
          handle: "status",
          type: "text",
          label: "Status",
          required: false,
          defaultValue: "open",
        },
      },
      context: {
        defaultValues: { eventId: "42", status: "open" },
        hiddenFields: ["eventId"],
        lockedFields: ["status"],
      },
    };

    const state = new FormState({
      manifest,
      properties: { eventId: 42 },
    });

    expect(state.isFieldVisible("eventId")).toBe(false);
    expect(state.isFieldEnabled("status")).toBe(false);
    state.setValue("status", "hacked");
    expect(state.getValue("status")).toBe("open");
    expect(state.getValuesForSubmit()).toMatchObject({
      eventId: "42",
      status: "open",
    });
    expect(state.getSubmitProperties()).toEqual({ eventId: 42 });
  });
});
