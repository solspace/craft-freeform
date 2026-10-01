/** Bring the legacy Twig sidebar onto Craft 6's native navigation behavior. */
export function enhanceCraft6Navigation(root: ParentNode = document): void {
  const items = root.querySelectorAll<HTMLElement>(
    ".global-sidebar__nav > craft-nav-item",
  );

  for (const item of items) {
    if (!item.querySelector(':scope > [slot="subnav"]')) {
      continue;
    }

    // Let the component choose a flyout when the sidebar collapses to icons.
    // In an expanded sidebar the current section stays inline; peers fly out.
    if (!item.hasAttribute("active")) {
      item.setAttribute("subnav-display", "flyout");
    }

    for (const indicator of item.querySelectorAll(".nav-indicator")) {
      const icon = indicator.parentElement;
      if (icon?.getAttribute("slot") === "icon") {
        icon.remove();
      }
    }

    if (item.id !== "nav-freeform-link") {
      continue;
    }

    // These links have already been filtered by Freeform's permissions.
    const settings = Array.from(
      item.querySelectorAll<HTMLElement>("craft-nav-item[href]"),
    ).find((link) => {
      const href = link.getAttribute("href");
      return (
        href &&
        new URL(href, document.baseURI).pathname.endsWith("/freeform/settings")
      );
    });
    if (!settings || item.querySelector(":scope > [data-freeform-settings]")) {
      continue;
    }

    const action = document.createElement("craft-button");
    action.setAttribute("data-freeform-settings", "");
    action.setAttribute("slot", "actions");
    action.setAttribute("href", settings.getAttribute("href") as string);
    action.setAttribute("icon", "gear");
    action.setAttribute("variant", "plain");
    action.setAttribute("size", "small");
    action.setAttribute(
      "aria-label",
      settings.textContent?.trim() || "Settings",
    );
    item.append(action);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    enhanceCraft6Navigation(),
  );
} else {
  enhanceCraft6Navigation();
}
