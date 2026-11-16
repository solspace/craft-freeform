import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initializeActivityBadge } from "./badge";

const result = (count: number) => ({
  count,
  formattedCount: String(count),
  label: `${count} notifications`,
});

describe("Activity Log navigation badge", () => {
  let cleanup: (() => void) | undefined;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  });
  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function mount(modern = true) {
    document.body.innerHTML = `<a href="/admin/freeform/activity">${modern ? '<span class="sidebar-action__label">Activity Log</span><span class="sidebar-action__suffix"></span>' : "Activity Log"}</a>`;
    return document.querySelector("a")!;
  }

  it.each([true, false])(
    "adds, updates and removes native badges (modern: %s)",
    async (modern) => {
      const link = mount(modern);
      const load = vi
        .fn()
        .mockResolvedValueOnce(result(6))
        .mockResolvedValueOnce(result(2))
        .mockResolvedValueOnce(result(0));
      cleanup = initializeActivityBadge(link, load);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(link.querySelector(".badge")?.textContent).toBe("6");
      expect(link.querySelector("[data-notification]")?.textContent).toBe(
        "6 notifications",
      );
      expect(link.querySelector(".badge")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
      expect(
        !!link.querySelector(".sidebar-action__suffix .sidebar-action__badge"),
      ).toBe(modern);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(link.querySelector(".badge")?.textContent).toBe("2");
      await vi.advanceTimersByTimeAsync(30_000);
      expect(
        link.querySelector(
          ".badge, [data-notification], .sidebar-action__badge",
        ),
      ).toBeNull();
      expect(link.textContent).toBe("Activity Log");
    },
  );

  it("updates an existing server-rendered badge without duplicating it", async () => {
    const link = mount();
    link.querySelector(".sidebar-action__suffix")!.innerHTML =
      '<span class="sidebar-action__badge"><span class="badge">6</span><span data-notification>6 notifications</span></span>';
    cleanup = initializeActivityBadge(
      link,
      vi.fn().mockResolvedValue(result(1)),
    );
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(0);
    expect(link.querySelectorAll(".badge")).toHaveLength(1);
    expect(link.querySelector(".badge")?.textContent).toBe("1");
  });

  it("skips hidden tabs and refreshes on visibility, focus and reconnect", async () => {
    const link = mount();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    const load = vi.fn().mockResolvedValue(result(3));
    cleanup = initializeActivityBadge(link, load);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(load).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    for (const [target, name] of [
      [document, "visibilitychange"],
      [window, "focus"],
      [window, "online"],
    ] as const) {
      target.dispatchEvent(new Event(name));
      await vi.advanceTimersByTimeAsync(0);
    }
    expect(load).toHaveBeenCalledTimes(3);
    expect(link.querySelector(".badge")?.textContent).toBe("3");
  });

  it("keeps the last count on failure and retries on the next interval", async () => {
    const link = mount();
    const load = vi
      .fn()
      .mockResolvedValueOnce(result(6))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(result(2));
    cleanup = initializeActivityBadge(link, load);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(link.querySelector(".badge")?.textContent).toBe("6");
    await vi.advanceTimersByTimeAsync(30_000);
    expect(link.querySelector(".badge")?.textContent).toBe("2");
  });

  it("does not overlap requests or apply a delayed response after cleanup", async () => {
    const link = mount();
    let resolve!: (value: ReturnType<typeof result>) => void;
    const load = vi.fn(
      () =>
        new Promise<ReturnType<typeof result>>((done) => {
          resolve = done;
        }),
    );
    cleanup = initializeActivityBadge(link, load);
    await vi.advanceTimersByTimeAsync(90_000);
    window.dispatchEvent(new Event("focus"));
    expect(load).toHaveBeenCalledTimes(1);
    cleanup();
    resolve(result(6));
    await vi.advanceTimersByTimeAsync(30_000);
    window.dispatchEvent(new Event("focus"));
    expect(load).toHaveBeenCalledTimes(1);
    expect(link.querySelector(".badge")).toBeNull();
  });
});
