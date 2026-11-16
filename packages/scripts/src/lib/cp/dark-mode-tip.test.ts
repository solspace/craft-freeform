import { afterEach, expect, it, vi } from "vitest";
import {
  dismissDarkModeTip,
  isDarkModeTipDismissed,
  subscribeDarkModeTip,
} from "./dark-mode-tip";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

it("hides every placement only after the account preference has saved, including later mounts", async () => {
  let finish!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const general = vi.fn();
  const welcome = vi.fn();
  const unsubscribe = [
    subscribeDarkModeTip("shared", general),
    subscribeDarkModeTip("shared", welcome),
  ];
  const pending = dismissDarkModeTip("shared", save);
  expect(general).not.toHaveBeenCalled();
  expect(welcome).not.toHaveBeenCalled();
  finish();
  await pending;
  expect(general).toHaveBeenCalledOnce();
  expect(welcome).toHaveBeenCalledOnce();
  const forms = vi.fn();
  unsubscribe.push(subscribeDarkModeTip("shared", forms));
  expect(forms).toHaveBeenCalledOnce();
  unsubscribe.forEach((stop) => {
    stop();
  });
});

it("leaves every placement available after a failed save", async () => {
  const hide = vi.fn();
  const stop = subscribeDarkModeTip("failed", hide);
  await expect(
    dismissDarkModeTip("failed", () => Promise.reject(new Error("Offline"))),
  ).rejects.toThrow("Offline");
  expect(hide).not.toHaveBeenCalled();
  expect(isDarkModeTipDismissed("failed")).toBe(false);
  expect(localStorage.length).toBe(0);
  stop();
});

it("syncs another tab without dismissing a different user's banner", () => {
  const hide = vi.fn();
  const other = vi.fn();
  const stop = subscribeDarkModeTip("tab-user", hide);
  const stopOther = subscribeDarkModeTip("other-user", other);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "freeform:dark-mode-tip:tab-user",
      newValue: `${Date.now()}`,
    }),
  );
  expect(hide).toHaveBeenCalledOnce();
  expect(other).not.toHaveBeenCalled();
  stop();
  stopOther();
});

it("catches dismissal while no placement is mounted, but ignores messages older than the page", () => {
  localStorage.setItem("freeform:dark-mode-tip:late", `${Date.now()}:message`);
  expect(isDarkModeTipDismissed("late")).toBe(true);
  localStorage.setItem(
    "freeform:dark-mode-tip:old",
    `${performance.timeOrigin - 1}:message`,
  );
  expect(isDarkModeTipDismissed("old")).toBe(false);
});

it("still hides the banner when browser storage is blocked", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Blocked");
  });
  const hide = vi.fn();
  const stop = subscribeDarkModeTip("blocked", hide);
  await dismissDarkModeTip("blocked", () => Promise.resolve());
  expect(hide).toHaveBeenCalledOnce();
  expect(isDarkModeTipDismissed("blocked")).toBe(true);
  stop();
});
