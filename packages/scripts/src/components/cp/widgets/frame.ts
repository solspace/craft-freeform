import { DisclosureSelect } from "@lib/cp/widgets/disclosure-select";
import { manageWidgetFrameSession } from "@lib/cp/widgets/frame-session";

manageWidgetFrameSession();

const init = () => {
  for (const select of document.querySelectorAll<HTMLSelectElement>(
    ".widget-editor select:not([multiple])",
  )) {
    if (!select.closest("[hidden], #settings-chartSize-field"))
      new DisclosureSelect(select);
  }
};
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
