import { afterEach, expect, it, vi } from "vitest";
import { syncWidgetFrameTheme } from "./frame-theme";

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

const setup = () => {
  const parentDocument = document.implementation.createHTMLDocument();
  const frame = document.createElement("iframe");
  frame.setAttribute("data-freeform-widget-frame", "");
  vi.spyOn(window, "frameElement", "get").mockReturnValue(frame);
  vi.spyOn(window, "parent", "get").mockReturnValue({
    document: parentDocument,
    location: window.location,
  } as Window);
  return { parentDocument, frame };
};

it("follows the host theme on loading and while switching between dark and light", async () => {
  const { parentDocument } = setup();
  const root = parentDocument.documentElement;
  root.setAttribute("data-theme", "dark");
  dispose = syncWidgetFrameTheme();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

  root.removeAttribute("data-theme");
  await Promise.resolve();
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);

  root.setAttribute("data-theme", "dark");
  await Promise.resolve();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});

it("reconnects after restoring a cached frame and stops observing on disposal", async () => {
  const { parentDocument } = setup();
  dispose = syncWidgetFrameTheme();
  window.dispatchEvent(new Event("pagehide"));
  parentDocument.documentElement.setAttribute("data-theme", "dark");
  await Promise.resolve();
  expect(document.documentElement.hasAttribute("data-theme")).toBe(false);

  window.dispatchEvent(new Event("pageshow"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  dispose();
  parentDocument.documentElement.removeAttribute("data-theme");
  await Promise.resolve();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});

it("leaves top-level pages and unrelated frames on their own theme", () => {
  document.documentElement.setAttribute("data-theme", "dark");
  dispose = syncWidgetFrameTheme();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  dispose();
  const { frame } = setup();
  frame.removeAttribute("data-freeform-widget-frame");
  dispose = syncWidgetFrameTheme();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});
