import { Drag, type DragItem } from "@editor/builder/types/drag";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useRowFieldDrop } from "./row.field-drop";

type TestSpec = {
  drop: (
    item: DragItem,
    monitor: { getClientOffset: () => { x: number; y: number } },
  ) => void;
};

const fixture = vi.hoisted(() => ({
  spec: null as TestSpec,
  dispatch: vi.fn(),
  insert: vi.fn((options: unknown) => ({ type: "insert", payload: options })),
}));
vi.mock("@editor/store", () => ({
  useAppDispatch: () => fixture.dispatch,
  useAppStore: () => ({ getState: () => ({}) }),
}));
vi.mock("@editor/store/thunks/fields", () => ({
  fieldThunks: { move: { newField: { existingRow: fixture.insert } } },
}));
vi.mock("@editor/store/thunks/fields/containers", () => ({
  canPlaceField: () => true,
  isContainer: () => false,
}));
vi.mock("react-dnd", () => ({
  useDrop: (spec: TestSpec) => {
    fixture.spec = spec;
    return [
      { isOver: false, isCurrentRow: false, sectionHeight: 0 },
      (ref: unknown) => ref,
    ];
  },
}));

it("places a fast Spacer drop at the final pointer position before hover state has rendered", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  host.getBoundingClientRect = () => ({ left: 100, width: 900 }) as DOMRect;
  const root = createRoot(host);
  const row = { uid: "row", layoutUid: "layout", order: 0 };
  function Fixture(): null {
    useRowFieldDrop({ current: host }, row, 2, 900);
    return null;
  }
  try {
    act(() => root.render(<Fixture />));
    const fieldType: FieldType = {
      typeClass: Fields.Spacer,
      name: "Spacer",
      type: "spacer",
      visible: true,
      implements: [],
      properties: [],
    };
    act(() =>
      fixture.spec.drop(
        { type: Drag.FieldType, data: fieldType },
        { getClientOffset: () => ({ x: 780, y: 200 }) },
      ),
    );
    expect(fixture.insert).toHaveBeenCalledWith({ fieldType, row, order: 2 });
  } finally {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
