import { getButtonGroups } from "@editor/builder/tabs/layout/field-layout/page/page-buttons/page-buttons.operations";
import type { Page } from "@editor/builder/types/layout";
import { act, type ComponentProps, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import PageButtonLayout from "./layout";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => children,
}));

const layouts = [
  "save back|submit",
  "back|submit save",
  "back|save submit",
  "submit back|save",
  "save|back|submit ",
  " back|submit|save",
  "back|submit|save ",
  " save|back|submit",
  "submit|back|save ",
  " submit|back|save",
  " back|submit|save ",
  " save|back|submit ",
];
let dispose: () => void;
afterEach(() => dispose?.());
function render(
  value: string | undefined,
  back = true,
  save = true,
  order = 1,
) {
  const element = document.createElement("div");
  document.body.append(element);
  const root = createRoot(element);
  const updateValue = vi.fn();
  const props = {
    value,
    updateValue,
    property: { handle: "layout", label: "Button Layout", layouts },
    context: { order, buttons: { back, save } },
  } as unknown as ComponentProps<typeof PageButtonLayout>;
  act(() => root.render(<PageButtonLayout {...props} />));
  dispose = () => {
    act(() => root.unmount());
    element.remove();
  };
  return { element, updateValue };
}
it("preserves the button order and the exact persisted layout string when changing alignment", () => {
  const { element, updateValue } = render("save|back|submit ");
  act(() =>
    Array.from(element.querySelectorAll("button"))
      .find((button) => button.textContent === "Right")
      ?.click(),
  );
  expect(updateValue).toHaveBeenCalledWith(" save|back|submit");
  act(() =>
    Array.from(element.querySelectorAll("button"))
      .find((button) => button.textContent === "Center")
      ?.click(),
  );
  expect(updateValue).toHaveBeenLastCalledWith(" save|back|submit ");
});
it("shows only the orders for the selected alignment and writes the original layout on selection", () => {
  const { element, updateValue } = render("save back|submit");
  const inputs = Array.from(
    element.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
  );
  expect(inputs).toHaveLength(4);
  expect(inputs[0].checked).toBe(true);
  act(() => inputs[1].click());
  expect(updateValue).toHaveBeenCalledWith("back|submit save");
});
it("deduplicates arrangements when optional buttons are disabled and chooses an available alignment", () => {
  const { element } = render("save back|submit", false, false);
  expect(
    Array.from(element.querySelectorAll("button")).map(
      (button) => button.textContent,
    ),
  ).toEqual(["Left", "Center", "Right"]);
  const inputs = Array.from(
    element.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
  );
  expect(inputs).toHaveLength(0);
  expect(element.textContent).not.toContain("Button order");
  expect(element.textContent).not.toContain("Save");
  expect(element.textContent).not.toContain("Back");
});

it("recognizes the wizard submit shorthand as left aligned without changing the form", () => {
  const { element, updateValue } = render("submit", false, false, 0);
  expect(element.querySelector('[aria-pressed="true"]')?.textContent).toBe(
    "Left",
  );
  expect(element.querySelector('[role="radiogroup"]')).toBeNull();
  expect(updateValue).not.toHaveBeenCalled();
});
it("changes a wizard submit button to right alignment on the first click", () => {
  const { element, updateValue } = render("submit", false, false, 0);
  act(() =>
    Array.from(element.querySelectorAll("button"))
      .find((button) => button.textContent === "Right")
      ?.click(),
  );
  expect(updateValue).toHaveBeenCalledTimes(1);
  expect(updateValue.mock.calls[0][0]).not.toBe("submit");
  expect(
    getButtonGroups({
      order: 0,
      buttons: {
        layout: updateValue.mock.calls[0][0],
        back: false,
        save: false,
      },
    } as Page).map((group) => group.map((button) => button.handle)),
  ).toEqual([[], ["submit"]]);
});
it("retains the selected layout when its visible buttons duplicate an earlier option", () => {
  const { element, updateValue } = render(" back|submit|save", false, false, 0);
  expect(element.querySelector('[aria-pressed="true"]')?.textContent).toBe(
    "Right",
  );
  expect(element.querySelector('[role="radiogroup"]')).toBeNull();
  expect(updateValue).not.toHaveBeenCalled();
});
it("uses the same default as the builder preview when a new page has no explicit layout", () => {
  const { element, updateValue } = render(undefined, false, false, 0);
  expect(element.querySelector('[aria-pressed="true"]')?.textContent).toBe(
    "Right",
  );
  expect(element.querySelector('[role="radiogroup"]')).toBeNull();
  expect(updateValue).not.toHaveBeenCalled();
});

it("keeps an existing submit-only layout accurate even if optional buttons were later enabled", () => {
  const { element, updateValue } = render("submit", true, true);
  expect(element.querySelector('[aria-pressed="true"]')?.textContent).toBe(
    "Left",
  );
  expect(
    element
      .querySelector<HTMLInputElement>("input:checked")
      ?.getAttribute("aria-label"),
  ).toBe("Left: Submit");
  expect(updateValue).not.toHaveBeenCalled();
});
