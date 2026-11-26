import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DarkModeTip } from "./dark-mode-tip";

const { tip, post } = vi.hoisted(() => ({
  tip: {
    visible: true,
    userKey: "component",
    dismissUrl: "/actions/freeform/settings/dismiss-dark-mode-tip",
  },
  post: vi.fn(),
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { freeform: { darkModeTip: tip } } },
}));
vi.mock("axios", () => ({ default: { post } }));
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  tip.visible = true;
  tip.userKey = `component-${Math.random()}`;
  post.mockReset();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  localStorage.clear();
});

it("hides the tip when the server marks it as hidden", () => {
  tip.visible = false;
  act(() => root.render(<DarkModeTip />));
  expect(host.querySelector("aside")).toBeNull();
});

it("dismisses sibling placements and stays dismissed after route remount", async () => {
  post.mockResolvedValue({ data: { success: true } });
  act(() =>
    root.render(
      <>
        <DarkModeTip />
        <DarkModeTip />
      </>,
    ),
  );
  expect(host.querySelectorAll("aside")).toHaveLength(2);
  await act(async () =>
    host.querySelector<HTMLButtonElement>("button")!.click(),
  );
  expect(post).toHaveBeenCalledWith(tip.dismissUrl);
  expect(host.querySelector("aside")).toBeNull();
  act(() => root.render(<DarkModeTip key="new-route" />));
  expect(host.querySelector("aside")).toBeNull();
});

it("allows retry after a failed save without hiding other placements", async () => {
  post
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValueOnce({ data: { success: true } });
  act(() =>
    root.render(
      <>
        <DarkModeTip />
        <DarkModeTip />
      </>,
    ),
  );
  await act(async () =>
    host.querySelector<HTMLButtonElement>("button")!.click(),
  );
  expect(host.querySelectorAll("aside")).toHaveLength(2);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "Could not dismiss",
  );
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(false);
  await act(async () =>
    host.querySelector<HTMLButtonElement>("button")!.click(),
  );
  expect(host.querySelector("aside")).toBeNull();
});
