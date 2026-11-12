/** Compatibility for Craft 6's index while it still serializes status arrays as labels. */
export function normalizeNativeStatusOptions(root) {
  for (const menu of root.querySelectorAll("craft-select-rich")) {
    for (const content of menu.querySelectorAll("div:has(> craft-indicator)")) {
      const text = [...content.childNodes].find(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim().startsWith("{"),
      );
      if (!text) continue;
      let status;
      try {
        status = JSON.parse(text.textContent);
      } catch {
        continue;
      }
      if (typeof status.label !== "string" || typeof status.color !== "string")
        continue;
      text.textContent = ` ${status.label}`;
      content
        .querySelector("craft-indicator")
        .setAttribute("fill", status.color);
    }
  }
}

/** The same status choices, save endpoint, Undo history, and row isolation as FF5. */
export function mountNativeSubmissionStatuses(
  root,
  { statuses, saveStatus, refresh, notify, translate },
) {
  if (!statuses.length) return;
  for (const label of root.querySelectorAll(
    "[data-freeform-submission-status]",
  )) {
    if (label.querySelector(".ff-native-status-menu")) continue;
    const menu = document.createElement("craft-action-menu");
    menu.className = "ff-native-status-menu";
    const button = document.createElement("button");
    button.type = "button";
    button.slot = "invoker";
    button.className = "ff-native-status-button";
    button.setAttribute(
      "aria-label",
      `${translate("Change status")}: ${label.textContent.trim()}`,
    );
    button.append(...label.childNodes);
    const content = document.createElement("div");
    content.slot = "content";
    let pending = false;
    for (const status of statuses) {
      const item = document.createElement("craft-action-item");
      const indicator = document.createElement("craft-indicator");
      indicator.setAttribute("fill", status.color);
      const choice = document.createElement("span");
      choice.className = "ff-native-status-choice";
      choice.append(indicator, document.createTextNode(status.name));
      item.append(choice);
      if (String(status.id) === label.dataset.statusId) {
        const check = document.createElement("craft-icon");
        check.setAttribute("name", "check");
        check.setAttribute("slot", "suffix");
        item.append(check);
      }
      item.setAttribute(
        "aria-current",
        String(String(status.id) === label.dataset.statusId),
      );
      item.addEventListener("click", async () => {
        if (pending || String(status.id) === label.dataset.statusId) return;
        pending = true;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        try {
          await saveStatus(Number(label.dataset.submissionId), status.id);
        } catch {
          notify("error", translate("Could not update status."));
          pending = false;
          button.disabled = false;
          button.removeAttribute("aria-busy");
          return;
        }
        label.dataset.statusId = String(status.id);
        const badge = document.createElement("craft-badge");
        badge.setAttribute("fill", status.color);
        badge.textContent = status.name;
        button.replaceChildren(badge);
        notify("success", translate("Status updated."));
        try {
          await refresh(label.dataset.submissionId);
        } catch {
          notify(
            "error",
            translate(
              "Status updated, but the list could not be refreshed. Reload the page to see the latest submissions.",
            ),
          );
        } finally {
          pending = false;
          button.disabled = false;
          button.removeAttribute("aria-busy");
        }
      });
      content.append(item);
    }
    menu.append(button, content);
    label.replaceChildren(menu);
    // Let the native menu handle its invoker before stopping table row selection.
    for (const event of [
      "mousedown",
      "click",
      "dblclick",
      "keydown",
      "keyup",
    ]) {
      menu.addEventListener(event, (event) => event.stopPropagation());
    }
  }
}
