import { afterEach, beforeEach, expect, it, vi } from "vitest";

let notify: MutationCallback;
beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<script src="/site.js"></script>';
  window.dataLayer = [];
  vi.stubGlobal(
    "MutationObserver",
    class {
      constructor(callback: MutationCallback) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  delete (window as Window & { google_tag_manager?: unknown })
    .google_tag_manager;
});
it("leaves an existing GTM installation alone", async () => {
  document.body.innerHTML +=
    '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-EXISTING"></script>';
  const { GTMManager } = await import("./manager");
  GTMManager.getInstance().loadContainer("GTM-EXISTING");
  expect(document.querySelectorAll('script[src*="gtm.js"]')).toHaveLength(1);
  expect(window.dataLayer).toEqual([]);
});
it("detects containers already registered by Google even when their loader is absent", async () => {
  Object.assign(window, { google_tag_manager: { "GTM-EXISTING": {} } });
  const { GTMManager } = await import("./manager");
  GTMManager.getInstance().loadContainer("GTM-EXISTING");
  expect(document.querySelectorAll('script[src*="gtm.js"]')).toHaveLength(0);
  expect(window.dataLayer).toEqual([]);
});
it("loads a requested container once and ignores invalid or empty IDs", async () => {
  const { GTMManager } = await import("./manager");
  const manager = GTMManager.getInstance();
  manager.loadContainer("GTM-NEW");
  manager.loadContainer("GTM-NEW");
  manager.loadContainer("");
  manager.loadContainer("G-ANALYTICS");
  expect(document.querySelectorAll('script[src*="gtm.js"]')).toHaveLength(1);
  expect(window.dataLayer).toHaveLength(1);
});
it("finds forms inserted inside a wrapper without reloading an existing container", async () => {
  const { GTMManager } = await import("./manager");
  GTMManager.getInstance().observeNewForms();
  const wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<form data-gtm-id="GTM-NEW"></form><form data-gtm-id="GTM-NEW"></form>';
  notify(
    [{ addedNodes: [wrapper] } as unknown as MutationRecord],
    {} as MutationObserver,
  );
  expect(document.querySelectorAll('script[src*="gtm.js"]')).toHaveLength(1);
});
