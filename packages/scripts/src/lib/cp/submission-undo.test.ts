import { afterEach, describe, expect, it, vi } from "vitest";
import { bindSubmissionUndo } from "./submission-undo";

const entry = (token = "latest", operation = "status") => ({
  token,
  operation,
  title: `Submission ${token}`,
  expiresAt: Date.now() / 1000 + 1800,
});
const settle = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const cleanups: Array<() => void> = [];
const fixture = (history = [entry()]) => {
  const button = document.createElement("button");
  button.textContent = "Undo";
  const slot = document.createElement("div");
  slot.className = "ff-submission-undo-slot";
  slot.append(button);
  document.body.append(slot);
  const options = {
    initialHistory: history,
    requestUndo: vi
      .fn()
      .mockResolvedValue({ operation: "status", undoHistory: [] }),
    loadHistory: vi.fn().mockResolvedValue([]),
    refresh: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
    translate: (message: string) => message,
    focusFallback: vi.fn(),
  };
  const undo = bindSubmissionUndo(button, options);
  cleanups.push(undo.destroy);
  return { button, options, undo, slot };
};

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe("shared submissions Undo", () => {
  it("shows the latest action and disables an empty history", () => {
    const { button, undo, slot } = fixture([]);
    expect(button.disabled).toBe(true);
    expect(slot.getAttribute("aria-hidden")).toBe("true");
    expect(slot.classList.contains("has-undo")).toBe(false);
    expect(button.title).toBe("Nothing to undo");
    undo.setHistory([entry("old"), entry("new", "delete")]);
    expect(button.disabled).toBe(false);
    expect(button.title).toBe("Undo deletion: Submission new");
    expect(slot.getAttribute("aria-hidden")).toBe("false");
    expect(slot.classList.contains("has-undo")).toBe(true);
  });

  it("closes the toolbar space and restores focus after the last undo", async () => {
    const { button, options, slot } = fixture();
    const fallback = document.createElement("button");
    document.body.append(fallback);
    options.focusFallback.mockImplementation(() => fallback.focus());
    button.focus();
    button.click();
    await settle();
    expect(slot.classList.contains("has-undo")).toBe(false);
    expect(slot.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(fallback);
  });

  it("undoes the latest receipt and then offers the previous one", async () => {
    const old = entry("old");
    const { button, options } = fixture([old, entry()]);
    options.requestUndo.mockResolvedValue({
      operation: "status",
      undoHistory: [old],
    });
    button.click();
    await settle();
    expect(options.requestUndo).toHaveBeenCalledExactlyOnceWith("latest");
    expect(options.refresh).toHaveBeenCalledOnce();
    expect(button.title).toContain("Submission old");
    expect(options.loadHistory).not.toHaveBeenCalled();
  });

  it("locks duplicate clicks while Undo is pending", async () => {
    const request = deferred<{
      operation: string;
      undoHistory: ReturnType<typeof entry>[];
    }>();
    const { button, options } = fixture();
    options.requestUndo.mockReturnValue(request.promise);
    button.click();
    button.click();
    expect(button.disabled).toBe(true);
    expect(options.requestUndo).toHaveBeenCalledOnce();
    request.resolve({ operation: "status", undoHistory: [] });
    await settle();
    expect(button.disabled).toBe(true);
  });

  it("retains failed undo actions for retry", async () => {
    const { button, options } = fixture();
    options.requestUndo.mockRejectedValueOnce(new Error("offline"));
    button.click();
    await settle();
    expect(button.disabled).toBe(false);
    expect(options.refresh).not.toHaveBeenCalled();
    button.click();
    await settle();
    expect(options.requestUndo).toHaveBeenCalledTimes(2);
    expect(button.disabled).toBe(true);
  });

  it("adopts the server's current history after a conflict", async () => {
    const { button, options } = fixture();
    options.requestUndo.mockRejectedValue({
      response: {
        data: {
          message: "Submission changed",
          undoHistory: [entry("earlier")],
        },
      },
    });
    button.click();
    await settle();
    expect(button.title).toContain("earlier");
    expect(options.notify).toHaveBeenCalledWith("error", "Submission changed");
  });

  it("does not repeat a successful undo if the list refresh fails", async () => {
    const { button, options } = fixture();
    options.refresh.mockRejectedValue(new Error("offline"));
    button.click();
    await settle();
    button.click();
    expect(options.requestUndo).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
    expect(options.notify).toHaveBeenCalledWith(
      "error",
      expect.stringContaining("list could not be refreshed"),
    );
  });

  it("explains the limits of undoing an approval", async () => {
    const { button, options } = fixture([entry("approval", "approve")]);
    expect(button.title).toContain("Sent notifications");
    options.requestUndo.mockResolvedValue({
      operation: "approve",
      undoHistory: [],
    });
    button.click();
    await settle();
    expect(options.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("completed integrations are not reversed"),
    );
  });

  it("expires receipts automatically", () => {
    vi.useFakeTimers();
    const { button } = fixture([
      { ...entry(), expiresAt: Date.now() / 1000 + 10 },
    ]);
    vi.advanceTimersByTime(10_001);
    expect(button.disabled).toBe(true);
    expect(button.title).toBe("Nothing to undo");
  });

  it("ignores an older focus refresh after a new quick action", async () => {
    const request = deferred<ReturnType<typeof entry>[]>();
    const { button, options, undo } = fixture();
    options.loadHistory.mockReturnValue(request.promise);
    window.dispatchEvent(new Event("focus"));
    undo.setHistory([entry("new")]);
    request.resolve([entry("stale")]);
    await settle();
    expect(button.title).toContain("Submission new");
  });

  it("resyncs if a quick action completes while Undo is pending", async () => {
    const request = deferred<{
      operation: string;
      undoHistory: ReturnType<typeof entry>[];
    }>();
    const { button, options, undo } = fixture();
    options.requestUndo.mockReturnValue(request.promise);
    options.loadHistory.mockResolvedValue([entry("new")]);
    button.click();
    undo.setHistory([entry("new")]);
    request.resolve({ operation: "status", undoHistory: [] });
    await settle();
    expect(options.loadHistory).toHaveBeenCalledOnce();
    expect(button.title).toContain("Submission new");
  });

  it("does not touch a disposed index after a delayed response", async () => {
    const request = deferred<{
      operation: string;
      undoHistory: ReturnType<typeof entry>[];
    }>();
    const { button, options, undo } = fixture();
    options.requestUndo.mockReturnValue(request.promise);
    button.click();
    undo.destroy();
    request.resolve({ operation: "status", undoHistory: [] });
    await settle();
    expect(options.refresh).not.toHaveBeenCalled();
    expect(options.notify).not.toHaveBeenCalled();
    expect(document.body.contains(button)).toBe(false);
  });
});
