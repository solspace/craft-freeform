// @vitest-environment jsdom
import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextareaAutoGrowHandler from "./textarea-auto-grow";

let observerCallback: ResizeObserverCallback;
const disconnect = vi.fn();
const observe = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(callback, 0),
  );
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }
      disconnect = disconnect;
      observe = observe;
    },
  );
});

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

function measure(field: HTMLTextAreaElement, boxSizing = "border-box") {
  const layout = { visible: true, width: 300, contentHeight: 50 };
  field.style.cssText = `box-sizing:${boxSizing};padding:10px;border:2px solid;`;
  vi.spyOn(field, "getClientRects").mockImplementation(
    () => (layout.visible ? [{}] : []) as unknown as DOMRectList,
  );
  vi.spyOn(field, "getBoundingClientRect").mockImplementation(
    () => ({ width: layout.visible ? layout.width : 0 }) as DOMRect,
  );
  const outerHeight = () => {
    const height = parseFloat(field.style.height) || 60;
    const max = parseFloat(field.style.maxHeight) || Infinity;
    return Math.min(height, max) + (boxSizing === "border-box" ? 0 : 24);
  };
  Object.defineProperties(field, {
    offsetHeight: { get: outerHeight },
    clientHeight: { get: () => outerHeight() - 4 },
    scrollHeight: {
      get: () => Math.max(outerHeight() - 4, layout.contentHeight),
    },
  });
  return layout;
}

function setup(boxSizing = "border-box", maxHeight?: number) {
  document.body.innerHTML =
    '<form><textarea name="message" rows="2" data-freeform-auto-grow></textarea><textarea name="ordinary"></textarea></form>';
  const form = document.querySelector("form")!;
  const field = form.querySelector("textarea")!;
  const layout = measure(field, boxSizing);
  if (maxHeight) {
    field.dataset.freeformAutoGrowMaxHeight = String(maxHeight);
  }
  const handler = new TextareaAutoGrowHandler({ form } as Freeform);
  return { form, field, layout, handler };
}

describe("textarea auto grow", () => {
  it.each(["border-box", "content-box"])(
    "grows and shrinks without changing values or ordinary textareas (%s)",
    (boxSizing) => {
      const { form, field, layout } = setup(boxSizing);
      const initialHeight = field.offsetHeight;
      field.value = "User's answer";
      layout.contentHeight = 200;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      expect(field.offsetHeight).toBe(204);
      expect(field.style.overflowY).toBe("hidden");
      expect(new FormData(form).get("message")).toBe("User's answer");
      layout.contentHeight = 40;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      expect(field.offsetHeight).toBe(initialHeight);
      const ordinary =
        form.querySelector<HTMLTextAreaElement>('[name="ordinary"]')!;
      ordinary.dispatchEvent(new Event("input", { bubbles: true }));
      expect(ordinary.style.cssText).toBe("");
    },
  );

  it("scrolls at the maximum and removes scrolling when content shrinks", () => {
    const { field, layout } = setup("border-box", 120);
    layout.contentHeight = 300;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    expect(field.offsetHeight).toBe(120);
    expect(field.style.overflowY).toBe("auto");
    layout.contentHeight = 40;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    expect(field.offsetHeight).toBe(60);
    expect(field.style.overflowY).toBe("hidden");
  });

  it("waits for hidden fields and recalculates on reveal and width changes", () => {
    const { field, layout, handler } = setup();
    layout.visible = false;
    layout.contentHeight = 300;
    field.style.height = "";
    handler.reload();
    expect(field.style.height).toBe("");
    observerCallback(
      [{ target: field }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    );
    layout.visible = true;
    observerCallback(
      [{ target: field }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    );
    expect(field.offsetHeight).toBe(304);
    layout.width = 600;
    layout.contentHeight = 100;
    observerCallback(
      [{ target: field }] as ResizeObserverEntry[],
      {} as ResizeObserver,
    );
    expect(field.offsetHeight).toBe(104);
  });

  it("resizes after reset and reconnects to AJAX replacement fields", () => {
    const { form, field, layout, handler } = setup();
    layout.contentHeight = 200;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    form.reset();
    layout.contentHeight = 40;
    vi.runAllTimers();
    expect(field.offsetHeight).toBe(60);
    form.innerHTML =
      "<textarea data-freeform-auto-grow>Saved answer</textarea>";
    const replacement = form.querySelector("textarea")!;
    const nextLayout = measure(replacement);
    nextLayout.contentHeight = 200;
    handler.reload();
    handler.reload();
    expect(disconnect).toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(replacement);
    expect(replacement.offsetHeight).toBe(204);
    nextLayout.contentHeight = 40;
    form.dispatchEvent(new Event("freeform-rules-applied"));
    vi.runAllTimers();
    expect(replacement.offsetHeight).toBe(60);
  });
});
