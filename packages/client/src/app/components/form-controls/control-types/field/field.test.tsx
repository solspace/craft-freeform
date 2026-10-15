import type { Field } from "@ff-client/types/fields";
import type { FieldProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import FieldControl from "./field";

const { fields } = vi.hoisted(() => ({
  fields: [
    {
      uid: "product-uid",
      typeClass: "Hidden",
      properties: { label: "Product" },
    },
    { uid: "number-uid", typeClass: "Number", properties: { label: "Number" } },
    { uid: "table-uid", typeClass: "Table", properties: { label: "Table" } },
  ],
}));

vi.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({ fields }),
}));
vi.mock("@editor/store/slices/layout/fields/fields.selectors", () => ({
  fieldSelectors: { all: (state: { fields: Field[] }) => state.fields },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: null }),
}));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldTypeSearch: () => (typeClass: string) => ({
    type: typeClass.toLowerCase(),
    implements: typeClass === "Table" ? ["table"] : ["text"],
  }),
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({
    options,
    value,
    emptyOption,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    emptyOption: string;
    onChange: (value: string) => void;
  }) => (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{emptyOption}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

let root: Root;
let container: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

const mount = (filter: Partial<FieldProperty> = {}) => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const update = vi.fn();
  const property: FieldProperty = {
    type: PropertyType.Field,
    handle: "duplicateCheckScopeField",
    emptyOption: "Entire form (no field scope)",
    ...filter,
  };
  act(() =>
    root.render(
      <FieldControl
        value="product-uid"
        property={property}
        updateValue={update}
      />,
    ),
  );
  return update;
};

describe("Field picker", () => {
  it("limits scope choices to supported scalar field types and stores the field UID", () => {
    const update = mount({ availableFieldTypes: ["hidden", "number"] });
    const select = container.querySelector("select");
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      "",
      "product-uid",
      "number-uid",
    ]);
    act(() => {
      select.value = "number-uid";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(update).toHaveBeenCalledWith("number-uid");
  });

  it("keeps unrestricted field pickers unchanged", () => {
    mount();
    expect(container.querySelectorAll("option")).toHaveLength(4);
  });

  it("retains existing interface filters", () => {
    mount({ implements: ["text"] });
    expect(
      Array.from(container.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toEqual(["", "product-uid", "number-uid"]);
  });
});
