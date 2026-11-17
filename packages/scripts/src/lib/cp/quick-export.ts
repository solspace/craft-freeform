const boundForms = new WeakSet<HTMLFormElement>();

/** Keep form-specific fields out of the POST while retaining their selections. */
export function bindQuickExportFields(form: HTMLFormElement): void {
  if (boundForms.has(form)) return;
  const selector = form.querySelector<HTMLSelectElement>(
    'select[name="form_id"]',
  );
  if (!selector) return;
  boundForms.add(form);

  const lists = Array.from(
    form.querySelectorAll<HTMLElement>(".form-field-list"),
  );
  const update = () => {
    for (const list of lists) {
      const hidden = list.dataset.id !== selector.value;
      list.hidden = hidden;
      list.classList.toggle("hidden", hidden);
      for (const input of list.querySelectorAll<HTMLInputElement>("input")) {
        input.disabled = hidden;
      }
      const checkboxes = Array.from(
        list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
      );
      const count = list.querySelector<HTMLElement>(
        "[data-export-field-count]",
      );
      if (count) {
        count.textContent = (count.dataset.countLabel || "")
          .replace(
            "{count}",
            String(checkboxes.filter((input) => input.checked).length),
          )
          .replace("{total}", String(checkboxes.length));
      }
    }
  };

  selector.addEventListener("change", update);
  form.addEventListener("change", (event) => {
    if (event.target !== selector) update();
  });
  form.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>(
      "[data-export-field-selection]",
    );
    const list = button?.closest<HTMLElement>(".form-field-list");
    if (!button || !list || list.hidden) return;
    for (const checkbox of list.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    )) {
      checkbox.checked = button.dataset.exportFieldSelection === "all";
    }
    update();
  });
  update();
}
