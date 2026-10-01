/** Bring the legacy Twig sidebar onto Craft 6's native navigation behavior. */
interface CraftNavItem extends HTMLElement {
  requestUpdate?: () => void;
}

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
        const row = icon.parentElement as CraftNavItem | null;
        icon.remove();
        // Craft derives its prefix column from the slotted icon at render time.
        // Removing that slot doesn't notify the row to recalculate its layout.
        row?.requestUpdate?.();
      }
    }

    for (const row of item.querySelectorAll("craft-nav-item")) {
      row.toggleAttribute(
        "current",
        row.hasAttribute("active") &&
          !row.querySelector("craft-nav-item[active]"),
      );
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
    action.setAttribute("icon", "");
    action.setAttribute("variant", "plain");
    action.setAttribute("size", "small");
    const label = settings.textContent?.trim() || "Settings";
    action.setAttribute("aria-label", label);
    // Give the icon a fixed size rather than compounding the button and icon's
    // relative font-size reductions.
    const icon = document.createElement("craft-icon");
    icon.setAttribute("name", "gear");
    icon.setAttribute("aria-hidden", "true");
    // In link mode Craft names the inner anchor, not the component's host.
    const accessibleLabel = document.createElement("span");
    accessibleLabel.className = "cp-visually-hidden";
    accessibleLabel.textContent = label;
    action.append(icon, accessibleLabel);
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
