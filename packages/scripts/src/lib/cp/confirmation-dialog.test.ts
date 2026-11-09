import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindConfirmationForm } from "./confirmation-dialog";

describe("CP confirmation dialog", () => {
  let form: HTMLFormElement;
  let dialog: HTMLDialogElement;
  let opener: HTMLButtonElement;
  let cancel: HTMLButtonElement;
  let confirm: HTMLButtonElement;
  let submit: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = `<form action="/actions/freeform/activity/clear" method="post">
      <input name="throughId" value="42" type="hidden">
      <button type="submit">Clear activity history</button>
    </form><dialog aria-labelledby="title"><h2 id="title">Clear activity history?</h2>
      <button type="button" data-confirmation-cancel>Cancel</button>
      <button type="button" data-confirmation-accept>Clear history</button>
    </dialog>`;
    form = document.querySelector("form")!;
    dialog = document.querySelector("dialog")!;
    opener = form.querySelector("button")!;
    cancel = dialog.querySelector("[data-confirmation-cancel]")!;
    confirm = dialog.querySelector("[data-confirmation-accept]")!;
    dialog.showModal = vi.fn(() => {
      dialog.open = true;
    });
    dialog.close = vi.fn(() => {
      dialog.open = false;
    });
    submit = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(() => {});
    bindConfirmationForm(form, dialog);
  });

  const open = () => {
    opener.focus();
    opener.click();
  };

  it("opens with Cancel focused and never posts on Cancel or Escape", () => {
    open();
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(cancel);
    expect(submit).not.toHaveBeenCalled();
    cancel.click();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    open();
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(submit).not.toHaveBeenCalled();
    open();
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(dialog.open).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });

  it("posts the original bounded clear request exactly once after confirmation", () => {
    // A hidden or stale confirm action cannot submit before the modal opens.
    confirm.click();
    expect(submit).not.toHaveBeenCalled();
    open();
    opener.click();
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    confirm.click();
    confirm.click();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.instances[0]).toBe(form);
    expect(new FormData(form).get("throughId")).toBe("42");
    expect(opener.disabled).toBe(true);
    expect(dialog.open).toBe(false);
  });

  it("keeps keyboard focus within the confirmation actions", () => {
    open();
    cancel.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(confirm);
    confirm.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(cancel);
  });
});
