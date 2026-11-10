/** Use Freeform's native dialog confirmation on CP pages without the React app. */
export function bindConfirmationForm(
  form: HTMLFormElement,
  dialog: HTMLDialogElement,
): void {
  const cancel = dialog.querySelector<HTMLButtonElement>(
    "[data-confirmation-cancel]",
  );
  const confirm = dialog.querySelector<HTMLButtonElement>(
    "[data-confirmation-accept]",
  );
  let opener: HTMLElement | null = null;
  let submitted = false;

  const dismiss = (): void => {
    dialog.close();
    opener?.focus({ preventScroll: true });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (dialog.open || submitted) return;
    opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    cancel?.focus();
  });
  cancel?.addEventListener("click", dismiss);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dismiss();
  });
  dialog.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    } else if (event.key === "Tab") {
      // Keep focus on the two actions even in browsers with partial dialog support.
      if (event.shiftKey && document.activeElement === cancel) {
        event.preventDefault();
        confirm?.focus();
      } else if (!event.shiftKey && document.activeElement === confirm) {
        event.preventDefault();
        cancel?.focus();
      }
    }
  });
  confirm?.addEventListener("click", () => {
    if (!dialog.open || submitted) return;
    submitted = true;
    confirm.disabled = true;
    form
      .querySelectorAll<HTMLButtonElement>('button[type="submit"]')
      .forEach((button) => {
        button.disabled = true;
      });
    dialog.close();
    // Submit once, after explicit confirmation, without reopening the dialog.
    HTMLFormElement.prototype.submit.call(form);
  });
}
