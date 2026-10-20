import { act } from "react";
import { DndProvider, useDragDropManager, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Drag } from "../../types/drag";
import { useDragRecovery } from "./drag.recovery";

let manager: ReturnType<typeof useDragDropManager>;
let root: Root;
let host: HTMLDivElement;
const ended = vi.fn();
function Fixture() {
  manager = useDragDropManager();
  useDragRecovery();
  const dragging = useDragLayer((monitor) => monitor.isDragging());
  return (
    <output data-dragging={dragging}>{dragging ? "dimmed" : "ready"}</output>
  );
}
function mount() {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <DndProvider backend={HTML5Backend}>
        <Fixture />
      </DndProvider>,
    ),
  );
}
function begin(type: Drag = Drag.Field) {
  let id = "";
  act(() => {
    id = manager.getRegistry().addSource(type, {
      canDrag: () => true,
      beginDrag: () => ({}),
      isDragging: (monitor, sourceId) => monitor.getSourceId() === sourceId,
      endDrag: ended,
    });
    manager.getActions().beginDrag([id]);
  });
  expect(manager.getMonitor().isDragging()).toBe(true);
  expect(host.querySelector("output")!.textContent).toBe("dimmed");
  return id;
}
afterEach(() => {
  act(() => {
    if (manager?.getMonitor().isDragging()) manager.getActions().endDrag();
    root?.unmount();
    manager?.getBackend().teardown();
  });
  host?.remove();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  ended.mockReset();
});

it.each(["mouseup", "dragend", "pointerdown", "mousedown", "Escape"])(
  "releases a real DnD drag stuck without a native end event on %s",
  (event) => {
    mount();
    begin();
    act(() => {
      window.dispatchEvent(
        event === "Escape"
          ? new KeyboardEvent("keydown", { key: "Escape" })
          : new Event(event),
      );
      vi.runOnlyPendingTimers();
    });
    expect(manager.getMonitor().isDragging()).toBe(false);
    expect(host.querySelector("output")!.textContent).toBe("ready");
    expect(ended).toHaveBeenCalledOnce();
    begin();
    act(() => window.dispatchEvent(new MouseEvent("mousedown")));
    expect(manager.getMonitor().isDragging()).toBe(false);
  },
);

it.each([Drag.FieldType, Drag.FavoriteField])(
  "releases a stuck %s drag on Escape keyup",
  (type) => {
    mount();
    begin(type);
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" })),
    );
    expect(manager.getMonitor().isDragging()).toBe(false);
  },
);

it("lets native mouseup/drop processing finish before recovery ends the source", () => {
  mount();
  const order: string[] = [];
  ended.mockImplementation(() => order.push("end"));
  begin();
  const targetId = manager.getRegistry().addTarget(Drag.Field, {
    canDrop: () => true,
    hover: () => {},
    drop: () => {
      order.push("drop");
      return {};
    },
  });
  act(() => {
    manager.getActions().hover([targetId]);
    window.dispatchEvent(new MouseEvent("mouseup"));
    expect(manager.getMonitor().isDragging()).toBe(true);
    manager.getActions().drop();
    vi.runOnlyPendingTimers();
  });
  expect(order).toEqual(["drop", "end"]);
  expect(manager.getMonitor().didDrop()).toBe(false);
  manager.getRegistry().removeTarget(targetId);
});

it("leaves unrelated drag types and ordinary keys alone", () => {
  mount();
  begin(Drag.OptionRow);
  act(() => {
    window.dispatchEvent(new MouseEvent("mousedown"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.runOnlyPendingTimers();
  });
  expect(manager.getMonitor().isDragging()).toBe(true);
  act(() => manager.getActions().endDrag());
  begin();
  act(() =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })),
  );
  expect(manager.getMonitor().isDragging()).toBe(true);
});

it("does not end a normal native drop twice", () => {
  mount();
  begin();
  act(() => {
    window.dispatchEvent(new Event("drop"));
    vi.runOnlyPendingTimers();
  });
  expect(manager.getMonitor().isDragging()).toBe(false);
  expect(ended).toHaveBeenCalledOnce();
});

it("removes recovery listeners and cancels deferred cleanup when leaving the layout", () => {
  mount();
  begin();
  act(() => {
    window.dispatchEvent(new MouseEvent("mouseup"));
    root.unmount();
    root = undefined!;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    window.dispatchEvent(new MouseEvent("mousedown"));
    vi.runOnlyPendingTimers();
  });
  expect(ended).not.toHaveBeenCalled();
  expect(manager.getMonitor().isDragging()).toBe(true);
});
