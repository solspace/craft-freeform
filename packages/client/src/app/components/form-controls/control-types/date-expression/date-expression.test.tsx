import { PropertyType } from "@ff-client/types/properties";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import DateExpressionControl from "./date-expression";

vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { locale: "en-US" } } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));

let root: Root;
let host: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});
function mount(initial = "3 days ago", includeTime = false, disabled = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const update = vi.fn();
  function Fixture() {
    const [value, setValue] = useState(initial);
    return (
      <>
        <DateExpressionControl
          value={value}
          property={{
            type: PropertyType.DateExpression,
            handle: "minDate",
            label: "Minimum date",
            includeTime,
            disabled,
          }}
          updateValue={(next) => {
            update(next);
            setValue(next);
          }}
        />
        <button onClick={() => setValue(initial)} type="button">
          Restore saved value
        </button>
      </>
    );
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Fixture />));
  return {
    input: host.querySelector("input")!,
    open: () =>
      act(() =>
        host.querySelector<HTMLButtonElement>("button[aria-label]")!.click(),
      ),
    update,
  };
}
it.each(["now", "today", "3 days ago", "5 days ago"])(
  "preserves %s when opening and dismissing the calendar",
  (value) => {
    const { input, open, update } = mount(value);
    expect(
      document.querySelector<HTMLElement>(".ff-datetime-picker")!.dataset
        .appearance,
    ).toBe("control-panel");
    act(() => input.focus());
    expect(
      document.querySelector<HTMLElement>(".ff-datetime-picker")!.hidden,
    ).toBe(true);
    open();
    expect(input.value).toBe(value);
    act(() =>
      document
        .querySelector<HTMLElement>(".ff-datetime-picker")!
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        ),
    );
    expect(input.value).toBe(value);
    expect(update).not.toHaveBeenCalled();
  },
);
it("keeps typed expressions and cleared values while allowing explicit dates and restoration", () => {
  const { input, open, update } = mount();
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, "now");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(update).toHaveBeenLastCalledWith("now");
  open();
  const day = document.querySelector<HTMLButtonElement>(
    '[data-outside="false"]',
  )!;
  const date = day.dataset.day;
  act(() => day.click());
  expect(input.value).toBe(date);
  expect(update).toHaveBeenLastCalledWith(date);
  act(() =>
    Array.from(host.querySelectorAll("button"))
      .find((e) => e.textContent === "Restore saved value")!
      .click(),
  );
  expect(input.value).toBe("3 days ago");
  open();
  act(() =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(".ff-datetime-action"),
    )
      .find((e) => e.textContent === "Clear")!
      .click(),
  );
  expect(input.value).toBe("");
  expect(update).toHaveBeenLastCalledWith("");
});
it("inserts a date and time for an initial value without changing an existing expression on open", () => {
  const { input, open, update } = mount("now", true);
  open();
  expect(update).not.toHaveBeenCalled();
  const day = document.querySelector<HTMLButtonElement>(
    '[data-outside="false"]',
  )!;
  const date = day.dataset.day;
  act(() => day.click());
  act(() =>
    document.querySelector<HTMLButtonElement>('[data-time="900"]')!.click(),
  );
  expect(input.value).toBe(`${date} 15:00:00`);
});
it("disables both typing and the calendar for locked controls", () => {
  const { input, open, update } = mount("today", false, true);
  expect(input.disabled).toBe(true);
  open();
  expect(
    document.querySelector<HTMLElement>(".ff-datetime-picker")!.hidden,
  ).toBe(true);
  expect(update).not.toHaveBeenCalled();
});
