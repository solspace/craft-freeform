export const askForConfirmation = (container: HTMLElement) => {
  const confirmMessage = container.dataset.confirmMessage;
  const dialogSelector = container.dataset.dialogSelector;
  const isDialog = dialogSelector !== undefined;

  let dialog: HTMLDialogElement;
  if (isDialog) {
    if (dialogSelector) {
      dialog = document.querySelector(dialogSelector) as HTMLDialogElement;
    }

    if (!dialog) {
      dialog = createDialog(confirmMessage);
    }
  }

  const promise = new Promise((resolve) => {
    if (!isDialog) {
      return resolve(confirm(confirmMessage));
    }

    dialog.showModal();

    const handleClose = () => {
      resolve(dialog.returnValue === "ok");
      dialog.removeEventListener("close", handleClose);
    };

    dialog.addEventListener("close", handleClose);
  });

  return promise;
};

const DIALOG_ID = "freeform-file-upload-confirm-dialog";
const createDialog = (message: string) => {
  if (document.getElementById(DIALOG_ID)) {
    return document.getElementById(DIALOG_ID) as HTMLDialogElement;
  }

  const dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.innerHTML = `
    <form method="dialog">
      <p>${message}</p>
      <menu>
        <button value="cancel">Cancel</button>
        <button value="ok">OK</button>
      </menu>
    </form>
  `;

  document.body.appendChild(dialog);

  return dialog;
};
