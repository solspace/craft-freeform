import type { Field } from "@editor/store/slices/layout/fields";
import type { Property } from "@ff-client/types/properties";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { LayoutDesignProperty } from "./layout-design-property";

const dispatch = vi.hoisted(() => vi.fn());
vi.mock("@editor/store", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: () => ({}),
}));
vi.mock("@editor/store/slices/layout/fields", () => ({
  fieldActions: {
    editDesign: (payload: unknown) => ({ type: "editDesign", payload }),
  },
}));
vi.mock("@components/form-controls/hooks/use-visibility", () => ({
  useVisibility: () => true,
}));
vi.mock("@components/form-controls/control.block", () => ({
  ControlBlock: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@components/form-controls/context/render.context", () => ({
  useRenderContext: () => ({}),
  RenderContextProvider: ({
    children,
    controlActions,
  }: {
    children: ReactNode;
    controlActions: Record<string, ReactNode>;
  }) => (
    <div>
      {children}
      {Object.values(controlActions)}
    </div>
  ),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string, args: Record<string, string> = {}) =>
    value.replace(/\{(\w+)\}/g, (_, key) => args[key] ?? key),
}));

it("lets the automatic value open editing at its current value and reset to inheritance", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const field = {
    uid: "layout",
    properties: { designStyle: "custom", designOverrides: [], minHeight: 0 },
  } as unknown as Field;
  const property = { handle: "minHeight", label: "Minimum Height" } as Property;
  const render = (current: Field) =>
    act(() =>
      root.render(
        <LayoutDesignProperty field={current} property={property}>
          <input aria-label="Minimum Height" defaultValue="0" />
        </LayoutDesignProperty>,
      ),
    );
  try {
    dispatch.mockClear();
    render(field);
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Customize Minimum Height"]',
    )!;
    expect(button.textContent).toContain("0px");
    expect(button.textContent).toContain("Automatic");
    expect(button.textContent).not.toContain("Override");
    act(() => button.click());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "editDesign",
      payload: { uid: "layout", handle: "minHeight", value: 0, reset: false },
    });
    render({
      ...field,
      properties: { ...field.properties, designOverrides: ["minHeight"] },
    });
    const reset = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Reset Minimum Height to form setting"]',
    )!;
    act(() => reset.click());
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "editDesign",
      payload: { uid: "layout", handle: "minHeight", value: 0, reset: true },
    });
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});
