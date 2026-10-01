/** Match Craft 6's page chrome while preserving the legacy CP's live controls. */
export function enhanceCraft6Shell(root: ParentNode = document): void {
  const container = root.querySelector<HTMLElement>("#global-container");
  const header = root.querySelector<HTMLElement>("#global-header");
  if (!container || !header) return;

  header.setAttribute("data-theme", "dark");
  header.setAttribute("role", "banner");
  header.removeAttribute("aria-label");
  container.prepend(header);

  const start = header.querySelector<HTMLElement>(":scope > .flex");
  const system = root.querySelector<HTMLElement>("#system-info");
  if (start && system) start.prepend(system);

  const indicators = root.querySelector<HTMLTemplateElement>(
    "#freeform-shell-indicators",
  );
  if (indicators && !header.querySelector("[data-freeform-shell-indicators]")) {
    header.insertBefore(
      indicators.content.cloneNode(true),
      header.querySelector("cp-notification-center"),
    );
  }

  // Keep save controls inside their original form, in Craft's sticky footer row.
  const form = root.querySelector<HTMLFormElement>("form#main-form");
  const actions = form?.querySelector<HTMLElement>("#header .buttons");
  if (form && actions) {
    let footer = form.querySelector<HTMLElement>("#footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.id = "footer";
    }
    footer.classList.add("freeform-form-footer");
    footer.append(actions);
    form.append(footer);
  }

  // Legacy icon wrappers are larger than the icons in Craft's native sidebar.
  for (const wrapper of root.querySelectorAll<HTMLElement>(
    '.global-sidebar__nav craft-nav-item > span[slot="icon"]',
  )) {
    const row = wrapper.parentElement as
      | (HTMLElement & { requestUpdate?: () => void })
      | null;
    const hasSvg = !!wrapper.querySelector("svg");
    // The legacy SVG helper treats Craft's custom icon name as a file path.
    // Let the native loader resolve GraphQL's icon when that leaves it empty.
    const missingGraphql =
      !wrapper.children.length &&
      !wrapper.textContent?.trim() &&
      /\/graphql\/?$/.test(
        new URL(row?.getAttribute("href") || "", document.baseURI).pathname,
      );
    if (!hasSvg && !missingGraphql) continue;
    const icon = document.createElement("craft-icon");
    icon.setAttribute("slot", "icon");
    icon.setAttribute("aria-hidden", "true");
    if (missingGraphql) icon.setAttribute("name", "custom-icons/graphql");
    icon.append(...wrapper.childNodes);
    wrapper.replaceWith(icon);
    row?.requestUpdate?.();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => enhanceCraft6Shell());
} else {
  enhanceCraft6Shell();
}
