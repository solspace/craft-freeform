/** Initialize against the plugin's own fragment, including late-mounted content. */
export function whenCpReady(callback: () => void, selector?: string): void {
  let initialized = false;
  let observer: MutationObserver | undefined;
  const initialize = (): void => {
    if (initialized || (selector && !document.querySelector(selector))) return;
    initialized = true;
    observer?.disconnect();
    callback();
  };
  if (selector) {
    observer = new MutationObserver(initialize);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    initialize();
  }
  if (typeof Craft !== "undefined" && typeof Craft.whenReady === "function") {
    Craft.whenReady(initialize);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}
