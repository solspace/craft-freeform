import { Fields } from "@ff-client/types/field.classes";
import { type Property, PropertyType } from "@ff-client/types/properties";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { OpinionScaleProperty } from "./opinion-scale";

const drag = vi.hoisted(() => ({
  move: undefined as undefined | ((from: number, to: number) => void),
}));
vi.mock("@components/form-controls/draggable-row", () => ({
  DraggableRow: ({
    children,
    onDrop,
  }: {
    children: ReactNode;
    onDrop: (from: number, to: number) => void;
  }) => {
    if (Array.isArray(children) && children[0]) drag.move = onDrop;
    return <tr>{children}</tr>;
  },
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { is: { atLeast: () => true } } } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, args: Record<string, unknown> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(args[key] ?? key)),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    willTranslate: () => false,
    hasTranslation: () => false,
    getTranslation: (_handle: string, value: unknown) => value,
  }),
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@components/form-controls/preview/preview-slideout", () => ({
  PreviewSlideout: ({
    preview,
    children,
    onEdit,
    onCancel,
    onAfterEdit,
  }: {
    preview: ReactNode;
    children: ReactNode;
    onEdit: () => void;
    onCancel: () => void;
    onAfterEdit: () => void;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {preview}
        <button
          type="button"
          onClick={() => {
            onEdit();
            setOpen(true);
          }}
        >
          Open
        </button>
        {open && (
          <div role="dialog">
            {children}
            <button
              type="button"
              onClick={() => {
                onCancel();
                setOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onAfterEdit();
                setOpen(false);
              }}
            >
              Finish
            </button>
          </div>
        )}
      </>
    );
  },
}));

const properties = [
  {
    handle: "scales",
    label: "Scales",
    type: PropertyType.TabularData,
    configuration: [
      { key: "value", label: "Value", type: "text" },
      { key: "label", label: "Label", type: "text", translatable: true },
    ],
  },
  {
    handle: "legends",
    label: "Legends",
    type: PropertyType.TabularData,
    configuration: [
      { key: "legend", label: "Legend", type: "text", translatable: true },
    ],
  },
  { handle: "defaultValue", label: "Default value", type: PropertyType.String },
] as Property[];
let host: HTMLDivElement;
let root: Root;
const initialRows = [
  ["0", "Zero"],
  ["1", "One"],
  ["", ""],
];
function render(defaultValue = "1", readonly = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const available = properties.map((property) =>
    property.handle === "defaultValue"
      ? { ...property, disabled: readonly }
      : property,
  );
  const Fixture = () => {
    const [values, setValues] = useState({
      scales: initialRows,
      legends: [["Low"], ["High"]],
      defaultValue,
    });
    return (
      <>
        {available.map((property) => (
          <OpinionScaleProperty
            key={property.handle}
            typeClass={Fields.OpinionScale}
            property={property}
            properties={available}
            renderProperty={(item, Control) =>
              Control ? (
                <Control
                  property={item}
                  value={values[item.handle as keyof typeof values]}
                  context={{ properties: values }}
                  updateValue={(value) =>
                    setValues((previous) => ({
                      ...previous,
                      [item.handle]: value,
                    }))
                  }
                />
              ) : (
                <input data-plain-default />
              )
            }
          />
        ))}
        <output>{JSON.stringify(values)}</output>
      </>
    );
  };
  act(() => root.render(<Fixture />));
}
function click(text: string) {
  act(() =>
    Array.from(host.querySelectorAll("button"))
      .find((button) => button.textContent === text)!
      .click(),
  );
}
function switches() {
  return Array.from(
    host.querySelectorAll<HTMLButtonElement>('[role="switch"]'),
  );
}
function values() {
  return JSON.parse(host.querySelector("output")!.textContent!);
}
function input(index: number, value: string) {
  const element = host.querySelectorAll<HTMLInputElement>(
    'input[aria-label="Value"]',
  )[index];
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
  drag.move = undefined;
});

it("preserves an existing default, allows one choice or none, and disables blank options", () => {
  render();
  expect(host.querySelector("[data-plain-default]")).toBeNull();
  click("Open");
  expect(switches()).toHaveLength(3);
  expect(
    switches().map((button) => button.getAttribute("aria-checked")),
  ).toEqual(["false", "true", "false"]);
  expect(switches()[2].disabled).toBe(true);
  act(() => switches()[0].click());
  expect(values().defaultValue).toBe("0");
  expect(
    switches().filter(
      (button) => button.getAttribute("aria-checked") === "true",
    ),
  ).toHaveLength(1);
  act(() => switches()[0].click());
  expect(values().defaultValue).toBe("");
  expect(
    switches().every(
      (button) => button.getAttribute("aria-checked") === "false",
    ),
  ).toBe(true);
});

it("keeps the selected default through renaming and reordering, and clears it when deleted", () => {
  render();
  click("Open");
  input(1, "renamed");
  expect(values().defaultValue).toBe("renamed");
  act(() => drag.move!(1, 0));
  expect(values().scales[0][0]).toBe("renamed");
  expect(switches()[0].getAttribute("aria-checked")).toBe("true");
  act(() =>
    host
      .querySelectorAll<HTMLButtonElement>('[aria-label="Delete scale"]')[0]
      .click(),
  );
  expect(values().defaultValue).toBe("");
});

it("rolls back both rows and default on Cancel, and keeps them on Finish", () => {
  render();
  click("Open");
  input(1, "changed");
  act(() => switches()[0].click());
  click("Cancel");
  expect(values()).toEqual({
    scales: initialRows,
    legends: [["Low"], ["High"]],
    defaultValue: "1",
  });
  click("Open");
  act(() => switches()[0].click());
  click("Finish");
  expect(values().defaultValue).toBe("0");
  click("Open");
  act(() => switches()[1].click());
  click("Cancel");
  expect(values().defaultValue).toBe("0");
});

it("respects a read-only default and keeps legacy unmatched values until a choice is made", () => {
  render("legacy", true);
  click("Open");
  expect(switches().every((button) => button.disabled)).toBe(true);
  click("Finish");
  expect(values().defaultValue).toBe("legacy");
});
