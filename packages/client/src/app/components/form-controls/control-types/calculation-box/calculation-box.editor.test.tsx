import type { CalculationProperty } from "@ff-client/types/properties";
import type Tagify from "@yaireo/tagify";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { CalculationBoxEditor } from "./calculation-box.editor";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("./calculation-box.hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./calculation-box.hooks")>()),
  useCalculationFieldHandles: () => ["price", "quantity", "tax"],
}));
vi.mock("@components/elements/custom-dropdown/dropdown", () => ({
  Dropdown: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange("quantity")}>
      Insert quantity
    </button>
  ),
}));

let root: Root;
let container: HTMLDivElement;
let setExternalValue: (value: string) => void;

const render = (initialValue: string): Tagify => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const Harness = () => {
    const [value, setValue] = useState(initialValue);
    setExternalValue = setValue;
    return (
      <>
        <CalculationBoxEditor
          value={value}
          property={{} as CalculationProperty}
          updateValue={setValue}
        />
        <output>{value}</output>
      </>
    );
  };
  act(() => root.render(<Harness />));
  return (
    container.querySelector("textarea") as HTMLTextAreaElement & {
      __tagify: Tagify;
    }
  ).__tagify;
};

const settle = async (): Promise<void> => {
  // Tagify publishes its change event after a 100ms debounce.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
};
const select = (range: Range): void => {
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
};
const insertFromMenu = (): void => {
  const button = container.querySelector("button");
  act(() => {
    button.focus();
    button.click();
  });
};
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});

it("keeps a typed operator and inserts the next field after it", async () => {
  const tagify = render("field:price");
  await settle();
  const originalChip = tagify.getTagElms()[0];
  act(() => {
    tagify.DOM.input.focus();
    expect(document.activeElement).toBe(tagify.DOM.input);
    const range = document.createRange();
    range.setStartAfter(originalChip);
    range.collapse(true);
    const text = document.createTextNode(" +");
    range.insertNode(text);
    range.setStart(text, text.length);
    range.collapse(true);
    select(range);
    tagify.DOM.input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  await settle();
  act(() => container.querySelector("button").focus());
  await settle();
  expect(container.querySelector("output").textContent).toBe("field:price +");
  expect(tagify.getTagElms()[0]).toBe(originalChip);
  insertFromMenu();
  await settle();
  expect(container.querySelector("output").textContent).toBe(
    "field:price +field:quantity",
  );
  // Undo must restore even the value this editor originally opened with.
  act(() => setExternalValue("field:price"));
  expect(tagify.value.map((tag) => tag.value)).toEqual(["price"]);
  act(() => setExternalValue("field:price +field:quantity"));
  expect(tagify.value.map((tag) => tag.value)).toEqual(["price", "quantity"]);
});

it("inserts at a chosen position in the middle of an expression", async () => {
  const tagify = render("field:price+field:tax");
  await settle();
  act(() => {
    tagify.DOM.input.focus();
    const operator = [...tagify.DOM.input.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent === "+",
    );
    const range = document.createRange();
    range.setStart(operator, 1);
    range.collapse(true);
    select(range);
  });
  insertFromMenu();
  await settle();
  expect(container.querySelector("output").textContent).toBe(
    "field:price+field:quantity field:tax",
  );
});

it("still applies external value changes such as undo and redo", async () => {
  const tagify = render("field:price");
  act(() => setExternalValue("field:price+field:quantity"));
  expect(tagify.value.map((tag) => tag.value)).toEqual(["price", "quantity"]);
  act(() => setExternalValue("field:price"));
  expect(tagify.value.map((tag) => tag.value)).toEqual(["price"]);
  await settle();
  expect(container.querySelector("output").textContent).toBe("field:price");
});
