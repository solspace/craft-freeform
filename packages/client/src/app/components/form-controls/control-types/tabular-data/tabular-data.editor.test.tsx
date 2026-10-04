import type { TabularDataProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TabularDataEditor } from "./tabular-data.editor";

const mode = vi.hoisted(() => ({ translating: false }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    willTranslate: () => mode.translating,
    getTranslation: (_handle: string, value: unknown) => value,
    updateTranslation: () => {},
  }),
}));
vi.mock("@components/form-controls/draggable-row", () => ({
  DraggableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
}));
const property = {
  handle: "legends",
  label: "Legends",
  type: PropertyType.TabularData,
  configuration: [
    { key: "label", label: "Legend", type: "text", translatable: true },
  ],
} as TabularDataProperty;
let root: Root;
let container: HTMLDivElement;
function Fixture({ compact = true }: { compact?: boolean }) {
  const [values, setValues] = useState([["Neutral"]]);
  return (
    <>
      <TabularDataEditor
        compact={compact}
        showHelp={!compact}
        property={property}
        configuration={property.configuration}
        values={values}
        updateValue={setValues}
        context={undefined}
        addLabel="Add a legend"
        deleteLabel="Delete legend"
        emptyMessage="No legends yet. Legends are optional."
      />
      <output>{JSON.stringify(values)}</output>
    </>
  );
}
function button(label: string) {
  return (
    container.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    ) ||
    Array.from(container.querySelectorAll("button")).find(
      (item) => item.textContent === label,
    )!
  );
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mode.translating = false;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
describe("compact tabular configuration", () => {
  it("can remove the final optional legend and return focus to its add button", () => {
    act(() => root.render(<Fixture />));
    act(() => button("Delete legend").click());
    expect(container.querySelector("output")!.textContent).toBe("[]");
    expect(container.textContent).toContain(
      "No legends yet. Legends are optional.",
    );
    expect(document.activeElement).toBe(button("Add a legend"));
    act(() => button("Add a legend").click());
    expect(container.querySelector("output")!.textContent).toBe('[[""]]');
    expect(container.querySelector("input")!.value).toBe("");
  });
  it("adds and deletes rows using the existing one-column array format", () => {
    act(() => root.render(<Fixture />));
    act(() => button("Add a legend").click());
    expect(container.querySelector("output")!.textContent).toBe(
      '[["Neutral"],[""]]',
    );
    act(() => button("Delete legend").click());
    expect(container.querySelector("output")!.textContent).toBe('[[""]]');
  });
  it("keeps row structure locked when editing translations", () => {
    mode.translating = true;
    act(() => root.render(<Fixture />));
    expect(button("Add a legend").disabled).toBe(true);
    expect(container.querySelector('[aria-label="Delete legend"]')).toBeNull();
    expect(container.querySelector('[aria-label="Reorder"]')).toBeNull();
    expect(container.querySelector("output")!.textContent).toBe(
      '[["Neutral"]]',
    );
  });
  it("preserves the single-row behavior of the original popup configurator", () => {
    act(() => root.render(<Fixture compact={false} />));
    expect(container.querySelector('[aria-label="Delete legend"]')).toBeNull();
    expect(container.textContent).toContain("Add a row");
  });
});
