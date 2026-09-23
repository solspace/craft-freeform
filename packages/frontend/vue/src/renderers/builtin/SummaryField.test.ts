import type { FreeformManifest } from "@solspace/freeform-core";
import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import type { VueFieldRendererProps } from "../../types.js";
import { SummaryFieldRenderer } from "./SummaryField.js";

it("renders escaped answers without raw HTML and updates from runtime state", async () => {
  const props = {
    field: { handle: "review", frontend: { config: { fields: ["name"] } } },
    form: {
      manifest: {
        fields: { name: { handle: "name", label: "Name", type: "text" } },
      } as unknown as FreeformManifest,
      values: { name: "<img src=x onerror=alert(1)>" },
      isFieldVisible: () => true,
    },
    classNames: {},
  } as VueFieldRendererProps;
  const view = mount(SummaryFieldRenderer, { props });
  expect(view.get("dd").text()).toBe(props.form.values.name);
  expect(view.find("img").exists()).toBe(false);
  await view.setProps({ form: { ...props.form, values: { name: "Updated" } } });
  expect(view.get("dd").text()).toBe("Updated");
  await view.setProps({ form: { ...props.form, isFieldVisible: () => false } });
  expect(view.find("dd").exists()).toBe(false);
});

it.each([
  '<img src=x onerror="alert(1)">',
  '<svg onload="alert(1)"></svg>',
  "<scr<script>ipt>alert(1)</script>",
  "<script",
  "Age < 18 & score > 5",
])("renders hostile or HTML-like labels as text: %s", (label) => {
  const props = {
    field: { handle: "review", frontend: { config: { fields: ["name"] } } },
    form: {
      manifest: {
        fields: { name: { handle: "name", label, type: "text" } },
      } as unknown as FreeformManifest,
      values: { name: "Answer" },
      isFieldVisible: () => true,
    },
    classNames: {},
  } as VueFieldRendererProps;
  const view = mount(SummaryFieldRenderer, { props });
  const term = view.get("dt").element;
  expect(term?.textContent).toBe(label);
  expect(term?.children.length).toBe(0);
  view.unmount();
});
