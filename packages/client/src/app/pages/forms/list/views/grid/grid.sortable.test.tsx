import type { FormWithGroup } from "@ff-client/types/form-groups";
import type { FormWithStats } from "@ff-client/types/forms";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import Sortable, { type SortableEvent } from "sortablejs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardSorting } from "./grid.sortable";
import { type DashboardWidget, mergeWidgetCards } from "./grid.widgets";

const fixture = vi.hoisted(() => ({
  canMove: true,
  isPro: true,
  widgets: [] as DashboardWidget[],
  saveWidgets: vi.fn(),
  reloadWidgets: vi.fn(),
  post: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Pro: "pro" },
  default: {
    metadata: {
      freeform: {
        get canOrganizeForms() {
          return fixture.canMove;
        },
      },
    },
    editions: { isAtLeast: () => fixture.isPro },
  },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 2 },
    getCurrentHandleWithFallback: () => "english",
  }),
}));
vi.mock("@ff-client/queries/forms", () => ({ QKForms: { base: ["forms"] } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: fixture.success, error: fixture.error },
}));
vi.mock("axios", () => ({ default: { post: fixture.post } }));

const key = ["groups", "english"];
const form = (id: number) => ({ id }) as FormWithStats;
const data: FormWithGroup = {
  forms: [form(3)],
  formGroups: {
    siteId: 2,
    groups: [
      { uid: "a", formIds: [1, 2], forms: [form(1), form(2)] },
      { uid: "b", formIds: [], forms: [] },
    ],
  },
};

