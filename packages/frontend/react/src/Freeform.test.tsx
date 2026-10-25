import type { FreeformManifest } from "@solspace/freeform-core";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Freeform } from "./components/Freeform.js";

const manifest: FreeformManifest = {
  schemaVersion: "1.0",
  pluginVersion: "5.15.19",
  minimumClientVersion: "0.1.0",
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
  it("keeps Page content outside the Form section's submit boundary", async () => {
    const pageManifest: FreeformManifest = {
      ...manifest,
      form: { ...manifest.form, type: "Page" },
      layout: {
        pages: [
          {
            ...manifest.layout.pages[0]!,
            rows: [{ uid: "canvas", fields: ["intro", "column"] }],
          },
        ],
      },
      fields: {
        ...manifest.fields,
        intro: {
          id: 3,
          uid: "intro",
          handle: "intro",
          type: "heading",
          label: "Intro",
          required: false,
          frontend: { renderer: "html", extension: null },
          content: { rendered: { html: "<h2>Outside the form</h2>" } },
        },
        column: {
          id: 4,
          uid: "column",
          handle: "column",
          type: "layout-column",
          label: "Column",
          required: false,
          layout: { rows: [{ uid: "column-row", fields: ["formSection"] }] },
        },
        formSection: {
          id: 5,
          uid: "formSection",
          handle: "formSection",
          type: "form-section",
          label: "Form",
          required: false,
          layout: { rows: [{ uid: "form-row", fields: ["name"] }] },
        },
      },
    };
    const view = render(
      <Freeform
        baseUrl="https://example.com"
        manifest={pageManifest}
        allowRawHtml
      />,
    );
    const input = await screen.findByLabelText(/Name/);
    const formTag = view.container.querySelector("form");
    expect(view.container.querySelectorAll("form")).toHaveLength(1);
    expect(formTag?.contains(input)).toBe(true);
    expect(
      formTag?.contains(screen.getByRole("button", { name: "Submit" })),
    ).toBe(true);
    expect(formTag?.contains(view.container.querySelector("h2"))).toBe(false);
    expect(
      view.container.querySelector(".ff-page-canvas")?.contains(formTag),
    ).toBe(true);
    view.unmount();
  });

  it("applies an optional form background without changing input styles", async () => {
    const view = render(
      <Freeform
        baseUrl="https://example.com"
        manifest={{
          ...manifest,
          settings: { ...manifest.settings, backgroundColor: "#eaf0f6" },
        }}
      />,
    );
    const input = await screen.findByLabelText(/Name/);
    expect(view.container.querySelector("form")?.style.backgroundColor).toBe(
      "rgb(234, 240, 246)",
    );
    expect(input.getAttribute("style")).toBeNull();
    view.unmount();
    const legacy = render(
      <Freeform baseUrl="https://example.com" manifest={manifest} />,
    );
    await screen.findByLabelText(/Name/);
    expect(legacy.container.querySelector("form")?.style.backgroundColor).toBe(
      "",
    );
    legacy.unmount();
  });

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
