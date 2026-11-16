import type { SelectProperty } from "@ff-client/types/properties";
import { act, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import Select from "./select";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: PropsWithChildren) => children,
}));
vi.mock("@components/elements/pop-up-portal", () => ({
  PopUpPortal: ({ children }: PropsWithChildren) => children,
}));
vi.mock(
  "@components/form-controls/preview/previewable-component.animations",
  () => ({
    useEditorAnimations: () => ({ editorAnimation: {} }),
  }),
);
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

it("prevents opening a locked Form Type dropdown and restores selection when unlocked", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const scroll = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "scrollIntoView",
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const updateValue = vi.fn();
  const property = {
    handle: "type",
    label: "Form Type",
    type: "select",
    disabled: true,
    options: [
      { value: "regular", label: "Regular" },
      { value: "survey", label: "Surveys & Polls" },
    ],
  } as SelectProperty;
  const render = () =>
    act(() =>
      root.render(
        <Select
          property={property}
          value="regular"
          updateValue={updateValue}
        />,
      ),
    );

  try {
    render();
    expect(host.firstElementChild?.getAttribute("aria-disabled")).toBe("true");
    act(() => (host.firstElementChild as HTMLElement).click());
    expect(host.querySelector('input[placeholder="Search..."]')).toBeNull();
    expect(updateValue).not.toHaveBeenCalled();

    property.disabled = false;
    render();
    act(() => (host.firstElementChild as HTMLElement).click());
    expect(host.querySelector('input[placeholder="Search..."]')).not.toBeNull();
    const survey = Array.from(host.querySelectorAll("li")).find((item) =>
      item.textContent?.includes("Surveys & Polls"),
    )!;
    act(() => survey.click());
    expect(updateValue).toHaveBeenCalledWith("survey");
  } finally {
    act(() => root.unmount());
    host.remove();
    if (scroll)
      Object.defineProperty(Element.prototype, "scrollIntoView", scroll);
    else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    vi.unstubAllGlobals();
  }
});
