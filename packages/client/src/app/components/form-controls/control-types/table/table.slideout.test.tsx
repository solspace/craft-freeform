import type { Field } from "@editor/store/slices/layout/fields";
import type { TableProperty } from "@ff-client/types/properties";
import { act, type PropsWithChildren, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import Table from "./table";
import type { ColumnDescription } from "./table.types";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
vi.mock("@components/slideouts/slideout", () => ({
  NativeSlideout: ({ children, onClose }) => (
    <div role="dialog">{children(onClose)}</div>
  ),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    willTranslate: () => false,
    getTranslation: (_handle, value) => value,
  }),
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({ value, options, onChange }) => (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
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
  vi.unstubAllGlobals();
});

it("initializes an empty table, edits live columns, and cleans the latest values on close", () => {
  vi.stubGlobal("Craft", { t: (_category, value) => value });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  function Fixture() {
    const [columns, setColumns] = useState<ColumnDescription[]>([]);
    return (
      <>
        <Table
          value={columns}
          updateValue={setColumns}
          property={
            {
              label: "Table Layout",
              handle: "table",
              options: [{ value: "text", label: "Text" }],
            } as TableProperty
          }
          context={{} as Field}
        />
        <output>{JSON.stringify(columns)}</output>
      </>
    );
  }
  act(() => root.render(<Fixture />));
  act(() => container.querySelector<HTMLElement>("[role=button]")!.click());
  expect(container.querySelector("h1")?.textContent).toBe("Table Layout");
  const edit = (value: string) => {
    const input = container.querySelector<HTMLInputElement>(
      "[role=dialog] input",
    )!;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  edit("Services");
  act(() =>
    container
      .querySelector<HTMLButtonElement>('button[title="Add column"]')!
      .click(),
  );
  edit("");
  act(() =>
    container.querySelector<HTMLButtonElement>("footer button")!.click(),
  );
  expect(container.querySelector("[role=dialog]")).toBeNull();
  const columns = JSON.parse(container.querySelector("output")!.textContent!);
  expect(columns).toHaveLength(1);
  expect(columns[0]).toMatchObject({
    label: "Services",
    type: "text",
    value: "",
  });
});
