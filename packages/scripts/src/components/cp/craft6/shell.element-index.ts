/** Use Craft's native surface and input slots without replacing live index controls. */
export function enhanceCraft6ElementIndex(root: ParentNode = document): void {
  const pane = root.querySelector<HTMLElement>("#freeform-index-pane");
  const main = root.querySelector<HTMLElement>("#main-content");
  const content = root.querySelector<HTMLElement>("#content-container");
  const header = root.querySelector<HTMLElement>("#header-container");
  if (!pane || !main || !content || !header || pane.dataset.enhanced) return;

  main.insertBefore(pane, content);
  pane.append(header, content);
  pane.hidden = false;
  pane.dataset.enhanced = "true";

  const toolbar = pane.querySelector<HTMLElement>("#toolbar");
  const search = toolbar?.querySelector<HTMLElement>(".search-container");
  const input = search?.querySelector<
    HTMLElement & { requestUpdate?: () => void }
  >("craft-input");
  if (input && search) {
    search.querySelector(":scope > .texticon-icon")?.remove();
    const icon = document.createElement("craft-icon");
    icon.setAttribute("name", "magnifying-glass");
    icon.setAttribute("slot", "prefix");
    icon.setAttribute("aria-hidden", "true");
    input.prepend(icon);

    const suffix = document.createElement("div");
    suffix.className = "freeform-index-search-actions";
    suffix.slot = "suffix";
    for (const control of search.querySelectorAll<HTMLElement>(
      ":scope > .clear-btn, :scope > .filter-btn",
    )) {
      suffix.append(control);
    }
    input.append(suffix);
    // Craft/Lion renders these slots conditionally. Refresh after adding them
    // to an already upgraded component without replacing the live input.
    input.requestUpdate?.();
  }

  // The legacy index adds view controls after its first response. Keep Export
  // after them, like Entries, retaining the existing button and menu bindings.
  if (toolbar) {
    const order = () => {
      const button = toolbar.querySelector("#quick-export");
      const control =
        button &&
        Array.from(toolbar.children).find((child) => child.contains(button));
      if (control && toolbar.lastElementChild !== control)
        toolbar.append(control);
    };
    order();
    new MutationObserver(order).observe(toolbar, { childList: true });
  }
}
