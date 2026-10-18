import {
  EscapeStackProvider,
  useEscapeStack,
} from "@ff-client/contexts/escape/escape.context";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "./confirmation";
import type { ConfirmationOptions } from "./confirmation.types";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let root: Root;
let container: HTMLDivElement;
const methods = new Map(
  ["showModal", "close"].map((method) => [
    method,
    Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, method),
  ]),
);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  for (const method of methods.keys())
    Object.defineProperty(HTMLDialogElement.prototype, method, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = method === "showModal";
      },
    });
});
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  for (const [method, descriptor] of methods) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, method);
  }
  vi.unstubAllGlobals();
});
async function setup(
  onConfirm = vi.fn(),
  underlyingEscape = vi.fn(),
  options: Partial<ConfirmationOptions> = {},
) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  function Fixture() {
    useEscapeStack(underlyingEscape);
    const [open, setOpen] = useState(true);
    return open ? (
      <ConfirmationDialog
        title="Delete field?"
        message={'Delete "<img src=x onerror=alert(1)>"?'}
        {...options}
        onConfirm={onConfirm}
        onClose={() => setOpen(false)}
      />
    ) : null;
  }
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <Fixture />
      </EscapeStackProvider>,
    ),
  );
  const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
  return {
    dialog,
    cancel: dialog.querySelector<HTMLButtonElement>("button.cancel")!,
    confirm: dialog.querySelector<HTMLButtonElement>("button.confirm")!,
    onConfirm,
  };
}
describe("shared builder confirmations", () => {
  it("focuses Cancel, treats names as plain text, and waits for explicit confirmation", async () => {
    const { dialog, cancel, onConfirm } = await setup();
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(cancel);
    expect(dialog.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(dialog.querySelector("img")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => cancel.click());
    expect(document.querySelector("dialog")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });
  it("executes a destructive action once even if the confirmation is clicked twice", async () => {
    const { confirm, onConfirm } = await setup();
    expect(confirm.classList.contains("submit")).toBe(true);
    act(() => {
      confirm.click();
      confirm.click();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(document.querySelector("dialog")).toBeNull();
  });
  it("supports non-destructive Continue actions", async () => {
    const { confirm, onConfirm } = await setup(vi.fn(), vi.fn(), {
      confirmLabel: "Continue",
      destructive: false,
    });
    expect(confirm.textContent).toBe("Continue");
    expect(confirm.classList.contains("submit")).toBe(false);
    act(() => confirm.click());
    expect(onConfirm).toHaveBeenCalledOnce();
  });
  it("keeps Tab and Shift+Tab in the confirmation", async () => {
    const { confirm, cancel } = await setup();
    act(() =>
      cancel.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(document.activeElement).toBe(confirm);
    act(() =>
      confirm.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(document.activeElement).toBe(cancel);
  });
  it.each(["Escape", "cancel"])(
    "dismisses with %s without closing the editor underneath",
    async (method) => {
      const underlyingEscape = vi.fn();
      const { dialog, cancel, onConfirm } = await setup(
        vi.fn(),
        underlyingEscape,
      );
      act(() =>
        method === "Escape"
          ? cancel.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true,
              }),
            )
          : dialog.dispatchEvent(new Event("cancel", { cancelable: true })),
      );
      expect(document.querySelector("dialog")).toBeNull();
      expect(onConfirm).not.toHaveBeenCalled();
      expect(underlyingEscape).not.toHaveBeenCalled();
      act(() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        ),
      );
      expect(underlyingEscape).toHaveBeenCalledOnce();
    },
  );
});
