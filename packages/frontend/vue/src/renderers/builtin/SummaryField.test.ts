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
