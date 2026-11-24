import { bindConfirmationForm } from "@lib/cp/confirmation-dialog";

for (const form of document.querySelectorAll<HTMLFormElement>(
  "form[data-merge-confirmation]",
)) {
  const id = form.dataset.mergeConfirmation;
  if (!id) continue;
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  const trigger = document.querySelector<HTMLButtonElement>(
    `button[aria-controls="${id}"]`,
  );
  if (dialog && trigger && typeof dialog.showModal === "function") {
    bindConfirmationForm(form, dialog);
    trigger.disabled = false;
  }
}
