import type { EventParametersProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import EventParameters from "./event-parameters";

const { fields } = vi.hoisted(() => ({
  fields: [
    {
      uid: "insurance-uid",
      typeClass: "Dropdown",
      properties: { label: "Insurance type", handle: "insurance" },
    },
    {
      uid: "office-uid",
      typeClass: "Radios",
      properties: { label: "Office location", handle: "office" },
    },
    {
      uid: "email-uid",
      typeClass: "Email",
      properties: { label: "Email", handle: "email" },
    },
    {
      uid: "name-uid",
      typeClass: "Text",
      properties: { label: "Name", handle: "name" },
    },
  ],
}));
vi.mock("react-redux", () => ({ useSelector: () => fields }));
vi.mock("@editor/store/slices/layout/fields/fields.selectors", () => ({
  fieldSelectors: { all: () => fields },
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFetchFieldTypes: () => ({
    isPending: false,
    data: ["Dropdown", "Radios", "Email", "Text"].map((typeClass) => ({
      typeClass,
      type: typeClass.toLowerCase(),
    })),
  }),
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});
function mount(initial: [string, string][] = []) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const changed = vi.fn();
  const property = {
    type: PropertyType.EventParameters,
    handle: "eventParameters",
    availableFieldTypes: ["dropdown", "radios"],
  } as EventParametersProperty;
  function Editor() {
    const [value, setValue] = useState(initial);
    return (
      <EventParameters
        property={property}
        value={value}
        updateValue={(next) => {
          setValue(next ?? []);
          changed(next);
        }}
      />
    );
  }
  act(() => root.render(<Editor />));
  return changed;
}
it("adds a mapping using stable field UIDs, limits choices to supported fields, and removes it", () => {
  const changed = mount();
  expect(container.textContent).not.toContain("form_name");
  act(() => container.querySelector<HTMLButtonElement>("button")!.click());
  const select = container.querySelector("select")!;
  expect(Array.from(select.options).map((option) => option.value)).toEqual([
    "",
    "insurance-uid",
    "office-uid",
  ]);
  act(() => {
    select.value = "insurance-uid";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(changed).toHaveBeenLastCalledWith([["", "insurance-uid"]]);
  act(() =>
    container
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Remove parameter 1"]',
      )!
      .click(),
  );
  expect(changed).toHaveBeenLastCalledWith([]);
});
it("keeps missing mappings visible for correction without changing saved values", () => {
  const changed = mount([["insurance_type", "deleted-uid"]]);
  expect(container.querySelector("select")!.value).toBe("deleted-uid");
  expect(container.textContent).toContain(
    "Mapped field no longer exists or is unsupported",
  );
  expect(changed).not.toHaveBeenCalled();
});
