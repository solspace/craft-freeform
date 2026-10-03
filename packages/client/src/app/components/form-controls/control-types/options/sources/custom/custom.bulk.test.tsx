import { act, type PropsWithChildren } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Bulk } from "./custom.bulk";

vi.mock("@components/form-controls/control", () => ({
  Control: ({
    children,
    preContent,
  }: PropsWithChildren<{ preContent?: React.ReactNode }>) => (
    <div>
      {preContent}
      {children}
    </div>
  ),
}));

let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function setup() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const bulkImport = vi.fn();
  const close = vi.fn();
  act(() => root.render(<Bulk open close={close} bulkImport={bulkImport} />));
  return { bulkImport, close, textarea: container.querySelector("textarea")! };
}

function enterValues(textarea: HTMLTextAreaElement) {
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!.call(textarea, "One|1\nTwo|2");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("bulk options slideout content", () => {
  it("focuses the editor and cancels without importing", () => {
    const { textarea, close, bulkImport } = setup();
    expect(document.activeElement).toBe(textarea);
    enterValues(textarea);
    act(() =>
      container.querySelector<HTMLButtonElement>("footer button")!.click(),
    );
    expect(close).toHaveBeenCalledOnce();
    expect(bulkImport).not.toHaveBeenCalled();
  });

  it.each(["metaKey", "ctrlKey"])(
    "imports with %s+Enter and closes",
    (modifier) => {
      const { textarea, close, bulkImport } = setup();
      enterValues(textarea);
      act(() =>
        textarea.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            [modifier]: true,
            bubbles: true,
            cancelable: true,
          }),
        ),
      );
      expect(bulkImport).toHaveBeenCalledWith("One|1\nTwo|2", "|", true);
      expect(close).toHaveBeenCalledOnce();
    },
  );
});
