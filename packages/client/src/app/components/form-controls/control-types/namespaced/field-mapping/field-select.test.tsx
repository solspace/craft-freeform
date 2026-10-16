import type { OptionCollection } from "@ff-client/types/properties";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FieldSelect } from "./field-select";

const { fieldOptions } = vi.hoisted(() => ({
  fieldOptions: [
    {
      label: "Page 1",
      children: [
        { label: "Group", children: [{ value: "phone", label: "Phone" }] },
      ],
    },
  ] as OptionCollection,
}));

vi.mock("@editor/store/slices/layout/fields/fields.hooks", () => ({
  useFieldOptionCollection: () => fieldOptions,
}));
vi.mock(
  "@components/form-controls/preview/previewable-component.animations",
  () => ({
    useEditorAnimations: () => ({ editorAnimation: {} }),
  }),
);
vi.mock("@ff-client/contexts/escape/escape.context", () => ({
  useEscapeStack: () => {},
}));
vi.mock("@components/elements/pop-up-portal", () => ({
  PopUpPortal: ({ children }: { children: React.ReactNode }) => children,
}));

let root: Root;
let container: HTMLDivElement;

const mount = (savedValue: string) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const onChange = vi.fn();
  const TestMapping = () => {
    const [value, setValue] = useState(savedValue);
    return (
      <FieldSelect
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  };
  act(() => root.render(<TestMapping />));
  return onChange;
};

const choose = (value: string) => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  act(() => container.querySelector<HTMLDivElement>(".missing")!.click());
  const option = container.querySelector<HTMLElement>(
    `[data-value="${value}"]`,
  );
  expect(option).not.toBeNull();
  act(() => option!.click());
};

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.restoreAllMocks();
});

describe("missing mapped fields", () => {
  it("warns about a stale reference without silently clearing it", () => {
    const onChange = mount("deleted-field-uid");
    const warning = container.querySelector(".missing");
    expect(warning?.textContent).toBe("Mapped field no longer exists");
    expect(warning?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(container.textContent).not.toContain("Do not map this field");
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(["", undefined, null])(
    "keeps intentional empty mappings unchanged (%s)",
    (value) => {
      const onChange = mount(value as string);
      expect(container.textContent).toBe("Do not map this field");
      expect(container.querySelector(".missing")).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it("recognizes fields inside nested groups", () => {
    mount("phone");
    expect(container.textContent).toBe("Phone");
    expect(container.querySelector(".missing")).toBeNull();
  });

  it("lets the user explicitly clear a stale reference", () => {
    const onChange = mount("deleted-field-uid");
    choose("");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
    expect(container.textContent).toBe("Do not map this field");
    expect(container.querySelector(".missing")).toBeNull();
  });

  it("lets the user replace a stale reference with an existing field", () => {
    const onChange = mount("deleted-field-uid");
    choose("phone");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("phone");
    expect(container.textContent).toBe("Phone");
    expect(container.querySelector(".missing")).toBeNull();
  });
});
