import { DisclosureSelect } from "@lib/cp/widgets/disclosure-select";
import { manageWidgetFrameSession } from "@lib/cp/widgets/frame-session";
import { syncWidgetFrameTheme } from "@lib/cp/widgets/frame-theme";
import { fitHealthIssues } from "@lib/cp/widgets/health-issues";

manageWidgetFrameSession();
syncWidgetFrameTheme();

const init = () => {
  for (const widget of document.querySelectorAll<HTMLElement>(
    ".ff-health-widget",
  )) {
    fitHealthIssues(widget);
  }
  if (window.parent !== window && document.querySelector(".form-card-widget")) {
    window.parent.postMessage(
      {
        type: "freeform-widget-ready",
        healthReady:
          document.querySelector('[data-freeform-health-ready="true"]') !==
          null,
      },
      window.location.origin,
    );
  }
  for (const select of document.querySelectorAll<HTMLSelectElement>(
    ".widget-editor select:not([multiple])",
  )) {
    // Craft 6 owns the select's input slot, keyboard handling, and menu.
    if (!select.closest("craft-select, [hidden], #settings-chartSize-field"))
      new DisclosureSelect(select);
  }
};
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
