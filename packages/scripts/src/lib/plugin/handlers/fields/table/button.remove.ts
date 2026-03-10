import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import { removeElement } from "@lib/plugin/helpers/elements";

let isRegistered = false;

export const registerRemoveButtons = (instance: Freeform) => {
  const tables = instance.form.querySelectorAll("[data-freeform-table]");
  tables.forEach((table) => {
    const removeRowButtons = table.querySelectorAll(
      "[data-freeform-table-remove-row]",
    );
    for (let j = 0; j < removeRowButtons.length; j++) {
      const removeButton = removeRowButtons[j];
      removeButton.addEventListener("click", handleRemove(instance));
    }
  });

  if (!isRegistered) {
    isRegistered = true;
    instance.form.addEventListener(
      events.table.afterRowAdded,
      (event: CustomEvent & { row: HTMLTableRowElement }) => {
        const row = event.row;
        const removeRowButton = row.querySelector<HTMLButtonElement>(
          "[data-freeform-table-remove-row]",
        );
        if (removeRowButton) {
          removeRowButton.addEventListener("click", handleRemove(instance));
        }
      },
    );
  }
};

const handleRemove = (instance: Freeform) => (event: Event) => {
  const target = event.target as HTMLElement;
  const tbody = target.closest("tbody");
  const table = target.closest("table");
  const row = target.closest("tr");

  if (!tbody || !table || !row) {
    return;
  }

  const totalRows = tbody.querySelectorAll("tr").length;

  if (totalRows <= 1) {
    return;
  }

  const exactRows = table.getAttribute("data-exact-rows");
  if (exactRows) {
    return;
  }

  const minRows = table.getAttribute("data-min-rows");
  if (minRows) {
    const min = parseInt(minRows, 10);
    if (totalRows - 1 < min) {
      return;
    }
  }

  instance._dispatchEvent(events.table.onRemoveRow, { table, row });
  removeElement(row);
  instance._dispatchEvent(events.table.afterRemoveRow, { table });
};
