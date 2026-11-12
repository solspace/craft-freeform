import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mountNativeSubmissionStatuses,
  normalizeNativeStatusOptions,
} from "./native-submission-status";

describe("native status editing", () => {
  beforeEach(() => {
    document.body.innerHTML = `<span data-freeform-submission-status data-submission-id="69" data-status-id="2"><craft-badge fill="teal">Open</craft-badge></span>`;
  });
  const fixture = () => ({
    statuses: [
      { id: 1, name: "Pending", color: "orange" },
      { id: 2, name: "Open", color: "teal" },
    ],
    saveStatus: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
    translate: (value: string) => value,
  });
  it("preserves native badges, isolates row selection, and mounts only once", async () => {
    const options = fixture();
    mountNativeSubmissionStatuses(document, options);
    mountNativeSubmissionStatuses(document, options);
    expect(document.querySelectorAll("craft-action-menu")).toHaveLength(1);
    expect(document.querySelector("button craft-badge")?.textContent).toBe(
      "Open",
    );
    const rowClick = vi.fn();
    document.body.addEventListener("click", rowClick, { once: true });
    document.querySelector("button")!.click();
    expect(rowClick).not.toHaveBeenCalled();
    document.querySelectorAll<HTMLElement>("craft-action-item")[1].click();
    expect(options.saveStatus).not.toHaveBeenCalled();
    document.querySelector<HTMLElement>("craft-action-item")!.click();
    await vi.waitFor(() => expect(options.refresh).toHaveBeenCalledWith("69"));
    expect(options.saveStatus).toHaveBeenCalledExactlyOnceWith(69, 1);
    expect(document.querySelector("button craft-badge")?.textContent).toBe(
      "Pending",
    );
    expect(
      document.querySelector("button craft-badge")?.getAttribute("fill"),
    ).toBe("orange");
  });
  it("keeps the old status and permits retry after a failed save", async () => {
    const options = fixture();
    options.saveStatus.mockRejectedValueOnce(new Error("Save failed"));
    mountNativeSubmissionStatuses(document, options);
    document.querySelector<HTMLElement>("craft-action-item")!.click();
    await vi.waitFor(() =>
      expect(options.notify).toHaveBeenCalledWith(
        "error",
        "Could not update status.",
      ),
    );
    expect(document.querySelector("button")!.disabled).toBe(false);
    expect(document.querySelector("button craft-badge")?.textContent).toBe(
      "Open",
    );
    expect(options.refresh).not.toHaveBeenCalled();
    document.querySelector<HTMLElement>("craft-action-item")!.click();
    await vi.waitFor(() => expect(options.refresh).toHaveBeenCalledOnce());
  });
  it("normalizes legacy status objects in the native filter without changing option values", () => {
    document.body.innerHTML = `<craft-select-rich><craft-option value="pending"><div><craft-indicator fill="sky"></craft-indicator> {"label":"Pending","color":"orange"}</div></craft-option></craft-select-rich>`;
    normalizeNativeStatusOptions(document);
    normalizeNativeStatusOptions(document);
    expect(document.querySelector("craft-option")!.textContent.trim()).toBe(
      "Pending",
    );
    expect(document.querySelector("craft-option")!.getAttribute("value")).toBe(
      "pending",
    );
    expect(
      document.querySelector("craft-indicator")!.getAttribute("fill"),
    ).toBe("orange");
  });
});
