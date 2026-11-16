export function attachExportChecklist(checklist: HTMLElement): void {
  const trigger = checklist.querySelector<HTMLButtonElement>(
    "[data-checklist-toggle]",
  );
  const summary = checklist.querySelector<HTMLElement>(
    "[data-checklist-summary]",
  );
  const panel = checklist.querySelector<HTMLElement>(
    "[data-checklist-options]",
  );
  if (!trigger || !summary || !panel) return;

  const checkboxes = Array.from(
    checklist.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  );
  const all = checkboxes.find((input) => input.classList.contains("all"));
  const options = checkboxes.filter((input) => input !== all);
  let pointerInside = false;

  // A label's pointerdown can focus Craft's surrounding content container
  // before the browser activates its checkbox. Keep the panel visible until
  // that activation has completed; otherwise the click never reaches it.
  document.addEventListener(
    "pointerdown",
    (event) => {
      pointerInside =
        event.target instanceof Node && checklist.contains(event.target);
    },
    true,
  );
  const releasePointer = () => {
    pointerInside = false;
  };
  document.addEventListener("pointerup", releasePointer);
  document.addEventListener("pointercancel", releasePointer);

  const showCount = (count: number) => {
    summary.textContent = (checklist.dataset.countLabel || "").replace(
      "{count}",
      String(count),
    );
  };
  const updateSummary = () => {
    const selected = options.filter((input) => input.checked);
    summary.textContent = "";
    if (all?.checked || (!all && selected.length === options.length)) {
      summary.textContent = checklist.dataset.allLabel || "";
    } else if (!selected.length) {
      summary.textContent = checklist.dataset.emptyLabel || "";
    } else if (selected.length > 4) {
      showCount(selected.length);
    } else {
      selected.forEach((input, index) => {
        const item = document.createElement("span");
        item.className = "ff-export-summary-selection";
        const label = input.labels?.[0];
        const contents = label?.querySelector(".ff-export-option-label");
        if (contents) item.append(contents.cloneNode(true));
        else
          item.append(
            document.createTextNode(label?.textContent?.trim() || ""),
          );
        if (index < selected.length - 1)
          item.append(document.createTextNode(", "));
        summary.append(item);
      });
      if (
        selected.length > 1 &&
        summary.clientWidth > 0 &&
        summary.scrollWidth > summary.clientWidth
      ) {
        showCount(selected.length);
      }
    }
  };
  const close = (restoreFocus = false) => {
    panel.hidden = true;
    checklist.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };

  checklist.addEventListener("change", () => {
    // Let Craft finish updating the native "All" checkbox and its children.
    Promise.resolve().then(updateSummary);
  });
  trigger.addEventListener("click", () => {
    if (!panel.hidden) {
      close();
      return;
    }
    document
      .querySelectorAll<HTMLElement>("[data-export-checklist]")
      .forEach((other) => {
        if (other === checklist) return;
        const otherPanel = other.querySelector<HTMLElement>(
          "[data-checklist-options]",
        );
        if (otherPanel) otherPanel.hidden = true;
        other.classList.remove("is-open");
        other
          .querySelector("[data-checklist-toggle]")
          ?.setAttribute("aria-expanded", "false");
      });
    panel.hidden = false;
    checklist.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    updateSummary();
  });
  checklist.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  });
  checklist.addEventListener("focusout", (event) => {
    if (
      !pointerInside &&
      event.relatedTarget instanceof Node &&
      !checklist.contains(event.relatedTarget)
    )
      close();
  });
  document.addEventListener("click", (event) => {
    // Updating the summary replaces the clicked name/icon. The event's original
    // path still identifies that click as internal after its target is removed.
    if (!event.composedPath().includes(checklist)) close();
  });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateSummary).observe(checklist);
  }
  updateSummary();
}
