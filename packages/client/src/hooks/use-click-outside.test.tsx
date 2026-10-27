import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useClickOutside } from "./use-click-outside";

let root: Root;
let container: HTMLDivElement;
const dismiss = vi.fn();

function Fixture({ enabled = true }: { enabled?: boolean }) {
  const ref = useClickOutside<HTMLDivElement>({
    callback: dismiss,
    isEnabled: enabled,
    excludeClassNames: ["editor-popup"],
  });
  return (
    <>
      <div ref={ref}>
        <input aria-label="Label" defaultValue="Select this text" />
        {/* biome-ignore lint/a11y/useSemanticElements: Match the contenteditable expression editor. */}
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          tabIndex={0}
        >
          {"{{ faker.sentences(6, true) }}"}
        </div>
        <p>Field instructions</p>
      </div>
      <div className="editor-popup">
        <span>Popup text</span>
      </div>
      <button type="button">Outside</button>
    </>
  );
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  dismiss.mockClear();
  vi.unstubAllGlobals();
});

function setup() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<Fixture />));
  return {
    input: container.querySelector("input")!,
    expression: container.querySelector<HTMLElement>("[contenteditable]")!,
    instructions: container.querySelector("p")!,
    popup: container.querySelector("span")!,
    outside: container.querySelector("button")!,
  };
}

function pointerEvent(target: EventTarget, type: string) {
  act(() => target.dispatchEvent(new MouseEvent(type, { bubbles: true })));
}

it.each(["input", "expression", "instructions", "popup"] as const)(
  "keeps the editor open when a selection starts in %s and ends outside",
  (start) => {
    const targets = setup();
    act(() => targets[start].focus());
    pointerEvent(targets[start], "pointerdown");
    // A missed text-selection drag can leave the input unfocused and dispatch
    // its click on the common ancestor of the press and release targets.
    targets.input.blur();
    pointerEvent(targets.outside, "pointerup");
    act(() => document.body.click());
    expect(dismiss).not.toHaveBeenCalled();

    pointerEvent(targets.outside, "pointerdown");
    pointerEvent(targets.outside, "pointerup");
    act(() => targets.outside.click());
    expect(dismiss).toHaveBeenCalledOnce();
  },
);

it("keeps the editor open when a drag starts outside and ends inside", () => {
  const { outside, instructions } = setup();
  pointerEvent(outside, "pointerdown");
  pointerEvent(instructions, "pointerup");
  act(() => document.body.click());
  expect(dismiss).not.toHaveBeenCalled();
});

it("preserves the gesture when the editor rerenders during selection", () => {
  const { instructions, outside } = setup();
  pointerEvent(instructions, "pointerdown");
  act(() => root.render(<Fixture />));
  pointerEvent(outside, "pointerup");
  act(() => document.body.click());
  expect(dismiss).not.toHaveBeenCalled();
});

it.each(["pointercancel", "blur"])(
  "does not let an interrupted gesture swallow a later click after %s",
  (event) => {
    const { instructions, outside } = setup();
    pointerEvent(instructions, "pointerdown");
    pointerEvent(event === "blur" ? window : instructions, event);
    act(() => outside.click());
    expect(dismiss).toHaveBeenCalledOnce();
  },
);

it("allows clicks without pointer events and ignores clicks inside or on popups", () => {
  const { instructions, popup, outside } = setup();
  act(() => instructions.click());
  act(() => popup.click());
  expect(dismiss).not.toHaveBeenCalled();
  act(() => outside.click());
  expect(dismiss).toHaveBeenCalledOnce();
});

it("preserves focused text inputs and disabled outside-click handling", () => {
  const { input, outside } = setup();
  act(() => input.focus());
  act(() => outside.click());
  expect(dismiss).not.toHaveBeenCalled();
  act(() => input.blur());
  act(() => root.render(<Fixture enabled={false} />));
  pointerEvent(outside, "pointerdown");
  pointerEvent(outside, "pointerup");
  act(() => outside.click());
  expect(dismiss).not.toHaveBeenCalled();
});
