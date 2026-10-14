import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { PreviewSlideout } from "./preview-slideout";
import { usePreviewRollback } from "./use-preview-rollback";

const session = vi.hoisted(() => ({
  translating: false,
  translation: undefined as unknown,
  closing: false,
  complete: undefined as (() => void) | undefined,
}));
const updateTranslation = vi.hoisted(() =>
  vi.fn((_handle: string, value: unknown) => {
    session.translation = value;
    return true;
  }),
);
const removeTranslation = vi.hoisted(() =>
  vi.fn(() => {
    session.translation = undefined;
  }),
);
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    willTranslate: () => session.translating,
    hasTranslation: () => session.translation !== undefined,
    getTranslation: (_handle: string, value: unknown) =>
      session.translation ?? value,
    updateTranslation,
    removeTranslation,
  }),
}));
vi.mock("@components/slideouts/slideout", () => ({
  NativeSlideout: ({
    children,
    onClose,
  }: {
    children: (close: () => void) => React.ReactNode;
    onClose: () => void;
  }) => {
    session.complete = onClose;
    return (
      <div role="dialog">
        {children(() => {
          session.closing = true;
        })}
      </div>
    );
  },
}));
const initial = [{ id: "one", metadata: { label: "Original" } }];
const finished = vi.fn();
const updates = vi.fn();
function Fixture() {
  const [value, setValue] = useState(() => structuredClone(initial));
  const rollback = usePreviewRollback(
    value,
    (updated) => {
      updates(updated);
      setValue(updated);
    },
    "content",
  );
  return (
    <>
      <PreviewSlideout
        title="Cards"
        preview="Preview"
        fillEditor={false}
        {...rollback}
        onAfterEdit={finished}
      >
        <button
          type="button"
          onClick={() => {
            if (session.translating)
              updateTranslation("content", [{ label: "Translated edit" }]);
            else {
              const next = [...value];
              next[0].metadata.label = "Changed";
              setValue(next);
            }
          }}
        >
          Edit
        </button>
      </PreviewSlideout>
      <output>{JSON.stringify(value)}</output>
    </>
  );
}
let root: Root;
let container: HTMLDivElement;
function setup() {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<Fixture />));
  act(() => container.querySelector<HTMLElement>('[role="button"]')!.click());
}
function click(label: string) {
  act(() =>
    Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent === label)!
      .click(),
  );
}
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  session.translating = false;
  session.translation = undefined;
  session.closing = false;
  session.complete = undefined;
});
it("restores a deep snapshot after the native close animation, including late editor updates", () => {
  setup();
  click("Edit");
  click("Cancel");
  expect(session.closing).toBe(true);
  expect(
    JSON.parse(container.querySelector("output")!.textContent!),
  ).not.toEqual(initial);
  click("Edit");
  act(() => session.complete?.());
  expect(JSON.parse(container.querySelector("output")!.textContent!)).toEqual(
    initial,
  );
  expect(finished).not.toHaveBeenCalled();
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});
it("does not publish a value change when cancelling without edits", () => {
  setup();
  click("Cancel");
  act(() => session.complete?.());
  expect(updates).not.toHaveBeenCalled();
  expect(finished).not.toHaveBeenCalled();
});
it.each([false, true])(
  "leaves an unchanged translation alone when it already exists: %s",
  (existed) => {
    session.translating = true;
    session.translation = existed
      ? [{ label: "Original translation" }]
      : undefined;
    setup();
    click("Cancel");
    act(() => session.complete?.());
    expect(updateTranslation).not.toHaveBeenCalled();
    expect(removeTranslation).not.toHaveBeenCalled();
  },
);
it("keeps live edits and runs cleanup when Finish & Close is used", () => {
  setup();
  click("Edit");
  click("Finish & Close");
  act(() => session.complete?.());
  expect(
    JSON.parse(container.querySelector("output")!.textContent!)[0].metadata
      .label,
  ).toBe("Changed");
  expect(finished).toHaveBeenCalledOnce();
});
it.each([false, true])(
  "restores translation presence and content when an original translation exists: %s",
  (existed) => {
    session.translating = true;
    const original = existed ? [{ label: "Original translation" }] : undefined;
    session.translation = original;
    setup();
    click("Edit");
    click("Cancel");
    act(() => session.complete?.());
    expect(session.translation).toEqual(original);
    expect(JSON.parse(container.querySelector("output")!.textContent!)).toEqual(
      initial,
    );
    expect(finished).not.toHaveBeenCalled();
    if (!existed) expect(removeTranslation).toHaveBeenCalledOnce();
  },
);
