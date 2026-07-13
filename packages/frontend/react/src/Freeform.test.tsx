import type { FreeformManifest } from "@solspace/freeform-core";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Freeform } from "./components/Freeform.js";

const manifest: FreeformManifest = {
  schemaVersion: "1.0",
  pluginVersion: "5.15.19",
  minimumClientVersion: "5.15.0",
  generatedAt: "2026-01-01T00:00:00Z",
  site: {
    id: 1,
    handle: "default",
    language: "en",
    baseUrl: "https://example.com",
  },
  form: {
    id: 1,
    uid: "form-uid",
    handle: "simpleForm",
    name: "Simple",
    type: "form",
    multiPage: false,
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
  settings: {
    multiPage: false,
    ajax: true,
    mode: "submit",
    successMessage: "Thanks!",
  },
  layout: {
    pages: [
      {
        id: 1,
        uid: "page-1",
        index: 0,
        label: "Page 1",
        buttons: { back: null, next: null, submit: { label: "Submit" } },
        rows: [{ uid: "row-1", fields: ["name", "email"] }],
      },
    ],
  },
  fields: {
    name: {
      id: 1,
      uid: "f1",
      handle: "name",
      type: "text",
      label: "Name",
      required: true,
      frontend: { renderer: "text", extension: null },
    },
    email: {
      id: 2,
      uid: "f2",
      handle: "email",
      type: "email",
      label: "Email",
      required: true,
      frontend: { renderer: "email", extension: null },
    },
  },
  conditionals: { fields: [], pages: [], buttons: [], submit: [] },
  security: {},
};

describe("Freeform", () => {
  it("renders fields from a preloaded manifest", async () => {
    const fetchMock = vi.fn();
    render(
      <Freeform
        baseUrl="https://example.com"
        manifest={manifest}
        fetch={fetchMock}
      />,
    );

    expect(await screen.findByLabelText(/Name/)).toBeTruthy();
    expect(screen.getByLabelText(/Email/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });

  it("supports render-prop mode", async () => {
    render(
      <Freeform baseUrl="https://example.com" manifest={manifest}>
        {(form) => (
          <div data-testid="count">{Object.keys(form.values).length}</div>
        )}
      </Freeform>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("0");
    });
  });
});
