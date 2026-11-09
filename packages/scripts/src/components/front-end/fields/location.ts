import {
  type LocationConfig,
  type LocationController,
  mountLocation,
} from "../../../../../frontend/core/src/location/location";

const controls = new Map<HTMLElement, LocationController>();
function attach() {
  for (const [root, control] of controls) {
    if (!root.isConnected) {
      control.destroy();
      root.removeAttribute("data-freeform-location-attached");
      controls.delete(root);
    }
  }
  document
    .querySelectorAll<HTMLElement>("[data-freeform-location]")
    .forEach((root) => {
      if (
        controls.has(root) ||
        root.hasAttribute("data-freeform-location-attached")
      )
        return;
      const input = root.querySelector<HTMLInputElement>(
        "[data-freeform-location-search]",
      );
      if (!input) return;
      try {
        const config: LocationConfig = JSON.parse(
          root.dataset.freeformLocation ?? "{}",
        );
        controls.set(root, mountLocation(input, config, { root }));
        root.setAttribute("data-freeform-location-attached", "");
      } catch {
        /* Manual address entry remains available for invalid configurations. */
      }
    });
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", attach, { once: true });
else attach();
new MutationObserver(attach).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
