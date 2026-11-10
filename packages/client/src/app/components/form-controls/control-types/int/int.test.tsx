import type { IntegerProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import Int from "./int";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let root: Root;
let host: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});
const property = (extra: Partial<IntegerProperty> = {}): IntegerProperty =>
  ({
    handle: "measurement",
    label: "Measurement",
    type: PropertyType.Integer,
    ...extra,
  }) as IntegerProperty;
function mount(unit?: string) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const changed = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<number | undefined>(2.5);
    return (
      <Int
        value={value}
        property={property({ unit, step: 0.1, min: 0, max: 10 })}
        updateValue={(next) => {
          changed(next);
          setValue(next);
        }}
      />
    );
  }
  act(() => root.render(<Fixture />));
  return { changed, input: host.querySelector("input")! };
}
function inputValue(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it.each([
  "px",
  "%",
  "seconds",
  "minutes",
  "KB",
  "chars",
  "rows",
  "files",
  "tokens",
  "submissions",
])("shows fixed %s separately from the editable numeric value", (unit) => {
  const view = mount(unit);
  expect(view.input.value).toBe("2.5");
  expect(host.querySelector("span")?.textContent).toBe(unit);
  expect(view.input.getAttribute("aria-describedby")).toBe(
    host.querySelector("span")?.id,
  );
  expect(host.querySelectorAll("input")).toHaveLength(1);
  expect(view.input.step).toBe("0.1");
  inputValue(view.input, "3.7");
  expect(view.changed).toHaveBeenLastCalledWith(3.7);
  inputValue(view.input, "");
  expect(view.changed).toHaveBeenLastCalledWith(undefined);
  expect(host.querySelector("span")?.textContent).toBe(unit);
  inputValue(view.input, "15");
  act(() =>
    view.input.dispatchEvent(new FocusEvent("focusout", { bubbles: true })),
  );
  expect(view.changed).toHaveBeenLastCalledWith(10);
});
it("keeps unitless number settings plain", () => {
  const view = mount();
  expect(host.querySelector("span")).toBeNull();
  expect(view.input.hasAttribute("aria-describedby")).toBe(false);
  expect(view.input.value).toBe("2.5");
});
it("updates currency from the selected field setting without changing the amount", () => {
  const { changed } = mount();
  for (const currency of ["USD", "EUR"]) {
    act(() =>
      root.render(
        <Int
          value={19.95}
          property={property({ unitProperty: "currency", step: 0.01 })}
          context={{ properties: { currency } }}
          updateValue={changed}
        />,
      ),
    );
    expect(host.querySelector("input")?.value).toBe("19.95");
    expect(host.querySelector("span")?.textContent).toBe(currency);
  }
  expect(changed).not.toHaveBeenCalled();
  act(() =>
    root.render(
      <Int
        value={19.95}
        property={property({ unit: "px", flags: ["readonly"] })}
        updateValue={changed}
      />,
    ),
  );
  expect(host.querySelector("input")?.readOnly).toBe(true);
  expect(host.querySelector("input")?.value).toBe("19.95");
});
