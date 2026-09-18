import type { FreeformManifest } from "@solspace/freeform-core";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { SummaryFieldRenderer } from "./SummaryField.js";

it("renders escaped answers without raw HTML and updates from runtime state", () => {
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
  } as ReactFieldRendererProps;
  const view = render(<SummaryFieldRenderer {...props} />);
  expect(view.container.querySelector("dd")?.textContent).toBe(
    props.form.values.name,
  );
  expect(view.container.querySelector("img")).toBeNull();
  view.rerender(
    <SummaryFieldRenderer
      {...props}
      form={{ ...props.form, values: { name: "Updated" } }}
    />,
  );
  expect(view.container.querySelector("dd")?.textContent).toBe("Updated");
  view.rerender(
    <SummaryFieldRenderer
      {...props}
      form={{ ...props.form, isFieldVisible: () => false }}
    />,
  );
  expect(view.container.querySelector("dd")).toBeNull();
});
