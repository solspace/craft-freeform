import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Row } from "@editor/builder/types/layout";
import fieldsReducer, { type Field } from "@editor/store/slices/layout/fields";
import rowsReducer from "@editor/store/slices/layout/rows";
import { configureStore } from "@reduxjs/toolkit";
import { act, useRef } from "react";
import { DndProvider, useDragDropManager } from "react-dnd";
import { createRoot, type Root } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { combineReducers } from "redux";
import { afterEach, expect, it, vi } from "vitest";
import { useRowFieldDrop } from "./row.field-drop";

let root: Root;
let host: HTMLDivElement;
let manager: ReturnType<typeof useDragDropManager>;
const targetIds = new Map<string, string>();
const row: Row = { uid: "target", layoutUid: "layout", order: 0 };
const makeField = (uid: string, order: number, rowUid = row.uid): Field => ({
  uid,
  order,
  rowUid,
  typeClass: "Text",
  properties: { label: uid },
});
function Backend() {
  return {
    setup() {},
    teardown() {},
    connectDragSource: () => () => {},
    connectDragPreview: () => () => {},
    connectDropTarget: (id: string, node: HTMLElement) => {
      targetIds.set(node.dataset.row!, id);
      return () => targetIds.delete(node.dataset.row!);
    },
  };
}
function Target() {
  const count = useSelector(
    (state: { layout: { fields: Field[] } }) =>
      state.layout.fields.filter((field) => field.rowUid === row.uid).length,
  );
  manager = useDragDropManager();
  const wrapper = useRef<HTMLDivElement>(null);
  const drop = useRowFieldDrop(wrapper, row, count, 900);
  return (
    <div
      data-row={row.uid}
      ref={(node) => {
        wrapper.current = node;
        drop.ref(node);
      }}
    >
      <output>{drop.hoverPosition}</output>
    </div>
  );
}
function mount(fields: Field[]) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const store = configureStore({
    reducer: {
      layout: combineReducers({ fields: fieldsReducer, rows: rowsReducer }),
    },
    preloadedState: {
      layout: { fields, rows: [row, { ...row, uid: "source", order: 1 }] },
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <Provider store={store}>
        <DndProvider backend={Backend}>
          <Target />
        </DndProvider>
      </Provider>,
    ),
  );
  vi.spyOn(
    host.querySelector("[data-row]")!,
    "getBoundingClientRect",
  ).mockReturnValue({
    x: 100,
    left: 100,
    width: 900,
    right: 1000,
    top: 0,
    bottom: 80,
    y: 0,
    height: 80,
    toJSON() {},
  });
  return store;
}
function begin(item: DragItem, x = 150) {
  act(() => {
    const source = manager.getRegistry().addSource(item.type, {
      canDrag: () => true,
      beginDrag: () => item,
      isDragging: (monitor, id) => monitor.getSourceId() === id,
      endDrag() {},
    });
    manager.getActions().beginDrag([source], {
      clientOffset: { x, y: 40 },
      getSourceClientOffset: () => ({ x: 100, y: 0 }),
    });
  });
}
function hover(x: number) {
  manager
    .getActions()
    .hover([targetIds.get(row.uid)!], { clientOffset: { x, y: 40 } });
}
function finish(x: number) {
  act(() => {
    hover(x);
    manager.getActions().drop();
    manager.getActions().endDrag();
  });
}
function order(store: ReturnType<typeof mount>) {
  return store
    .getState()
    .layout.fields.filter((f) => f.rowUid === row.uid)
    .sort((a, b) => a.order - b.order)
    .map((f) => [f.uid, f.order]);
}
afterEach(() => {
  act(() => {
    if (manager?.getMonitor().isDragging()) manager.getActions().endDrag();
    root?.unmount();
  });
  host?.remove();
  targetIds.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("uses the release position when the last hover and drop happen before React renders", () => {
  const fields = [makeField("A", 0), makeField("B", 1), makeField("C", 2)];
  const store = mount(fields);
  begin({ type: Drag.Field, data: fields[0], index: 0 });
  act(() => hover(150));
  finish(950);
  expect(order(store)).toEqual([
    ["B", 0],
    ["C", 1],
    ["A", 2],
  ]);
});
it("updates the preview from the current pointer rather than the previous hover", () => {
  const fields = [makeField("A", 0), makeField("B", 1), makeField("C", 2)];
  mount(fields);
  begin({ type: Drag.Field, data: fields[0], index: 0 });
  act(() => hover(150));
  act(() => hover(950));
  expect(host.querySelector("output")!.textContent).toBe("2");
});
it("inserts a field from another row at the release position", () => {
  const field = makeField("C", 0, "source");
  const store = mount([makeField("A", 0), makeField("B", 1), field]);
  begin({ type: Drag.Field, data: field, index: 0 });
  act(() => hover(150));
  finish(950);
  expect(order(store)).toEqual([
    ["A", 0],
    ["B", 1],
    ["C", 2],
  ]);
});
it.each<[number, Array<[string, number]>]>([
  [
    -5,
    [
      ["C", 0],
      ["A", 1],
      ["B", 2],
    ],
  ],
  [
    1001,
    [
      ["A", 0],
      ["B", 1],
      ["C", 2],
    ],
  ],
])("keeps row orders contiguous at edge x=%s", (x, expected) => {
  const fields = [makeField("A", 0), makeField("B", 1), makeField("C", 2)];
  const store = mount(fields);
  begin({ type: Drag.Field, data: fields[2], index: 2 });
  act(() => hover(x));
  act(() => hover(x));
  finish(x);
  expect(order(store)).toEqual(expected);
});

it("clears a cancelled preview and lets the next drag use a different position", () => {
  const fields = [makeField("A", 0), makeField("B", 1), makeField("C", 2)];
  const store = mount(fields);
  begin({ type: Drag.Field, data: fields[0], index: 0 });
  act(() => hover(950));
  expect(host.querySelector("output")!.textContent).toBe("2");
  act(() => manager.getActions().endDrag());
  expect(host.querySelector("output")!.textContent).toBe("");
  expect(order(store)).toEqual([
    ["A", 0],
    ["B", 1],
    ["C", 2],
  ]);
  begin({ type: Drag.Field, data: fields[2], index: 2 });
  finish(150);
  expect(order(store)).toEqual([
    ["C", 0],
    ["A", 1],
    ["B", 2],
  ]);
});
it("keeps a field in position zero when dropped back in its one-field row", () => {
  const field = makeField("A", 0);
  const store = mount([field]);
  begin({ type: Drag.Field, data: field, index: 0 });
  finish(950);
  expect(order(store)).toEqual([["A", 0]]);
});
