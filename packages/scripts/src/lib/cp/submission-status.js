/** Enhance editable status labels only within the submissions index. */
export function mountSubmissionStatuses(container, options) {
  const { statuses, createMenu, saveStatus, refresh, notify, translate } =
    options;
  const cleanups = [];

  for (const label of container.querySelectorAll(
    "[data-freeform-submission-status]",
  )) {
    const originalNodes = [...label.childNodes];
    const usePill = !!label.querySelector(".ff-status-label");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menubtn ff-submission-status-button";
    button.classList.toggle("ff-submission-status-button--pill", usePill);
    button.setAttribute("aria-label", translate("Change status"));
    button.append(...originalNodes);
    const menu = document.createElement("div");
    menu.className = "menu ff-submission-status-menu";
    const list = document.createElement("ul");
    menu.append(list);
    for (const status of statuses) {
      const item = document.createElement("li");
      const option = document.createElement("a");
      option.dataset.statusId = String(status.id);
      option.classList.toggle(
        "sel",
        String(status.id) === label.dataset.statusId,
      );
      const indicator = document.createElement("span");
      indicator.className = `status ${status.color}`;
      option.append(indicator, document.createTextNode(status.name));
      item.append(option);
      list.append(item);
    }
    label.replaceChildren(button, menu);

    // Keep pointer and keyboard interaction within the menu, away from row selection.
    const stopPropagation = (event) => event.stopPropagation();
    for (const event of [
      "mousedown",
      "click",
      "dblclick",
      "keydown",
      "keyup",
    ]) {
      button.addEventListener(event, stopPropagation);
    }

    let pending = false;
    let disposed = false;
    const menuButton = createMenu(button, async (option) => {
      const status = statuses.find(
        (status) => String(status.id) === option.dataset.statusId,
      );
      if (
        !status ||
        disposed ||
        pending ||
        String(status.id) === label.dataset.statusId
      ) {
        return;
      }

      const hadFocus =
        document.activeElement === button ||
        menu.contains(document.activeElement);
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
      for (const option of list.querySelectorAll("a")) {
        option.classList.toggle(
          "sel",
          option.dataset.statusId === String(status.id),
        );
      }
      if (usePill) {
        const pill = document.createElement("span");
        pill.className = `ff-status-label ${status.color}`;
        const indicator = document.createElement("span");
        indicator.className = `ff-status ${status.color}`;
        const text = document.createElement("span");
        text.className = "ff-status-label-text";
        text.textContent = status.name;
        pill.append(indicator, text);
        button.replaceChildren(pill);
      } else {
        button.textContent = status.name;
      }
      notify("success", translate("Status updated."));

      // Refresh rather than patching a row: status filters, sort order and totals can change.
      try {
        await refresh(hadFocus ? label.dataset.submissionId : null);
      } catch {
        notify(
          "error",
          translate(
            "Status updated, but the list could not be refreshed. Reload the page to see the latest submissions.",
          ),
        );
      } finally {
        pending = false;
        if (!disposed) {
          button.disabled = false;
          button.removeAttribute("aria-busy");
        }
      }
    });

    cleanups.push(() => {
      disposed = true;
      menuButton.hideMenu();
      menuButton.destroy();
      menu.remove();
      label.replaceChildren(...originalNodes);
    });
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
