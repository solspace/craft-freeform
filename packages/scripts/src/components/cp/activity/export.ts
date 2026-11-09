/** Export controls remain outside the replaceable results so filters stay current. */
export function initializeActivityExport(root: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>(
    "#activity-export-dialog",
  );
  const form = dialog?.querySelector<HTMLFormElement>("form");
  const filters = root.querySelector<HTMLFormElement>(".ff-activity-filters");
  const holder = form?.querySelector<HTMLElement>("[data-export-filters]");
  if (!dialog || !form || !filters || !holder) return;
  let opener: HTMLButtonElement | null = null;
  const close = (): void => {
    dialog.close();
    opener?.focus({ preventScroll: true });
  };
  root.addEventListener("click", (event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-activity-export]")
        : null;
    if (!button || button.disabled || dialog.open) return;
    opener = button;
    holder.replaceChildren();
    new FormData(filters).forEach((value, name) => {
      if (
        typeof value !== "string" ||
        !["q", "category", "level", "formId", "submissionId"].includes(name)
      )
        return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      holder.append(input);
    });
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("[data-export-cancel]")?.focus();
  });
  dialog
    .querySelector("[data-export-cancel]")
    ?.addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  // An attachment response leaves the page mounted. Allow another download later.
  form.addEventListener("submit", close);
}
