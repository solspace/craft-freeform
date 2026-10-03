import {
  EscapeStackProvider,
  useEscapeStack,
} from "@ff-client/contexts/escape/escape.context";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "./confirmation";
import { ContinueButton } from "./confirmation.styles";
import type { ConfirmationOptions } from "./confirmation.types";

let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.restoreAllMocks();
});

async function setup(
  onConfirm: () => void,
  underlyingEscape = vi.fn(),
  options: Partial<ConfirmationOptions> = {},
) {
  vi.spyOn(customElements, "whenDefined").mockResolvedValue(HTMLElement);
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
  await act(async () => {
    root.render(
      <EscapeStackProvider>
        <Fixture />
      </EscapeStackProvider>,
    );
  });
  const dialog = document.querySelector("craft-dialog")!;
  const buttons = dialog.querySelectorAll("button");
  return { dialog, cancel: buttons[0], confirm: buttons[1] };
}

describe("confirmation", () => {
  it("supports a blue Continue action without changing deletion defaults", async () => {
    const onConfirm = vi.fn();
    const { confirm, cancel } = await setup(onConfirm, vi.fn(), {
      confirmLabel: "Continue",
      destructive: false,
    });
    expect(confirm.textContent).toBe("Continue");
    expect(confirm.classList.contains(ContinueButton.styledComponentId)).toBe(
      true,
    );
    expect(document.activeElement).toBe(cancel);
    act(() => confirm.click());
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("focuses Cancel and renders names as plain text without deleting", async () => {
    const onConfirm = vi.fn();
    const { dialog, cancel } = await setup(onConfirm);
    expect(document.activeElement).toBe(cancel);
    expect(dialog.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(dialog.querySelector("img")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => cancel.click());
    expect(document.querySelector("craft-dialog")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("keeps Tab and Shift+Tab within the confirmation actions", async () => {
    const { cancel, confirm } = await setup(vi.fn());
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

  it("executes the deletion exactly once, only after confirmation", async () => {
    const onConfirm = vi.fn();
    const { confirm } = await setup(onConfirm);
    act(() => {
      confirm.click();
      confirm.click();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(document.querySelector("craft-dialog")).toBeNull();
  });

  it("cancels native dismissal without closing the editor beneath it", async () => {
    const onConfirm = vi.fn();
    const underlyingEscape = vi.fn();
    const { dialog, cancel } = await setup(onConfirm, underlyingEscape);
    act(() =>
      cancel.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(underlyingEscape).not.toHaveBeenCalled();
    act(() => dialog.dispatchEvent(new CustomEvent("craft-before-hide")));
    expect(document.querySelector("craft-dialog")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(underlyingEscape).toHaveBeenCalledOnce();
  });
});
