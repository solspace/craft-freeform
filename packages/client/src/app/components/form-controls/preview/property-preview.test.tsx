import { CodePreview } from "@components/form-controls/control-types/code-editor/code.preview";
import { WysiwygPreview } from "@components/form-controls/control-types/wysiwyg/wysiwyg.preview";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { PreviewSlideout } from "./preview-slideout";
import { PreviewableComponent } from "./previewable-component";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@components/elements/pop-up-portal", () => ({
  PopUpPortal: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock("./previewable-component.animations", () => ({
  useEditorAnimations: () => ({ editorAnimation: {} }),
}));
vi.mock("@components/slideouts/slideout", () => ({
  NativeSlideout: ({
    children,
    onClose,
  }: {
    children: (close: () => void) => React.ReactNode;
    onClose: () => void;
  }) => <div role="dialog">{children(onClose)}</div>,
}));
let root: Root;
let container: HTMLDivElement;
function render(element: React.ReactNode) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(element));
}
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});

it.each(["", " \n ", "<p><br></p>", "<p>&nbsp;</p>"])(
  "recognizes visually empty Rich Text: %s",
  (value) => {
    render(<WysiwygPreview value={value} />);
    expect(container.textContent).toBe("Not configured yet");
  },
);
it("retains meaningful Rich Text and media while sanitizing it", () => {
  render(
    <WysiwygPreview
      value={
        '<ul><li>First</li></ul><img src="image.png" onerror="bad()"><script>bad()</script>'
      }
    />,
  );
  expect(container.querySelector("li")?.textContent).toBe("First");
  expect(container.querySelector("img")?.hasAttribute("onerror")).toBe(false);
  expect(container.querySelector("script")).toBeNull();
  act(() =>
    root.render(<WysiwygPreview value={'<p><img src="image.png"></p>'} />),
  );
  expect(container.querySelector("img")).not.toBeNull();
  expect(container.textContent).not.toContain("Not configured yet");
});
it.each(["slideout", "popup"])(
  "opens the %s editor from the shared cue and keyboard trigger",
  (kind) => {
    const onEdit = vi.fn();
    const preview = <CodePreview value=" " />;
    render(
      kind === "slideout" ? (
        <PreviewSlideout
          title="HTML"
          preview={preview}
          onEdit={onEdit}
          fillEditor={false}
        >
          <div data-editor>Editor</div>
        </PreviewSlideout>
      ) : (
        <PreviewableComponent preview={preview} onEdit={onEdit}>
          {(editing) => editing && <div data-editor>Editor</div>}
        </PreviewableComponent>
      ),
    );
    expect(container.textContent).toContain("Not configured yet");
    expect(container.textContent?.match(/Click to edit data/g)).toHaveLength(1);
    const trigger = container.querySelector<HTMLElement>('[role="button"]')!;
    expect(trigger.tabIndex).toBe(0);
    act(() =>
      trigger.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(onEdit).toHaveBeenCalledOnce();
    expect(container.querySelector("[data-editor]")).not.toBeNull();
    if (kind === "slideout") {
      act(() => container.querySelector<HTMLButtonElement>("button")!.click());
      expect(container.querySelector("[data-editor]")).toBeNull();
      act(() =>
        trigger.lastElementChild!.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        ),
      );
      expect(onEdit).toHaveBeenCalledTimes(2);
    }
  },
);
