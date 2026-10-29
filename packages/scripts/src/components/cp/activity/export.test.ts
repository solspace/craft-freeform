import { beforeEach, describe, expect, it, vi } from "vitest";
import { initializeActivityExport } from "./export";

describe("Activity export", () => {
  let root: HTMLElement;
  let dialog: HTMLDialogElement;
  beforeEach(() => {
    document.body.innerHTML = `<main data-activity-log>
      <form class="ff-activity-filters"><input name="q" value="submission"><input name="formId" value="12"><input name="level" value="all"><input name="view" value="submissions"><input name="before" value="100"></form>
      <div data-activity-results><button type="button" data-activity-export>Export…</button></div>
      <dialog id="activity-export-dialog"><form><div data-export-filters></div><select name="exportFormat"><option value="csv">CSV</option><option value="json">JSON</option></select><button type="button" data-export-cancel>Cancel</button><button type="submit">Download</button></form></dialog>
    </main>`;
    root = document.querySelector("main")!;
    dialog = root.querySelector("dialog")!;
    dialog.showModal = vi.fn(() => {
      dialog.open = true;
    });
    dialog.close = vi.fn(() => {
      dialog.open = false;
    });
    initializeActivityExport(root);
  });

  it("exports current filters without page cursors or grouped-view state", () => {
    root.querySelector<HTMLButtonElement>("[data-activity-export]")!.click();
    const data = new FormData(dialog.querySelector("form")!);
    expect(data.get("q")).toBe("submission");
    expect(data.get("formId")).toBe("12");
    expect(data.get("view")).toBeNull();
    expect(data.get("before")).toBeNull();
    root.querySelector<HTMLButtonElement>("[data-export-cancel]")!.click();
    expect(dialog.open).toBe(false);
  });

  it("supports repeated downloads after live results are replaced", () => {
    root.querySelector<HTMLButtonElement>("[data-activity-export]")!.click();
    dialog
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { cancelable: true }));
    expect(dialog.open).toBe(false);
    root.querySelector("[data-activity-results]")!.innerHTML =
      '<button type="button" data-activity-export>Export…</button>';
    root.querySelector<HTMLInputElement>('[name="formId"]')!.value = "15";
    root.querySelector<HTMLButtonElement>("[data-activity-export]")!.click();
    expect(new FormData(dialog.querySelector("form")!).get("formId")).toBe(
      "15",
    );
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(dialog.open).toBe(false);
  });
});
