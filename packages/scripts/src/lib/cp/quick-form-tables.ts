let nextTableId = 0;

type TableLabels = {
  add: string;
  addRow: string;
  removeRow: string;
  rowActions: string;
};

/** Adds Craft's editable-table presentation without replacing live form controls. */
export function enhanceQuickFormTables(
  root: ParentNode,
  labels: TableLabels,
): void {
  for (const table of root.querySelectorAll<HTMLTableElement>(
    "table[data-freeform-table]",
  )) {
    table.classList.add("editable", "fullwidth");
    if (
      !table.id ||
      (table.isConnected && document.getElementById(table.id) !== table)
    ) {
      table.id = `freeform-cp-table-${++nextTableId}`;
    }
    if (!table.closest(".freeform-cp-table")) {
      const parent = table.parentElement!;
      const label = parent.querySelector<HTMLLabelElement>(":scope > label");
      if (label) {
        if (!label.id) label.id = `${table.id}-label`;
        table.setAttribute("aria-labelledby", label.id);
      }
      const add = parent.querySelector<HTMLElement>(
        "[data-freeform-table-add-row]",
      );
      const wrapper = document.createElement("div");
      wrapper.className = "freeform-cp-table";
      wrapper.setAttribute("data-freeform-table-container", "");
      const scroll = document.createElement("div");
      scroll.className = "freeform-cp-table-scroll";
      table.before(wrapper);
      wrapper.append(scroll);
      scroll.append(table);
      if (add) {
        const footer = document.createElement("div");
        footer.className = "freeform-cp-table-buttons";
        wrapper.append(footer);
        footer.append(add);
      }
    }

    const headings = Array.from(
      table.querySelectorAll<HTMLTableCellElement>("thead th"),
    );
    headings.forEach((heading, index) => {
      heading.classList.remove("freeform-label");
      heading.scope = "col";
      if (!heading.id) heading.id = `${table.id}-column-${index}`;
      if (index === headings.length - 1 && !heading.textContent?.trim()) {
        heading.setAttribute("aria-label", labels.rowActions);
      }
    });
    for (const row of table.querySelectorAll<HTMLTableRowElement>(
      "tbody > tr",
    )) {
      for (const cell of Array.from(row.cells)) {
        const input = cell.querySelector<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >("input:not([type=hidden]), select, textarea");
        if (input) {
          const heading = headings[cell.cellIndex];
          if (heading) input.setAttribute("aria-labelledby", heading.id);
          if (input instanceof HTMLSelectElement) {
            cell.classList.add("thin", "table-cell-select");
            if (!input.parentElement?.classList.contains("select")) {
              const select = document.createElement("div");
              select.className = "select small";
              input.before(select);
              select.append(input);
            }
          } else if (
            input instanceof HTMLInputElement &&
            input.type === "radio"
          ) {
            cell.classList.add("table-cell-radio");
            const options = input.parentElement!.parentElement!;
            options.classList.add("freeform-cp-table-options");
            options.setAttribute("role", "radiogroup");
            if (heading) options.setAttribute("aria-labelledby", heading.id);
            // Radio labels already provide each option's accessible name.
            input.removeAttribute("aria-labelledby");
            for (const [index, radio] of Array.from(
              cell.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
            ).entries()) {
              radio.classList.add("radio");
              const match = radio.name.match(/^(.+)\[(\d+)\]\[(\d+)\]$/);
              if (match)
                radio.id = `labeled-${table.id}-${match[2]}-${match[3]}-${index}`;
              const label = radio.nextElementSibling;
              if (label instanceof HTMLLabelElement) label.htmlFor = radio.id;
            }
          } else if (
            input instanceof HTMLInputElement &&
            input.type === "checkbox"
          ) {
            cell.classList.add("table-cell-checkbox");
            input.classList.add("checkbox");
            const match = input.name.match(/^(.+)\[(\d+)\]\[(\d+)\]$/);
            if (match)
              input.id = `labeled-${table.id}-${match[2]}-${match[3]}-0`;
            if (!input.parentElement?.classList.contains("checkbox-wrapper")) {
              const wrapper = document.createElement("div");
              wrapper.className = "checkbox-wrapper";
              input.before(wrapper);
              wrapper.append(input);
            }
            let label = input.nextElementSibling;
            if (!(label instanceof HTMLLabelElement)) {
              label = document.createElement("label");
              const text = document.createElement("span");
              text.className = "visually-hidden";
              text.textContent = heading?.textContent || "";
              label.append(text);
              input.after(label);
            }
            (label as HTMLLabelElement).htmlFor = input.id;
          } else if (
            input instanceof HTMLTextAreaElement ||
            (input instanceof HTMLInputElement &&
              ["text", "number", "email", "url", "tel"].includes(input.type))
          ) {
            const type =
              input instanceof HTMLTextAreaElement
                ? "textarea"
                : input.type === "number"
                  ? "number"
                  : "text";
            cell.classList.add("textual", `table-cell-${type}`);
            input.classList.add("text", "fullwidth");
            if (input instanceof HTMLTextAreaElement) input.rows = 2;
          }
        }
        const remove = cell.querySelector<HTMLElement>(
          "[data-freeform-table-remove-row]",
        );
        if (remove) {
          cell.classList.add("action");
          if (!remove.title)
            remove.title = remove.textContent?.trim() || labels.removeRow;
          remove.setAttribute("aria-label", remove.title);
          remove.classList.add("delete", "icon");
          if (remove.childNodes.length) remove.replaceChildren();
        }
      }
    }
    const add = table
      .closest(".freeform-cp-table")
      ?.querySelector<HTMLElement>("[data-freeform-table-add-row]");
    if (add) {
      add.classList.add("btn", "add", "icon", "dashed");
      if (add.textContent?.trim() === labels.add)
        add.textContent = labels.addRow;
    }
  }
}
