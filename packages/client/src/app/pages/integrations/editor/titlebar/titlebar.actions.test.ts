import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showAuthWindow } from "./titlebar.actions";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("Craft", { getCpUrl: (path: string) => `/${path}` });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function setup() {
  const popup = { close: vi.fn(), closed: false } as unknown as Window;
  vi.spyOn(window, "open").mockReturnValue(popup);
  const success = vi.fn();
  const failure = vi.fn();
  const cleanup = showAuthWindow(2, success, failure);
  const message = (
    data: unknown,
    origin = location.origin,
    source: Window = popup,
  ) => {
    window.dispatchEvent(new MessageEvent("message", { data, origin, source }));
  };
  return { popup, success, failure, cleanup, message };
}

describe("integration authorization popup", () => {
  it("accepts success only from the authorization popup and cleans up", () => {
    const { popup, success, failure, message } = setup();
    message({ type: "oauth2" }, "https://other.test");
    message({ type: "oauth2" }, location.origin, window);
    message(null);
    expect(success).not.toHaveBeenCalled();
    message({ type: "oauth2" });
    expect(popup.close).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    message({ type: "oauth2" });
    expect(success).toHaveBeenCalledOnce();
  });
  it("reports callback failures without closing the explanatory error page", () => {
    const { popup, success, failure, message } = setup();
    message({ type: "oauth2", status: "error" });
    expect(failure).toHaveBeenCalledOnce();
    expect(success).not.toHaveBeenCalled();
    expect(popup.close).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("handles blocked popups", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const failure = vi.fn();
    showAuthWindow(2, vi.fn(), failure)();
    expect(failure).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("reports a closed popup and cleans up on navigation", () => {
    const { popup, failure } = setup();
    Object.defineProperty(popup, "closed", { value: true });
    vi.advanceTimersByTime(500);
    expect(failure).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    const next = setup();
    next.cleanup();
    next.message({ type: "oauth2" });
    expect(next.success).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
