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
  const actions = form?.querySelector<HTMLElement>("#header #action-buttons");
  if (form && actions) {
    let footer = form.querySelector<HTMLElement>("#footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.id = "footer";
    }
    footer.classList.add("freeform-form-footer");
    footer.append(actions);
    form.append(footer);
    const pageFooter = root.querySelector<HTMLElement>("#global-footer");
    if (pageFooter) {
      pageFooter.classList.add("freeform-footer-notices");
      footer.before(pageFooter);
    }
  }

  // Use Craft's native nav item while keeping the existing disclosure (and
  // its live listeners, cookies, and expanded state) as the toggle's owner.
  const sidebarFooter = root.querySelector<HTMLElement>(
    ".global-sidebar__footer",
  );
  const trigger = sidebarFooter?.querySelector<HTMLButtonElement>(
    '#sidebar-trigger > button[type="button"]',
  );
  if (
    sidebarFooter &&
    trigger &&
    !sidebarFooter.querySelector("[data-freeform-sidebar-toggle]")
  ) {
    const list = document.createElement("craft-nav-list");
    const item = document.createElement("craft-nav-item");
    item.setAttribute("button", "");
    item.setAttribute("data-freeform-sidebar-toggle", "");
    list.append(item);
    sidebarFooter.prepend(list);

    const update = (): void => {
      const collapsed = document.body.dataset.sidebar === "collapsed";
      const rtl = document.body.classList.contains("rtl");
      const label = collapsed ? "Expand" : "Collapse";
      item.textContent =
        typeof Craft !== "undefined" && Craft.t ? Craft.t("app", label) : label;
      item.setAttribute(
        "icon",
        collapsed
          ? rtl
            ? "arrow-left-from-line"
            : "arrow-right-from-line"
          : rtl
            ? "arrow-right-to-line"
            : "arrow-left-to-line",
      );
      item.toggleAttribute("icon-only", collapsed);
      item.setAttribute("aria-controls", "global-sidebar");
      item.setAttribute("aria-expanded", String(!collapsed));
    };
    item.addEventListener("click", async () => {
      trigger.click();
      const disclosure = trigger.parentElement as HTMLElement & {
        updateComplete?: Promise<unknown>;
      };
      const row = item as HTMLElement & { updateComplete?: Promise<unknown> };
      await disclosure.updateComplete;
      await row.updateComplete;
      row.focus();
    });
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-sidebar"],
    });
    update();
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
