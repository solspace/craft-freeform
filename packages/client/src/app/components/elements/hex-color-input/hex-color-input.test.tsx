import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HexColorInput } from "./hex-color-input";

let root: Root;
let host: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});

function fixture(
  initial: string,
  allowTransparent = true,
  allowInherited = false,
  transparentLabel = "Transparent",
) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const changed = vi.fn();
  function Fixture() {
    const [value, setValue] = useState(initial);
    return (
      <HexColorInput
        value={value}
        allowTransparent={allowTransparent}
        allowInherited={allowInherited}
        transparentLabel={transparentLabel}
        onChange={(next) => {
          changed(next);
          setValue(next);
        }}
      />
    );
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Fixture />));
  return {
    changed,
    text: host.querySelector<HTMLInputElement>('[type="text"]')!,
    color: host.querySelector<HTMLInputElement>('[type="color"]')!,
    toggle: () => host.querySelector<HTMLInputElement>('[type="checkbox"]')!,
  };
}

function input(element: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it.each(["rgba(0,0,0,0)", "rgba(0, 0, 0, 0.0)", "TRANSPARENT", "transparent"])(
  "shows %s as transparent without rewriting a saved value",
  (value) => {
    const view = fixture(value);
    expect(view.text.value).toBe("Transparent");
    expect(view.toggle().checked).toBe(true);
    expect(view.color.dataset.transparent).toBe("true");
    act(() =>
      view.text.dispatchEvent(new FocusEvent("focusout", { bubbles: true })),
    );
    expect(view.changed).not.toHaveBeenCalled();
  },
);

it("distinguishes opaque black from the transparent default", () => {
  const view = fixture("#000000");
  expect(view.text.value).toBe("#000000");
  expect(view.toggle().checked).toBe(false);
  expect(view.color.dataset.transparent).toBe("false");
  expect(view.changed).not.toHaveBeenCalled();
});

it("preserves inherited color until edited and can restore inheritance or the last solid color", () => {
  const view = fixture("currentColor", false, true);
  expect(view.text.value).toBe("Inherited");
  expect(view.toggle().checked).toBe(true);
  expect(view.changed).not.toHaveBeenCalled();
  input(view.color, "#2563eb");
  expect(view.changed).toHaveBeenLastCalledWith("#2563eb");
  expect(view.toggle().checked).toBe(false);
  act(() => view.toggle().click());
  expect(view.changed).toHaveBeenLastCalledWith("currentColor");
  act(() => view.toggle().click());
  expect(view.changed).toHaveBeenLastCalledWith("#2563eb");
});

it("lets opaque black take effect immediately without moving the color picker around", () => {
  const view = fixture("rgba(0,0,0,0)");
  act(() => view.toggle().click());
  expect(view.changed).toHaveBeenCalledExactlyOnceWith("#000000");
  expect(view.text.value).toBe("#000000");
  expect(view.toggle().checked).toBe(false);
});

it("restores the selected solid color when transparency is switched back off", () => {
  const view = fixture("#2468ac");
  act(() => view.toggle().click());
  expect(view.changed).toHaveBeenLastCalledWith("rgba(0,0,0,0)");
  expect(view.text.value).toBe("Transparent");
  act(() => view.toggle().click());
  expect(view.changed).toHaveBeenLastCalledWith("#2468ac");
  expect(view.color.value).toBe("#2468ac");
});

it("accepts an explicit black hex value and typing transparent", () => {
  const view = fixture("TRANSPARENT");
  input(view.text, "#000000");
  expect(view.changed).toHaveBeenLastCalledWith("#000000");
  expect(view.toggle().checked).toBe(false);
  input(view.text, "transparent");
  expect(view.changed).toHaveBeenLastCalledWith("rgba(0,0,0,0)");
  expect(view.toggle().checked).toBe(true);
});

it("chooses an opaque color from a transparent value", () => {
  const view = fixture("rgba(0,0,0,0)");
  input(view.color, "#ff5500");
  expect(view.changed).toHaveBeenCalledExactlyOnceWith("#ff5500");
  expect(view.text.value).toBe("#ff5500");
  expect(view.toggle().checked).toBe(false);
});

it("keeps other saved CSS color formats visible without pretending they are black", () => {
  const view = fixture("rgba(30, 90, 140, .5)");
  expect(view.text.value).toBe("rgba(30, 90, 140, .5)");
  expect(view.changed).not.toHaveBeenCalled();
});

it("retains existing hex editing behavior for controls without transparency", () => {
  const view = fixture("#abc", false);
  expect(view.text.value).toBe("#aabbcc");
  expect(host.querySelector('[type="checkbox"]')).toBeNull();
  input(view.text, "#f");
  expect(view.changed).not.toHaveBeenCalled();
  input(view.text, "A1B2C3");
  expect(view.changed).toHaveBeenCalledExactlyOnceWith("#a1b2c3");
});

it("can label transparency as None and restore the last solid color", () => {
  const view = fixture("#2563eb", true, false, "None");
  expect(host.textContent).toContain("None");
  act(() => view.toggle().click());
  expect(view.text.value).toBe("None");
  expect(view.changed).toHaveBeenLastCalledWith("rgba(0,0,0,0)");
  act(() => view.toggle().click());
  expect(view.text.value).toBe("#2563eb");
  input(view.text, "None");
  expect(view.toggle().checked).toBe(true);
  expect(view.text.value).toBe("None");
});
