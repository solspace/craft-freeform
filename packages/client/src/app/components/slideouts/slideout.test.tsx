import {
  EscapeStackProvider,
  useEscapeStack,
} from "@ff-client/contexts/escape/escape.context";
import { act, createContext, useContext, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NativeSlideout } from "./slideout";

class CraftSlideout {
  static instances: CraftSlideout[] = [];
  container = document.createElement("div");
  onClose?: () => void;
  open = vi.fn();
  close = vi.fn();
  destroy = vi.fn(() => this.container.remove());

  constructor(host: HTMLElement, settings: { autoOpen: boolean }) {
    expect(settings.autoOpen).toBe(false);
    this.container.append(host);
    document.body.append(this.container);
    CraftSlideout.instances.push(this);
  }

  on(event: string, callback: () => void) {
    expect(event).toBe("close");
    this.onClose = callback;
  }
}

let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  CraftSlideout.instances = [];
  vi.unstubAllGlobals();
});

function setup(element: React.ReactNode) {
  vi.stubGlobal("Craft", { Slideout: CraftSlideout });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(element));
  return CraftSlideout.instances.at(-1)!;
}

describe("native Craft manager slideout", () => {
  it("keeps a live editor mounted as its value changes", () => {
    const mounted = vi.fn();
    function Editor({ value }: { value: string }) {
      const [identity] = useState(() => {
        mounted();
        return "editor";
      });
      return <input aria-label={identity} value={value} readOnly />;
    }
    const panel = setup(
      <NativeSlideout onClose={() => {}}>
        {() => <Editor value="Initial content" />}
      </NativeSlideout>,
    );
    act(() =>
      root.render(
        <NativeSlideout onClose={() => {}}>
          {() => <Editor value="Updated content" />}
        </NativeSlideout>,
      ),
    );
    expect(CraftSlideout.instances).toHaveLength(1);
    expect(mounted).toHaveBeenCalledOnce();
    expect(panel.container.querySelector("input")?.value).toBe(
      "Updated content",
    );
  });
  it("preserves React context and waits for Craft's close transition before unmounting", () => {
    const Context = createContext("missing");
    const onClose = vi.fn();
    const Content = ({ closeModal }: { closeModal: () => void }) => (
      <button type="button" onClick={closeModal}>
        {useContext(Context)}
      </button>
    );
    function Fixture() {
      const [open, setOpen] = useState(true);
      return (
        <Context.Provider value="Save">
          {open && (
            <NativeSlideout
              content={Content}
              onClose={() => {
                onClose();
                setOpen(false);
              }}
            />
          )}
        </Context.Provider>
      );
    }
    const panel = setup(<Fixture />);
    expect(panel.open).toHaveBeenCalledOnce();
    const button = panel.container.querySelector("button")!;
    expect(button.textContent).toBe("Save");
    act(() => button.click());
    expect(panel.close).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    expect(button.isConnected).toBe(true);
    act(() => panel.onClose?.());
    expect(onClose).toHaveBeenCalledOnce();
    expect(panel.destroy).toHaveBeenCalledOnce();
    expect(button.isConnected).toBe(false);
  });

  it("unregisters an open panel when the builder unmounts without calling its close handler", () => {
    const onClose = vi.fn();
    const panel = setup(
      <NativeSlideout content={() => <input />} onClose={onClose} />,
    );
    act(() => root.unmount());
    expect(panel.close).toHaveBeenCalledOnce();
    expect(panel.destroy).toHaveBeenCalledOnce();
    panel.onClose?.();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps Escape from closing the field editor underneath a native panel", () => {
    const closeFieldEditor = vi.fn();
    function Builder() {
      useEscapeStack(closeFieldEditor);
      const [open, setOpen] = useState(true);
      return open ? (
        <NativeSlideout
          content={() => <input />}
          onClose={() => setOpen(false)}
        />
      ) : null;
    }
    const panel = setup(
      <EscapeStackProvider>
        <Builder />
      </EscapeStackProvider>,
    );
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(closeFieldEditor).not.toHaveBeenCalled();
    act(() => panel.onClose?.());
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(closeFieldEditor).toHaveBeenCalledOnce();
  });
});
