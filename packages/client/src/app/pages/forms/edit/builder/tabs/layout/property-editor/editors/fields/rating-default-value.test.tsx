import type { Field } from "@editor/store/slices/layout/fields";
import type { SelectProperty } from "@ff-client/types/properties";
import type { PropsWithChildren } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RatingDefaultValue } from "./rating-default-value";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: PropsWithChildren) => children,
}));
vi.mock("@components/elements/pop-up-portal", () => ({
  PopUpPortal: ({ children }: PropsWithChildren) => children,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
const scrollDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  if (scrollDescriptor)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else
    delete (Element.prototype as unknown as Record<string, unknown>)
      .scrollIntoView;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("offers None and the configured star values, and stores a selected value", () => {
  const updateValue = vi.fn();
  act(() =>
    root.render(
      <RatingDefaultValue
        property={
          { handle: "defaultValue", label: "Default value" } as SelectProperty
        }
        context={
          {
            uid: "rating",
            typeClass: "RatingField",
            properties: { maxValue: 3 },
          } as Field
        }
        value=""
        updateValue={updateValue}
      />,
    ),
  );
  expect(host.textContent).toContain("None");
  act(() => (host.firstElementChild as HTMLElement).click());
  const options = Array.from(
    host.querySelectorAll<HTMLElement>('[role="option"]'),
  );
  expect(options.map((option) => option.textContent?.trim())).toEqual([
    "None",
    "1",
    "2",
    "3",
  ]);
  act(() => options[3].click());
  expect(updateValue).toHaveBeenCalledWith("3");
});

it("preserves a valid default and displays None for an out-of-range saved value", () => {
  const updateValue = vi.fn();
  const render = (maxValue: number) =>
    act(() =>
      root.render(
        <RatingDefaultValue
          property={
            { handle: "defaultValue", label: "Default value" } as SelectProperty
          }
          context={
            {
              uid: "rating",
              typeClass: "RatingField",
              properties: { maxValue },
            } as Field
          }
          value="4"
          updateValue={updateValue}
        />,
      ),
    );
  render(5);
  expect(updateValue).not.toHaveBeenCalled();
  expect(host.textContent).toContain("4");
  render(3);
  expect(updateValue).not.toHaveBeenCalled();
  expect(host.textContent).toContain("None");
});
