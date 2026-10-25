import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { expect, it } from "vitest";
import { createApp, h, nextTick } from "vue";
import type { FreeformRuntime } from "../types.js";
import FieldRenderer from "./FieldRenderer.vue";

const field = (handle: string, type: string): ManifestFieldDefinition => ({
  id: 1,
  uid: handle,
  handle,
  type,
  label: handle,
  required: false,
});
it.each(["button-link", "video", "icon"])(
  "renders server-generated %s without an input label",
  async (type) => {
    const definition = {
      ...field("content", type),
      frontend: { renderer: "html" },
      content: { rendered: { html: "<div>Presentation content</div>" } },
    };
    const form = {
      fieldErrors: {},
      values: {},
      isFieldVisible: () => true,
      getFieldProps: () => ({}),
    } as unknown as FreeformRuntime;
    const host = document.createElement("div");
    const app = createApp({
      render: () =>
        h(FieldRenderer, {
          field: definition,
          form,
          theme: {},
          renderers: {},
          allowRawHtml: true,
        }),
    });
    app.mount(host);
    await nextTick();
    expect(host.textContent).toContain("Presentation content");
    expect(host.querySelector("label")).toBeNull();
    app.unmount();
  },
);
it("renders independently stacked columns and includes their responsive styles without a separate stylesheet import", async () => {
  const answer = field("answer", "text");
  const column = {
    ...field("column", "layout-column"),
    layout: { rows: [{ uid: "inside", fields: ["answer"] }] },
  };
  const layout = {
    ...field("layout", "layout"),
    layout: {
      rows: [{ uid: "columns", fields: ["column"] }],
      columns: "2fr 1fr",
      gap: 32,
      stack: true,
      verticalAlignment: "center",
      cardStyle: {
        "--freeform-card-background": "#fff",
        "--freeform-card-radius": "12px",
      },
      appearance: {
        "--freeform-background-color": "#334155",
        "--freeform-min-height": "320px",
      },
    },
  };
  const form = {
    fieldErrors: {},
    values: { answer: "Saved answer" },
    manifest: { fields: { answer, column, layout } },
    isFieldVisible: () => true,
    getFieldProps: (handle: string) => ({
      id: `freeform-${handle}`,
      value: "Saved answer",
      onChange: () => {},
    }),
  } as unknown as FreeformRuntime;
  const host = document.createElement("div");
  const app = createApp({
    render: () =>
      h(FieldRenderer, { field: layout, form, theme: {}, renderers: {} }),
  });
  app.mount(host);
  await nextTick();
  expect(
    host.querySelector(".ff-layout-columns")?.getAttribute("data-stack"),
  ).toBe("true");
  expect(host.querySelector("style")?.textContent).toContain("@media");
  expect(host.querySelector("input")?.value).toBe("Saved answer");
  expect(
    host.querySelector(".ff-layout-columns")?.getAttribute("data-appearance"),
  ).toBe("true");
  expect(
    (
      host.querySelector(".ff-layout-columns") as HTMLElement
    ).style.getPropertyValue("--freeform-background-color"),
  ).toBe("#334155");
  expect(
    host.querySelector(".ff-layout-columns")?.getAttribute("data-cards"),
  ).toBe("true");
  expect(
    (
      host.querySelector(".ff-layout-columns") as HTMLElement
    ).style.getPropertyValue("--freeform-card-radius"),
  ).toBe("12px");
  expect(
    Array.from(host.querySelectorAll("label")).map((el) => el.textContent),
  ).toEqual(["answer"]);
  app.unmount();
});

it("places a Form section's controls inside its form when nested in a column", async () => {
  const answer = field("answer", "text");
  const section = {
    ...field("formSection", "form-section"),
    layout: { rows: [{ uid: "form-row", fields: ["answer"] }] },
  };
  const column = {
    ...field("column", "layout-column"),
    layout: { rows: [{ uid: "column-row", fields: ["formSection"] }] },
  };
  const form = {
    fieldErrors: {},
    formErrors: [],
    values: {},
    currentPageIndex: 0,
    manifest: {
      fields: { answer, section, formSection: section, column },
      layout: {
        pages: [{ rows: [], buttons: { submit: { label: "Submit" } } }],
      },
      security: {},
    },
    isFieldVisible: () => true,
    getFieldProps: () => ({}),
    handleSubmit: () => {},
  } as unknown as FreeformRuntime;
  const host = document.createElement("div");
  const app = createApp({
    render: () =>
      h(FieldRenderer, { field: column, form, theme: {}, renderers: {} }),
  });
  app.mount(host);
  await nextTick();
  const formTag = host.querySelector("form");
  expect(host.querySelectorAll("form")).toHaveLength(1);
  expect(formTag?.querySelector("input")).not.toBeNull();
  expect(formTag?.querySelector('button[type="submit"]')).not.toBeNull();
  app.unmount();
});