const Harness = () => {
  const query = useQuery<FormWithGroup>({
    queryKey: key,
    queryFn: () => Promise.resolve(data),
    enabled: false,
  });
  const sorting = useDashboardSorting(query.data, true, {
    items: fixture.widgets,
    save: fixture.saveWidgets,
    reload: fixture.reloadWidgets,
  });
  return (
    <div ref={sorting.wrapperRef} data-dragging={sorting.isDragging}>
      {query.data &&
        [
          ...query.data.formGroups.groups.map((group) => ({
            uid: group.uid,
            forms: group.forms,
          })),
          { uid: "", forms: query.data.forms },
        ].map((list) => (
          <ul key={list.uid} data-form-group={list.uid}>
            {mergeWidgetCards(
              list.forms,
              fixture.widgets.filter(
                (widget) => (widget.groupUid || "") === list.uid,
              ),
            ).map((item) => {
              const form = {
                id: "beforeId" in item ? `widget-${item.uid}` : item.id,
              };
              return (
                <li key={form.id} data-id={form.id}>
                  <button
                    type="button"
                    className="handle"
                    onKeyDown={(event) =>
                      sorting.onKeyboardMove(form.id, event.key)
                    }
                  >
                    {form.id}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );
};

let client: QueryClient;
let root: Root;
let host: HTMLDivElement;
const render = async () => {
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  });
};
const list = (uid: string) =>
  host.querySelector<HTMLElement>(`[data-form-group="${uid}"]`);
const ids = (uid: string) =>
  Array.from(list(uid).children).map((element) =>
    Number((element as HTMLElement).dataset.id),
  );
const drag = async (
  formId: number | string,
  source: string,
  target: string,
  index: number,
) => {
  const from = list(source),
    to = list(target);
  const sortable = Sortable.get(from);
  const item = from.querySelector<HTMLElement>(`[data-id="${formId}"]`);
  const oldIndex = Array.from(from.children).indexOf(item);
  const event = {
    item,
    from,
    to,
    oldDraggableIndex: oldIndex,
    newDraggableIndex: index,
  } as SortableEvent;
  await act(async () => {
    sortable.option("onStart")(event);
    const siblings = Array.from(to.children).filter((child) => child !== item);
    to.insertBefore(item, siblings[index] ?? null);
    sortable.option("onEnd")(event);
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  fixture.canMove = true;
  fixture.isPro = true;
  fixture.widgets = [];
  fixture.saveWidgets.mockReset().mockResolvedValue(undefined);
  fixture.reloadWidgets.mockReset().mockResolvedValue(undefined);
  fixture.post.mockReset();
  fixture.success.mockReset();
  fixture.error.mockReset();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(key, data);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
});

describe("dashboard sorting lifecycle", () => {
  it("initializes after asynchronous loading and cleans up Sortable on unmount", async () => {
    client.removeQueries({ queryKey: key });
    await render();
    expect(list("a")).toBeNull();
    await act(async () => {
      client.setQueryData(key, data);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    const element = list("a");
    expect(Sortable.get(element)).toBeDefined();
    await act(async () => root.unmount());
    expect(Sortable.get(element)).toBeNull();
  });
  it("moves to an empty group, auto-saves once, and prevents additional moves while saving", async () => {
    let resolve: () => void;
    fixture.post.mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    await render();
    await drag(1, "a", "b", 0);
    expect(ids("a")).toEqual([2]);
    expect(ids("b")).toEqual([1]);
    expect(fixture.post).toHaveBeenCalledExactlyOnceWith(
      "/api/forms/groups/move",
      { formId: 1, groupUid: "b", beforeId: null, siteId: 2 },
    );
    expect(Sortable.get(list("b")).option("disabled")).toBe(true);
    await act(async () => {
      host
        .querySelector("[data-id='1'] button")
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        );
    });
    expect(fixture.post).toHaveBeenCalledTimes(1);
    expect(fixture.success).not.toHaveBeenCalled();
    await act(async () => resolve());
    expect(fixture.success).toHaveBeenCalledExactlyOnceWith(
      "Form position saved.",
    );
    expect(fixture.error).not.toHaveBeenCalled();
    expect(Sortable.get(list("b")).option("disabled")).toBe(false);
  });
  it("restores the original layout and re-enables dragging when saving fails", async () => {
    fixture.post.mockRejectedValue(new Error("Network error"));
    await render();
    await drag(1, "a", "", 0);
    expect(ids("a")).toEqual([1, 2]);
    expect(ids("")).toEqual([3]);
    expect(fixture.error).toHaveBeenCalledExactlyOnceWith(
      "Could not save the form position. Please try again.",
    );
    expect(fixture.success).not.toHaveBeenCalled();
    expect(Sortable.get(list("a")).option("disabled")).toBe(false);
  });
  it("does not save a drop in the original position", async () => {
    await render();
    await drag(1, "a", "a", 0);
    expect(fixture.post).not.toHaveBeenCalled();
    expect(fixture.success).not.toHaveBeenCalled();
    expect(fixture.error).not.toHaveBeenCalled();
    expect(ids("a")).toEqual([1, 2]);
  });
  it("does not enable rearranging for users without global form management", async () => {
    fixture.canMove = false;
    await render();
    expect(Sortable.get(list("a"))).toBeUndefined();
    await act(async () => {
      host
        .querySelector("[data-id='1'] button")
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        );
    });
    expect(fixture.post).not.toHaveBeenCalled();
  });
});

it("starts a held blank card, tolerates small pointer movement, and ignores interactive controls", async () => {
  await render();
  await act(async () => {
    client.setQueryData(key, data);
  });
  const pointer = "PointerEvent" in window;
  const card = list("a").querySelector<HTMLElement>("[data-id]");
  const button = card.querySelector("button");
  const down = (target: HTMLElement) =>
    target.dispatchEvent(
      new MouseEvent(pointer ? "pointerdown" : "mousedown", {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: 40,
        clientY: 40,
      }),
    );
  const release = () =>
    document.dispatchEvent(
      new MouseEvent(pointer ? "pointerup" : "mouseup", {
        bubbles: true,
        cancelable: true,
      }),
    );
  await act(async () => {
    down(button);
    await new Promise((resolve) => setTimeout(resolve, 260));
  });
  expect(card.classList.contains("card-chosen")).toBe(false);
  await act(async () => release());
  await act(async () => {
    down(card);
    document.dispatchEvent(
      new MouseEvent(pointer ? "pointermove" : "mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: 44,
        clientY: 42,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 260));
  });
  expect(card.classList.contains("card-chosen")).toBe(true);
  await act(async () => {
    document.dispatchEvent(
      new MouseEvent(pointer ? "pointermove" : "mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: 80,
        clientY: 60,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(host.firstElementChild.getAttribute("data-dragging")).toBe("true");
  await act(async () => release());
  expect(host.firstElementChild.getAttribute("data-dragging")).toBe("false");
  expect(card.classList.contains("card-chosen")).toBe(false);
  expect(fixture.post).not.toHaveBeenCalled();
});

it("moves a widget across groups without changing shared form order", async () => {
  fixture.widgets = [
    {
      uid: "w",
      type: "linear",
      title: "Chart",
      size: "2x2",
      groupUid: "a",
      beforeId: 2,
    },
  ];
  await render();
  await drag("widget-w", "a", "b", 0);
  expect(fixture.saveWidgets).toHaveBeenCalledWith([
    { uid: "w", size: "2x2", groupUid: "b", beforeId: null },
  ]);
  expect(fixture.post).not.toHaveBeenCalled();
});

it("saves a widget dropped in a wrapping gap and excludes temporary targets from its order", async () => {
  fixture.widgets = [
    {
      uid: "w",
      type: "recent",
      title: "Recent",
      size: "1x2",
      groupUid: "a",
      beforeId: null,
    },
  ];
  await render();
  const from = list("a");
  from.style.cssText =
    "display:grid;grid-template-columns:80px 80px 80px 80px;grid-auto-rows:50px;gap:10px";
  const wide = from.querySelector<HTMLElement>('[data-id="1"]');
  const wrapped = from.querySelector<HTMLElement>('[data-id="2"]');
  const item = from.querySelector<HTMLElement>('[data-id="widget-w"]');
  wide.style.cssText = "grid-column-start:span 3;grid-row-start:span 2";
  wrapped.style.cssText = "grid-column-start:span 2;grid-row-start:span 2";
  item.style.cssText = "grid-column-start:span 1;grid-row-start:span 2";
  const sortable = Sortable.get(from);
  const event = {
    item,
    from,
    to: from,
    oldDraggableIndex: 2,
    newDraggableIndex: 2,
  } as SortableEvent;
  await act(async () => {
    sortable.option("onStart")(event);
    const gap = from.querySelector<HTMLElement>("[data-grid-gap]");
    expect(gap).not.toBeNull();
    expect(
      sortable.option("onMove")(
        { related: gap } as Sortable.MoveEvent,
        new Event("move"),
      ),
    ).toBe(-1);
    from.insertBefore(item, gap);
    sortable.option("onEnd")(event);
  });
  expect(fixture.saveWidgets).toHaveBeenCalledExactlyOnceWith([
    { uid: "w", size: "1x2", groupUid: "a", beforeId: 2 },
  ]);
  expect(host.querySelector("[data-grid-gap]")).toBeNull();
  expect(fixture.post).not.toHaveBeenCalled();
});

it("saves interleaved widget positions together with a moved form", async () => {
  fixture.widgets = [
    {
      uid: "w",
      type: "linear",
      title: "Chart",
      size: "2x2",
      groupUid: "a",
      beforeId: 2,
    },
  ];
  fixture.post.mockResolvedValue({});
  await render();
  await drag(1, "a", "a", 1);
  expect(fixture.post).toHaveBeenCalledWith("/api/forms/groups/move", {
    formId: 1,
    groupUid: "a",
    beforeId: 2,
    siteId: 2,
    widgets: [{ uid: "w", size: "2x2", groupUid: "a", beforeId: 1 }],
  });
  expect(fixture.reloadWidgets).toHaveBeenCalled();
});

it("disables dragging and keyboard moves after a downgrade even with cached widgets", async () => {
  fixture.isPro = false;
  fixture.widgets = [
    {
      uid: "cached",
      type: "linear",
      title: "Chart",
      size: "3x3",
      groupUid: "a",
      beforeId: null,
    },
  ];
  await render();
  expect(Sortable.get(list("a"))).toBeUndefined();
  expect(
    host.querySelector('[data-id="1"]')?.getAttribute("tabindex"),
  ).not.toBe("0");
  expect(fixture.post).not.toHaveBeenCalled();
  expect(fixture.saveWidgets).not.toHaveBeenCalled();
});
