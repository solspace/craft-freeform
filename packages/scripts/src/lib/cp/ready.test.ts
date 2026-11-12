import { afterEach, expect, it, vi } from "vitest";
import { whenCpReady } from "./ready";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
it("waits for Craft to mount the fragment before initializing its controls", () => {
  let release: (() => void) | undefined;
  vi.stubGlobal("Craft", {
    whenReady: (callback: () => void) => {
      release = callback;
    },
  });
  const initialize = vi.fn();
  whenCpReady(initialize);
  expect(initialize).not.toHaveBeenCalled();
  release?.();
  expect(initialize).toHaveBeenCalledOnce();
});

it("initializes a delayed fragment once even if the shell ready queue releases later", async () => {
  let release: (() => void) | undefined;
  vi.stubGlobal("Craft", {
    whenReady: (callback: () => void) => {
      release = callback;
    },
  });
  const initialize = vi.fn();
  whenCpReady(initialize, "[data-plugin-screen]");
  expect(initialize).not.toHaveBeenCalled();
  document.body.innerHTML = "<main data-plugin-screen></main>";
  await Promise.resolve();
  expect(initialize).toHaveBeenCalledOnce();
  release?.();
  document.body.append(document.createElement("aside"));
  await Promise.resolve();
  expect(initialize).toHaveBeenCalledOnce();
});
