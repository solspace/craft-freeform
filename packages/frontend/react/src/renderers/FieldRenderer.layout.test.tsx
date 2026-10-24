import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import type { FreeformRuntime } from "../types.js";
import { FieldRenderer } from "./FieldRenderer.js";

const field = (handle: string, type: string): ManifestFieldDefinition => ({
  id: 1,
  uid: handle,
  handle,
  type,
  label: handle,
  required: false,
});
it("renders nested column fields without exposing container labels and respects their visibility", () => {
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
    isFieldVisible: (handle: string) => handle !== "hidden",
    getFieldProps: (handle: string) => ({
      id: `freeform-${handle}`,
      value: "Saved answer",
      onChange: () => {},
    }),
  } as unknown as FreeformRuntime;
  const view = render(
    <FieldRenderer field={layout} form={form} theme={{}} renderers={{}} />,
  );
  expect(
    view.container
      .querySelector(".ff-layout-columns")
      ?.getAttribute("data-stack"),
  ).toBe("true");
  expect(view.container.querySelector("input")?.value).toBe("Saved answer");
  expect(
    view.container
      .querySelector(".ff-layout-columns")
      ?.getAttribute("data-appearance"),
  ).toBe("true");
  expect(
    (
      view.container.querySelector(".ff-layout-columns") as HTMLElement
    ).style.getPropertyValue("--freeform-background-color"),
  ).toBe("#334155");
  expect(
    view.container
      .querySelector(".ff-layout-columns")
      ?.getAttribute("data-cards"),
  ).toBe("true");
  expect(
    (
      view.container.querySelector(".ff-layout-columns") as HTMLElement
    ).style.getPropertyValue("--freeform-card-radius"),
  ).toBe("12px");
  expect(
    Array.from(view.container.querySelectorAll("label")).map(
      (el) => el.textContent,
    ),
  ).toEqual(["answer"]);
  view.rerender(
    <FieldRenderer
      field={layout}
      form={{ ...form, isFieldVisible: (handle) => handle !== "answer" }}
      theme={{}}
      renderers={{}}
    />,
  );
  expect(view.container.querySelector("input")).toBeNull();
});
it.each(["heading", "button-link", "video", "icon"])(
  "renders server-generated %s without adding an input label",
  (type) => {
    const heading = {
      ...field("intro", type),
      frontend: { renderer: "html" },
      content: { rendered: { html: "<h2>Welcome</h2>" } },
    };
    const form = {
      fieldErrors: {},
      values: {},
      isFieldVisible: () => true,
      getFieldProps: () => ({}),
    } as unknown as FreeformRuntime;
    const view = render(
      <FieldRenderer
        field={heading}
        form={form}
        theme={{}}
        renderers={{}}
        allowRawHtml
      />,
    );
    expect(view.container.querySelector("h2")?.textContent).toBe("Welcome");
    expect(view.container.querySelector("label")).toBeNull();
  },
);
