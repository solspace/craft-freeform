import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { NumberInput } from "./number-input";

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
function mount(value: string, readOnly = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const onChange = vi.fn();
  const onBlur = vi.fn();
  const onWheelCapture = vi.fn();
  const onKeyDown = vi.fn();
  act(() =>
    root.render(
      <>
        <NumberInput
          unit="chars"
          defaultValue={value}
          step="0.5"
          min={-100}
          max={100}
          readOnly={readOnly}
          onChange={onChange}
          onBlur={onBlur}
          onWheelCapture={onWheelCapture}
          onKeyDown={onKeyDown}
        />
        <button type="button">Another control</button>
      </>,
    ),
  );
  return {
    input: host.querySelector("input")!,
    onChange,
    onBlur,
    onWheelCapture,
    onKeyDown,
  };
}
it.each(["19", "", "-2.5"])(
  "releases the focused %s number before wheel scrolling without cancelling the scroll or changing its value",
  (value) => {
    const view = mount(value);
    for (const deltaY of [-120, 120]) {
      act(() => view.input.focus());
      const wheel = new WheelEvent("wheel", {
        deltaY,
        bubbles: true,
        cancelable: true,
      });
      act(() => view.input.dispatchEvent(wheel));
      expect(document.activeElement).not.toBe(view.input);
      expect(view.input.value).toBe(value);
      expect(wheel.defaultPrevented).toBe(false);
    }
    expect(view.onChange).not.toHaveBeenCalled();
    expect(view.onBlur).toHaveBeenCalledTimes(2);
    expect(view.onWheelCapture).toHaveBeenCalledTimes(2);
    act(() => {
      view.input.focus();
      view.input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(view.input);
    expect(view.onKeyDown).toHaveBeenCalledOnce();
    expect(view.input.type).toBe("number");
    expect(view.input.step).toBe("0.5");
  },
);
it.each([
  { ctrlKey: true, deltaY: 10 },
  { metaKey: true, deltaY: 10 },
  { deltaX: 10, deltaY: 0 },
])("preserves focus for zoom or horizontal scrolling: %o", (gesture) => {
  const view = mount("19");
  act(() => {
    view.input.focus();
    view.input.dispatchEvent(
      new WheelEvent("wheel", { ...gesture, bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(view.input);
  expect(view.input.value).toBe("19");
  expect(view.onBlur).not.toHaveBeenCalled();
});
it("does not move focus from another control or blur a read-only number", () => {
  const view = mount("19", true);
  act(() => {
    view.input.focus();
    view.input.dispatchEvent(
      new WheelEvent("wheel", { deltaY: 120, bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(view.input);
  const other = host.querySelector("button")!;
  act(() => {
    other.focus();
    view.input.dispatchEvent(
      new WheelEvent("wheel", { deltaY: 120, bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(other);
  expect(view.onBlur).toHaveBeenCalledOnce();
});
