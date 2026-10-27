/** Use Craft's native surface and input slots without replacing live index controls. */
export function enhanceCraft6ElementIndex(root: ParentNode = document): void {
  const pane = root.querySelector<HTMLElement>("#freeform-index-pane");
  const main = root.querySelector<HTMLElement>("#main-content");
  const content = root.querySelector<HTMLElement>("#content-container");
  const header = root.querySelector<HTMLElement>("#header-container");
  if (!pane || !main || !content || !header || pane.dataset.enhanced) return;

  const sidebar = main.querySelector<HTMLElement>(
    ":scope > #sidebar-container",
  );
  main.insertBefore(pane, content);
  const layout = document.createElement("div");
  layout.className = "freeform-secondary-layout freeform-index-layout";
  layout.slot = "body";
  pane.append(layout);
  if (sidebar) layout.append(sidebar);
  layout.append(header, content);
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
    search.classList.remove("texticon", "has-filter-btn");
    const textInput = input.querySelector<HTMLInputElement>("input");
    if (textInput) {
      textInput.classList.remove("text", "fullwidth", "clearable");
      textInput.setAttribute("placeholder", "");
    }
    input.setAttribute("placeholder", "");

    const suffix = document.createElement("div");
    suffix.className = "freeform-index-search-actions";
    suffix.slot = "suffix";
    for (const control of search.querySelectorAll<HTMLElement>(
      ":scope > .clear-btn, :scope > .filter-btn",
    )) {
      if (control.matches(".filter-btn")) {
        const filterIcon = document.createElement("craft-icon");
        filterIcon.setAttribute("name", "filter");
        filterIcon.setAttribute("aria-hidden", "true");
        control.replaceChildren(filterIcon);
      }
      suffix.append(control);
    }
    input.append(suffix);
    // Craft/Lion renders these slots conditionally. Refresh after adding them
    // to an already upgraded component without replacing the live input.
    input.requestUpdate?.();
  }

  enhanceCraft6IndexRows(pane);

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

/** Decorate Ajax rows with native icons while retaining the live index bindings. */
export function enhanceCraft6IndexRows(pane: HTMLElement): void {
  const statuses: { handle: string; color: string; label: string }[] =
    Object.values(JSON.parse(pane.dataset.statuses || "[]"));
  const update = () => {
    for (const header of pane.querySelectorAll<HTMLElement>(
      "#elements th.orderable",
    )) {
      const button = header.querySelector("button");
      if (!button) continue;
      let icon = button.querySelector("craft-icon[data-freeform-sort]");
      if (!icon) {
        icon = document.createElement("craft-icon");
        icon.setAttribute("data-freeform-sort", "");
        icon.setAttribute("aria-hidden", "true");
        button.append(icon);
      }
      const sort = header.getAttribute("aria-sort");
      const name =
        sort === "ascending"
          ? "asc"
          : sort === "descending"
            ? "desc"
            : "arrow-up-arrow-down";
      if (icon.getAttribute("name") !== name) icon.setAttribute("name", name);
    }
    for (const button of pane.querySelectorAll<HTMLElement>(
      "craft-card .edit-btn",
    )) {
      button.setAttribute("icon", "pen");
      button.setAttribute("aria-label", "Edit submission");
    }
    for (const chip of pane.querySelectorAll<HTMLElement>(
      "#elements craft-chip[data-status]",
    )) {
      if (chip.querySelector('[slot="status"]')) continue;
      const status = statuses.find(
        (item) => item.handle === chip.dataset.status,
      );
      if (!status) continue;
      const slot = document.createElement("div");
      slot.slot = "status";
      const indicator = document.createElement("craft-indicator");
      indicator.setAttribute("fill", status.color);
      indicator.setAttribute("label", status.label);
      slot.append(indicator);
      chip.prepend(slot);
      chip.setAttribute("show-status", "");
    }
  };
  update();
  const elements = pane.querySelector("#elements");
  if (elements)
    new MutationObserver(update).observe(elements, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-sort"],
    });
}
