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

const fixture = vi.hoisted(() => ({ canMove: true, post: vi.fn() }));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express" },
  default: {
    metadata: {
      freeform: {
        get canOrganizeForms() {
          return fixture.canMove;
        },
      },
    },
    editions: { is: () => false },
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
  const sorting = useDashboardSorting(query.data);
  return (
    <div ref={sorting.wrapperRef}>
      <p role="status">{sorting.notice}</p>
      {query.data &&
        [
          ...query.data.formGroups.groups.map((group) => ({
            uid: group.uid,
            forms: group.forms,
          })),
          { uid: "", forms: query.data.forms },
        ].map((list) => (
          <ul key={list.uid} data-form-group={list.uid}>
            {list.forms.map((form) => (
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
            ))}
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
  formId: number,
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
    to.insertBefore(item, to.children[index] ?? null);
    sortable.option("onEnd")(event);
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  fixture.canMove = true;
  fixture.post.mockReset();
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
    await act(async () => resolve());
    expect(host.textContent).toContain("Form position saved.");
    expect(Sortable.get(list("b")).option("disabled")).toBe(false);
  });
  it("restores the original layout and re-enables dragging when saving fails", async () => {
    fixture.post.mockRejectedValue(new Error("Network error"));
    await render();
    await drag(1, "a", "", 0);
    expect(ids("a")).toEqual([1, 2]);
    expect(ids("")).toEqual([3]);
    expect(host.textContent).toContain("Could not save the form position");
    expect(Sortable.get(list("a")).option("disabled")).toBe(false);
  });
  it("does not save a drop in the original position", async () => {
    await render();
    await drag(1, "a", "a", 0);
    expect(fixture.post).not.toHaveBeenCalled();
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
