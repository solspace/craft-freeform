import type { Row } from "@editor/builder/types/layout";
import type { Field as FieldType } from "@editor/store/slices/layout/fields";
import { Fields } from "@ff-client/types/field.classes";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Field } from "./field";

const fixture = vi.hoisted(() => ({
  dispatch: vi.fn(),
  confirmDelete: vi.fn(),
  remove: vi.fn((field: { uid: string }) => ({
    type: "remove",
    payload: field.uid,
  })),
}));
vi.mock("@editor/store", () => ({ useAppDispatch: () => fixture.dispatch }));
vi.mock("@components/modals/modal.context", () => ({
  useModal: () => ({ confirmDelete: fixture.confirmDelete }),
}));
vi.mock("@editor/store/thunks/fields", () => ({
  fieldThunks: { remove: fixture.remove },
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { limitations: { can: () => false } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string> = {}) =>
    Object.entries(params).reduce(
      (value, [key, replacement]) => value.replace(`{${key}}`, replacement),
      text,
    ),
}));
vi.mock("react-dnd", () => ({ DragPreviewImage: (): null => null }));
vi.mock("./field.drag", () => ({
  useFieldDrag: () => ({
    isDragging: false,
    drag: () => {},
    preview: () => {},
  }),
}));
vi.mock("./field.drag.preview", () => ({ createPreview: () => "" }));
vi.mock("./field.animations", () => ({ useFieldDragAnimation: () => ({}) }));
vi.mock("./cell/cell", () => ({ FieldCell: () => <div>Field preview</div> }));
vi.mock("./cell/cell-badges", () => ({
  FieldAssociationsBadges: (): null => null,
}));
vi.mock("@components/elements/remove-button/remove", () => ({
  RemoveButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Delete field
    </button>
  ),
}));
let root: Root;
let host: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
it.each([Fields.Text, Fields.Group])(
  "waits for confirmation before removing %s and warns about group children",
  (typeClass) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    const field = {
      uid: "field",
      typeClass,
      properties: { label: "Contact details" },
    } as FieldType;
    act(() =>
      root.render(
        <Field
          field={field}
          row={{ uid: "row" } as Row}
          index={0}
          isOver={false}
          isCurrentRow={false}
          isDraggingField={false}
        />,
      ),
    );
    act(() => host.querySelector("button")!.click());
    expect(fixture.dispatch).not.toHaveBeenCalled();
    expect(fixture.remove).not.toHaveBeenCalled();
    const options = fixture.confirmDelete.mock.calls[0][0];
    expect(options.message).toContain('"Contact details"');
    expect(options.message.includes("All fields inside this group")).toBe(
      typeClass === Fields.Group,
    );
    act(() => options.onConfirm());
    expect(fixture.remove).toHaveBeenCalledWith(field);
    expect(fixture.dispatch).toHaveBeenCalledWith({
      type: "remove",
      payload: "field",
    });
  },
);
