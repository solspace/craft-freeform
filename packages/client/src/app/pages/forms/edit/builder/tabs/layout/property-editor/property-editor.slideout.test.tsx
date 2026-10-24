import { PopUpPortal } from "@components/elements/pop-up-portal";
import { NativeSlideout } from "@components/slideouts/slideout";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { PropertyEditor } from "./property-editor";

const dispatch = vi.hoisted(() => vi.fn());
vi.mock("@editor/store", () => ({ useAppDispatch: () => dispatch }));
vi.mock("react-redux", () => ({
  useSelector: () => ({ active: true, type: "field", uid: "test" }),
}));
vi.mock("@react-spring/web", () => ({
  useTransition:
    (items: unknown[]) =>
    (render: (style: object, item: unknown) => ReactNode) =>
      render({}, items[0]),
}));
vi.mock("./property-editor.styles", () => ({
  PropertyEditorWrapper: ({
    children,
    ref,
  }: {
    children: ReactNode;
    ref: React.Ref<HTMLDivElement>;
  }) => <div ref={ref}>{children}</div>,
  AnimatedBlock: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("./editors/pages/page-properties", () => ({
  PageProperties: () => null,
}));
vi.mock("./editors/fields/field-properties", () => ({
  FieldProperties: () => {
    const [open, setOpen] = useState(true);
    return (
      open && (
        <NativeSlideout onClose={() => setOpen(false)}>
          {(close) => (
            <>
              <header>Bulk Editor</header>
              <label htmlFor="mode">Import Mode</label>
              <select id="mode">
                <option>Append</option>
                <option>Replace</option>
              </select>
              <textarea />
              <button type="button" onClick={close}>
                Cancel
              </button>
              <PopUpPortal>
                <button type="button">Dropdown option</button>
              </PopUpPortal>
            </>
          )}
        </NativeSlideout>
      )
    );
  },
}));

class CraftSlideout {
  static instance: CraftSlideout;
  container = document.createElement("div");
  shade = document.createElement("div");
  $container = { 0: this.container };
  onClose?: () => void;
  close = vi.fn(() => this.onClose?.());
  open = vi.fn();
  destroy = vi.fn(() => {
    this.container.remove();
    this.shade.remove();
  });
  constructor(
    host: HTMLElement,
    settings: { containerAttributes: { class: string } },
  ) {
    this.container.className = settings.containerAttributes.class;
    this.shade.className = "slideout-shade";
    this.shade.onclick = this.close;
    this.container.append(host);
    document.body.append(this.shade, this.container);
    CraftSlideout.instance = this;
  }
  on(event: string, callback: () => void) {
    if (event === "close") this.onClose = callback;
  }
}
let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
  dispatch.mockClear();
});

it.each(["Cancel", "shade"])(
  "keeps the property editor open during slideout interaction and %s dismissal",
  (dismissal) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("Craft", { Slideout: CraftSlideout });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(<PropertyEditor />));
    const panel = CraftSlideout.instance;
    act(() => panel.container.click());
    expect(dispatch).not.toHaveBeenCalled();
    for (const selector of [
      "header",
      "label",
      "select",
      "textarea",
      ".freeform-slideout-popups button",
    ]) {
      act(() => {
        (document.activeElement as HTMLElement)?.blur();
        panel.container.querySelector<HTMLElement>(selector)!.click();
      });
      expect(dispatch).not.toHaveBeenCalled();
      expect(panel.destroy).not.toHaveBeenCalled();
    }
    act(() =>
      dismissal === "shade"
        ? panel.shade.click()
        : panel.container.querySelector<HTMLButtonElement>("button")!.click(),
    );
    expect(panel.close).toHaveBeenCalled();
    expect(panel.destroy).toHaveBeenCalledOnce();
    expect(dispatch).not.toHaveBeenCalled();
    act(() => document.body.click());
    expect(dispatch).toHaveBeenCalledOnce();
  },
);

it("keeps the property editor open when choosing a Craft icon outside its DOM", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Craft", { Slideout: CraftSlideout });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<PropertyEditor />));
  const modal = document.createElement("div");
  modal.className = "icon-picker-modal";
  const choice = document.createElement("button");
  choice.textContent = "Rocket";
  modal.append(choice);
  document.body.append(modal);
  act(() => choice.click());
  expect(dispatch).not.toHaveBeenCalled();
  modal.remove();
  act(() => document.body.click());
  expect(dispatch).toHaveBeenCalledOnce();
});
