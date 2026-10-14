import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type CustomOptionsConfiguration, Source } from "../../options.types";
import { CustomEditor } from "./custom.editor";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@components/form-controls/control-types/bool/bool", () => ({
  default: () => <span />,
}));
vi.mock("@components/form-controls/draggable-row", () => ({
  DraggableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
}));
vi.mock("@components/slideouts/slideout", () => ({
  NativeSlideout: ({
    children,
    onClose,
  }: {
    children: (close: () => void) => ReactNode;
    onClose: () => void;
  }) => <div role="dialog">{children(onClose)}</div>,
}));
vi.mock(
  "@components/form-controls/control-types/textarea/textarea",
  async () => {
    const { forwardRef } = await import("react");
    return {
      default: forwardRef<
        HTMLTextAreaElement,
        { value: string; updateValue: (value: string) => void }
      >((props, ref) => (
        <textarea
          ref={ref}
          value={props.value}
          onChange={(event) => props.updateValue(event.target.value)}
        />
      )),
    };
  },
);

let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent === label,
  )!;

describe("bulk options slideout", () => {
  it.each(["append", "replace"])(
    "imports %s mode immediately and retains configured custom values",
    (mode) => {
      vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
      container = document.createElement("div");
      document.body.append(container);
      root = createRoot(container);
      const updateValue = vi.fn();
      const covered = vi.fn();
      function Fixture() {
        const [value, setValue] = useState<CustomOptionsConfiguration>({
          source: Source.Custom,
          useCustomValues: true,
          options: [{ label: "Old", value: "old", optgroup: false }],
        });
        return (
          <>
            <CustomEditor
              value={value}
              updateValue={(updated) => {
                updateValue(updated);
                setValue(updated);
              }}
              defaultValue=""
              updateDefaultValue={() => {}}
              onBulkOpenChange={covered}
              isMultiple={false}
            />
            <output>{JSON.stringify(value)}</output>
          </>
        );
      }
      act(() => root.render(<Fixture />));
      act(() => button("Add options in bulk").click());
      expect(covered).toHaveBeenLastCalledWith(true);
      const textarea = container.querySelector("textarea")!;
      act(() => {
        const select =
          container.querySelector<HTMLSelectElement>("#bulk-import-mode")!;
        select.value = mode;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        )!.set!.call(textarea, "First|one\nSecond|two");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      });
      updateValue.mockClear();
      act(() =>
        textarea.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          }),
        ),
      );
      const expected = {
        source: Source.Custom,
        useCustomValues: true,
        options: [
          ...(mode === "append"
            ? [{ label: "Old", value: "old", optgroup: false }]
            : []),
          { label: "First", value: "one", optgroup: false },
          { label: "Second", value: "two", optgroup: false },
        ],
      };
      expect(updateValue).toHaveBeenLastCalledWith(expected);
      expect(
        JSON.parse(container.querySelector("output")!.textContent!),
      ).toEqual(expected);
      expect(covered).toHaveBeenLastCalledWith(false);
      expect(container.querySelector('[role="dialog"]')).toBeNull();
    },
  );
});
