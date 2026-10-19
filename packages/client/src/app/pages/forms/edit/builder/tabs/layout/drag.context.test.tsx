import type { Field } from "@editor/store/slices/layout/fields";
import type { FieldType } from "@ff-client/types/fields";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Drag } from "../../types/drag";
import { DragContextProvider, useDragContext } from "./drag.context";
import { useFieldDrag } from "./field-layout/field/field.drag";
import { useBaseFieldDrag } from "./field-list/implementations/base-fields/field-item.drag";

const drag = vi.hoisted(() => ({ active: "", connect: vi.fn() }));
vi.mock("./drag.recovery", () => ({ useDragRecovery: () => {} }));
vi.mock("react-dnd", () => ({
  useDrag: (
    create: () => { item: { data: { uid?: string; typeClass?: string } } },
  ) => {
    const { data } = create().item;
    return [
      { isDragging: drag.active === (data.uid || data.typeClass) },
      drag.connect,
      drag.connect,
    ];
  },
}));
let root: Root;
let host: HTMLDivElement;
let context: ReturnType<typeof useDragContext>;
let renders: number;
function Monitor() {
  context = useDragContext();
  if (++renders > 40) throw new Error("Drag state entered a render loop");
  return <output>{context.isDragging ? context.dragType : "idle"}</output>;
}
function Existing({ id }: { id: string }) {
  useFieldDrag({ uid: id } as Field, 0);
  return null;
}
function Available({ id }: { id: string }) {
  useBaseFieldDrag({ typeClass: id } as FieldType);
  return null;
}
function mount(mode: Drag, extra = false) {
  if (!root) {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    renders = 0;
  }
  const Active = mode === Drag.Field ? Existing : Available;
  act(() =>
    root.render(
      <DragContextProvider>
        <Monitor />
        <Active id="active" />
        <Existing id="inactive-field" />
        <Available id="inactive-type" />
        {extra && (
          <>
            <Existing id="added-field" />
            <Available id="added-type" />
          </>
        )}
      </DragContextProvider>,
    ),
  );
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined!;
  host?.remove();
  drag.active = "";
  vi.unstubAllGlobals();
});

it.each([Drag.Field, Drag.FieldType])(
  "keeps %s dragging while idle sources rerender or mount, then clears on cancel",
  (mode) => {
    mount(mode);
    expect(context.isDragging).toBe(false);
    const start = context.dragOn,
      stop = context.dragOff;
    drag.active = "active";
    mount(mode);
    expect(context.isDragging).toBe(true);
    expect(context.dragType).toBe(mode);
    expect(context.dragOn).toBe(start);
    expect(context.dragOff).toBe(stop);
    mount(mode, true);
    expect(context.isDragging).toBe(true);
    expect(context.dragType).toBe(mode);
    drag.active = "";
    mount(mode, true);
    expect(context.isDragging).toBe(false);
    expect(context.dragType).toBeUndefined();
    expect(context.position).toBeUndefined();
  },
);

it("clears drag state when the active source unmounts, and allows a new drag", () => {
  drag.active = "active";
  mount(Drag.Field);
  act(() =>
    root.render(
      <DragContextProvider>
        <Monitor />
        <Existing id="inactive-field" />
      </DragContextProvider>,
    ),
  );
  expect(context.isDragging).toBe(false);
  drag.active = "active";
  mount(Drag.FieldType);
  expect(context.isDragging).toBe(true);
  expect(context.dragType).toBe(Drag.FieldType);
});
