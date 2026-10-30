import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSubmissionStatuses } from "./submission-status";

describe("inline submission status", () => {
  const statuses = [
    { id: 1, name: "New", color: "green" },
    { id: 2, name: "Processed <test>", color: "blue" },
  ];
  let select: (option: HTMLElement) => Promise<void>;
  let saveStatus: ReturnType<typeof vi.fn>;
  let refresh: ReturnType<typeof vi.fn>;
  let notify: ReturnType<typeof vi.fn>;
  let destroy: ReturnType<typeof vi.fn>;
  let cleanup: () => void;

  const button = () => document.querySelector<HTMLButtonElement>("button")!;
  const choose = (id: number) =>
    select(document.querySelector<HTMLElement>(`a[data-status-id="${id}"]`)!);

  beforeEach(() => {
    document.body.innerHTML = `<span data-freeform-submission-status data-submission-id="10" data-status-id="1">
      <span class="ff-status-label green"><span class="ff-status"></span><span class="ff-status-label-text">New</span></span>
    </span><span>Read only status</span>`;
    saveStatus = vi.fn().mockResolvedValue(undefined);
    refresh = vi.fn().mockResolvedValue(undefined);
    notify = vi.fn();
    destroy = vi.fn();
    cleanup = mountSubmissionStatuses(document.body, {
      statuses,
      createMenu: (_button: HTMLElement, callback: typeof select) => {
        select = callback;
        return { destroy, hideMenu: vi.fn() };
      },
      saveStatus,
      refresh,
      notify,
      translate: (message: string) => message,
    });
  });

  it("saves one submission, updates the label safely and refreshes the current list", async () => {
    await choose(2);
    expect(saveStatus).toHaveBeenCalledWith(10, 2);
    expect(button().textContent).toBe("Processed <test>");
    expect(button().querySelector("test")).toBeNull();
    expect(
      document.querySelector("a.sel")?.getAttribute("data-status-id"),
    ).toBe("2");
    expect(refresh).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledWith("success", "Status updated.");
    expect(button().disabled).toBe(false);
  });

  it("keeps the current status on failed saves and allows retry", async () => {
    saveStatus.mockRejectedValueOnce(new Error("Request failed"));
    await choose(2);
    expect(button().textContent?.trim()).toBe("New");
    expect(
      document.querySelector("a.sel")?.getAttribute("data-status-id"),
    ).toBe("1");
    expect(refresh).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith("error", "Could not update status.");
    expect(button().disabled).toBe(false);
    await choose(2);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("ignores duplicate changes while a save is pending", async () => {
    let resolveSave!: () => void;
    saveStatus.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    const pending = choose(2);
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-busy")).toBe("true");
    await choose(2);
    expect(saveStatus).toHaveBeenCalledOnce();
    resolveSave();
    await pending;
    expect(button().hasAttribute("aria-busy")).toBe(false);
  });

  it("does not save the already selected status", async () => {
    await choose(1);
    expect(saveStatus).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("requests focus restoration after a keyboard status change", async () => {
    button().focus();
    await choose(2);
    expect(refresh).toHaveBeenCalledWith("10");
  });

  it("keeps the saved status and explains refresh failures", async () => {
    refresh.mockRejectedValue(new Error("Reload failed"));
    await choose(2);
    expect(button().textContent).toBe("Processed <test>");
    expect(notify).toHaveBeenLastCalledWith(
      "error",
      expect.stringContaining("Status updated, but"),
    );
    expect(button().disabled).toBe(false);
  });

  it("leaves read-only labels alone and destroys menus when the list changes", () => {
    expect(document.querySelectorAll("button")).toHaveLength(1);
    cleanup();
    expect(destroy).toHaveBeenCalledOnce();
    expect(document.querySelectorAll("button")).toHaveLength(0);
    expect(document.body.textContent).toContain("Read only status");
  });

  it("does not select the submission row when a status is clicked", () => {
    const onClick = vi.fn();
    document.body.addEventListener("click", onClick, { once: true });
    button().click();
    expect(onClick).not.toHaveBeenCalled();
    document.body.removeEventListener("click", onClick);
  });

  it("ignores selection from a menu belonging to a replaced list", async () => {
    const option = document.querySelector<HTMLElement>(
      'a[data-status-id="2"]',
    )!;
    cleanup();
    await select(option);
    expect(saveStatus).not.toHaveBeenCalled();
  });
});
