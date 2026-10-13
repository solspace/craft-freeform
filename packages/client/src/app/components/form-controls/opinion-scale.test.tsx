import { Fields } from "@ff-client/types/field.classes";
import {
  type Property,
  PropertyType,
  type TabularDataProperty,
} from "@ff-client/types/properties";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OpinionScaleProperty } from "./opinion-scale";

const mode = vi.hoisted(() => ({ translating: false }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({ willTranslate: () => mode.translating }),
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@components/form-controls/preview/preview-slideout", () => ({
  PreviewSlideout: ({
    preview,
    children,
    onAfterEdit,
  }: {
    preview: ReactNode;
    children: ReactNode;
    onAfterEdit: () => void;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {preview}
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        {open && (
          <>
            {children}
            <button
              type="button"
              onClick={() => {
                onAfterEdit();
                setOpen(false);
              }}
            >
              Finish
            </button>
          </>
        )}
      </>
    );
  },
}));
vi.mock(
  "@components/form-controls/control-types/tabular-data/tabular-data.editor",
  () => ({
    TabularDataEditor: ({
      property,
      values,
      updateValue,
    }: {
      property: TabularDataProperty;
      values: string[][];
      updateValue: (value: string[][]) => void;
    }) => (
      <button
        type="button"
        onClick={() =>
          updateValue([
            ...values,
            property.handle === "scales" ? ["", ""] : [""],
          ])
        }
      >
        Add {property.handle}
      </button>
    ),
  }),
);
const properties = [
  {
    handle: "scales",
    label: "Scales",
    type: PropertyType.TabularData,
    configuration: [
      { key: "value", label: "Value", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
  },
  {
    handle: "legends",
    label: "Legends",
    type: PropertyType.TabularData,
    configuration: [{ key: "label", label: "Legend", type: "text" }],
  },
] as TabularDataProperty[];
const initial = {
  scales: [
    ["0", "Zero"],
    ["1", "One"],
  ],
  legends: [["Disagree"], ["Agree"]],
};
let root: Root;
let container: HTMLDivElement;
const updates = vi.fn();
function Fixture({
  typeClass = Fields.OpinionScale,
  available = properties,
}: {
  typeClass?: Fields;
  available?: Property[];
}) {
  const [values, setValues] = useState(initial);
  return (
    <>
      {available.map((property) => (
        <OpinionScaleProperty
          key={property.handle}
          typeClass={typeClass}
          property={property}
          properties={available}
          renderProperty={(item, Control) =>
            Control ? (
              <Control
                property={item}
                value={values[item.handle as keyof typeof values]}
                updateValue={(value) => {
                  updates(item.handle, value);
                  setValues((previous) => ({
                    ...previous,
                    [item.handle]: value,
                  }));
                }}
              />
            ) : (
              <span>{item.handle} fallback</span>
            )
          }
        />
      ))}
      <output>{JSON.stringify(values)}</output>
    </>
  );
}
function click(label: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (item) => item.textContent === label,
  );
  expect(button).toBeDefined();
  act(() => button!.click());
}
function stored() {
  return JSON.parse(container.querySelector("output")!.textContent!);
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mode.translating = false;
  updates.mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
describe("combined Opinion Scale configuration", () => {
  it("opens one editor and updates both existing arrays independently", () => {
    act(() => root.render(<Fixture />));
    expect(container.querySelectorAll("button")).toHaveLength(1);
    click("Open");
    click("Add scales");
    click("Add legends");
    expect(stored()).toEqual({
      scales: [...initial.scales, ["", ""]],
      legends: [...initial.legends, [""]],
    });
    expect(updates.mock.calls.map(([handle]) => handle)).toEqual([
      "scales",
      "legends",
    ]);
    click("Finish");
    expect(stored()).toEqual(initial);
    expect(updates.mock.calls.slice(2).map(([handle]) => handle)).toEqual([
      "scales",
      "legends",
    ]);
  });
  it("does not rewrite existing rows merely by opening and closing", () => {
    act(() => root.render(<Fixture />));
    click("Open");
    click("Finish");
    expect(updates).not.toHaveBeenCalled();
    expect(stored()).toEqual(initial);
  });
  it("does not clean or overwrite translated row data on close", () => {
    mode.translating = true;
    act(() => root.render(<Fixture />));
    click("Open");
    click("Add legends");
    updates.mockClear();
    click("Finish");
    expect(updates).not.toHaveBeenCalled();
    expect(stored().legends).toEqual([...initial.legends, [""]]);
  });
  it("keeps other field types and incomplete property pairs on their original controls", () => {
    act(() => root.render(<Fixture typeClass={Fields.Table} />));
    expect(container.textContent).toContain("scales fallback");
    expect(container.textContent).toContain("legends fallback");
    expect(container.querySelector("button")).toBeNull();
    act(() => root.render(<Fixture available={[properties[0]]} />));
    expect(container.textContent).toContain("scales fallback");
    expect(container.querySelector("button")).toBeNull();
  });
});
