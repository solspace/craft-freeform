import { afterEach, describe, expect, it, vi } from "vitest";
import { mountSubmissionUploads } from "./submission-uploads";

function fixture() {
  document.body.innerHTML = `<form><div data-submission-upload data-remove-confirm="Remove this file?">
    <div class="file-preview"><div class="element"><input type="hidden" name="attachment[]" value="42"><button type="button" data-upload-remove>Remove</button></div><p data-upload-empty hidden>No files uploaded</p></div>
    <input type="file" name="attachment[]" multiple data-upload-input>
    <button type="button" data-upload-choose hidden>Upload files</button>
    <button type="button" data-upload-clear hidden>Clear selection</button>
    <div data-upload-pending hidden><ul data-upload-filenames></ul></div>
  </div></form>`;
  mountSubmissionUploads(document.body);
  return document.querySelector<HTMLInputElement>("[data-upload-input]")!;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("submission uploads", () => {
  it("shows safely rendered pending filenames without changing saved references and clears the selection", () => {
    const input = fixture();
    const files = [
      new File(["test"], "<b>brief</b>.pdf"),
      new File(["test"], "photo.jpg"),
    ];
    let selected: File[] = files;
    Object.defineProperty(input, "files", { get: () => selected });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      document.querySelector("[data-upload-pending]")?.hasAttribute("hidden"),
    ).toBe(false);
    expect(document.querySelector("[data-upload-filenames]")?.textContent).toBe(
      "<b>brief</b>.pdfphoto.jpg",
    );
    expect(document.querySelector("[data-upload-filenames] b")).toBeNull();
    expect(
      document.querySelector<HTMLInputElement>('input[type="hidden"]')?.value,
    ).toBe("42");
    // Clearing a real file input empties its FileList; emulate that native behavior.
    Object.defineProperty(input, "value", {
      set: () => {
        selected = [];
      },
    });
    document.querySelector<HTMLButtonElement>("[data-upload-clear]")!.click();
    expect(
      document.querySelector("[data-upload-pending]")?.hasAttribute("hidden"),
    ).toBe(true);
    expect(
      document.querySelector("[data-upload-filenames]")?.children.length,
    ).toBe(0);
    expect(document.activeElement).toBe(
      document.querySelector("[data-upload-choose]"),
    );
    expect(
      document.querySelector<HTMLInputElement>('input[type="hidden"]')?.value,
    ).toBe("42");
  });

  it("removes only the attachment reference after confirmation and restores the empty state", () => {
    fixture();
    mountSubmissionUploads(document.body);
    const picker = vi.spyOn(
      document.querySelector<HTMLInputElement>("[data-upload-input]")!,
      "click",
    );
    document.querySelector<HTMLButtonElement>("[data-upload-choose]")!.click();
    expect(picker).toHaveBeenCalledTimes(1);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const remove = document.querySelector<HTMLButtonElement>(
      "[data-upload-remove]",
    )!;
    remove.click();
    expect(document.querySelector('input[value="42"]')).not.toBeNull();
    confirm.mockReturnValue(true);
    remove.click();
    expect(document.querySelector('input[value="42"]')).toBeNull();
    expect(
      document.querySelector("[data-upload-empty]")?.hasAttribute("hidden"),
    ).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
