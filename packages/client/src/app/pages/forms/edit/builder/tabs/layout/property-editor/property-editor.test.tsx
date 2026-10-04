import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import { PropertyEditor } from "./property-editor";

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock("@editor/store", () => ({ useAppDispatch: () => dispatch }));
vi.mock("react-redux", () => ({
  useSelector: () => ({ active: true, type: "field", uid: "html" }),
}));
vi.mock("./editors/fields/field-properties", () => ({
  FieldProperties: () => <div>HTML field settings</div>,
}));
vi.mock("./editors/pages/page-properties", () => ({
  PageProperties: () => null,
}));

it("keeps field settings open for native slideout, shade, and confirmation clicks, but still closes for ordinary outside clicks", () => {
  const container = document.createElement("div");
  const panel = document.createElement("div");
  panel.className = "slideout-container";
  const toolbar = document.createElement("button");
  toolbar.textContent = "Editor toolbar";
  panel.append(toolbar);
  const shade = document.createElement("div");
  shade.className = "cp-slideout-shade";
  const confirmation = document.createElement("craft-dialog");
  confirmation.className = "ff-delete-confirmation";
  const cancel = document.createElement("button");
  confirmation.append(cancel);
  const outside = document.createElement("button");
  document.body.append(container, panel, shade, confirmation, outside);
  const root = createRoot(container);
  try {
    act(() => root.render(<PropertyEditor />));
    act(() => toolbar.click());
    act(() => shade.click());
    act(() => cancel.click());
    expect(dispatch).not.toHaveBeenCalled();
    act(() => outside.click());
    expect(dispatch).toHaveBeenCalledOnce();
  } finally {
    act(() => root.unmount());
    for (const node of [container, panel, shade, confirmation, outside])
      node.remove();
    dispatch.mockClear();
  }
});
