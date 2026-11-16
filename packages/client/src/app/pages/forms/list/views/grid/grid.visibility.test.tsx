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
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FormGrid } from "./grid";
import { type DashboardWidget, widgetKey } from "./grid.widgets";

const fixture = vi.hoisted(() => ({
  canMove: true,
  loading: false,
  post: vi.fn(),
  get: vi.fn(),
  errors: 0,
}));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express", Pro: "pro" },
  default: {
    metadata: {
      freeform: {
        get canOrganizeForms() {
          return fixture.canMove;
        },
      },
    },
    editions: { is: () => false, isAtLeast: () => true },
  },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 2 },
    getCurrentHandleWithFallback: () => "default",
  }),
}));
vi.mock("@ff-client/queries/form-groups", () => ({
  QKGroups: { all: () => ["groups", "default"] },
  useFetchFormGroups: () => ({
    ...useQuery<FormWithGroup>({
      queryKey: ["groups", "default"],
      queryFn: async () => ({
        forms: [],
        formGroups: { siteId: 2, groups: [] },
      }),
      enabled: false,
    }),
    isFetching: fixture.loading,
  }),
}));
vi.mock("@ff-client/queries/forms", () => ({ QKForms: { base: ["forms"] } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string | number> = {}) =>
    text.replace(/\{(\w+)\}/g, (match, key) => String(params[key] ?? match)),
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("axios", () => ({ default: { post: fixture.post, get: fixture.get } }));
vi.mock("../../notices/notices.queries", () => ({
  useNoticesQuery: () => ({
    data: {
      notices: [],
      errors: fixture.errors,
      errorLog: "activity",
      warningLogs: [],
      activityRetentionDays: 30,
    },
  }),
  useNoticeDeleteMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@components/modals/modal.context", () => ({
  useModal: () => ({ openSlideout: vi.fn() }),
}));
vi.mock("./card/card.size-menu", () => ({ CardSizeMenu: () => null }));
vi.mock("./card/card.queries", () => ({ useCardStats: () => ({}) }));
vi.mock("../../modals/hooks/use-add-form-modal", () => ({
  useFormLimitModal: () => vi.fn(),
}));
vi.mock("./archived/archived", () => ({ Archived: () => null }));
vi.mock("./card/card.loading", () => ({ CardLoading: () => <li>Loading</li> }));
vi.mock("./card/card.preview", () => ({ CardPreview: () => null }));
vi.mock("./grid.empty", () => ({ GridEmpty: () => <p>No forms</p> }));
vi.mock("./card/card", () => ({
  Card: ({ form }: { form: FormWithStats }) => (
    <li data-id={form.id}>
      <button type="button" className="handle">
        {form.name}
      </button>
    </li>
  ),
}));

const key = ["groups", "default"];
const form = (id: number) => ({ id, name: `Form ${id}` }) as FormWithStats;
const data = (): FormWithGroup => ({
  forms: [],
  formGroups: {
    siteId: 2,
    groups: [
      { uid: "assigned", label: "Assigned", formIds: [1], forms: [form(1)] },
      { uid: "quotes", label: "Quotes", formIds: [], forms: [] },
    ],
  },
});
let client: QueryClient;
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Craft", {
    getCpUrl: (path: string) => `https://craft.test/${path}`,
  });
  fixture.canMove = true;
  fixture.loading = false;
  fixture.errors = 0;
  fixture.get
    .mockReset()
    .mockResolvedValue({ data: { items: [], types: [], forms: {} } });
  fixture.post.mockReset().mockResolvedValue({});
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(key, data());
  client.setQueryData(widgetKey(2), { items: [], types: [] });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  vi.unstubAllGlobals();
});
const render = async (search = "") => {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <FormGrid search={search} />
      </QueryClientProvider>,
    ),
  );
};
const list = (uid: string) =>
  host.querySelector<HTMLElement>(`[data-form-group="${uid}"]`)!;
const otherGroup = () => list("")?.parentElement;
const startDrag = async () => {
  const from = list("assigned");
  const item = from.querySelector<HTMLElement>("[data-id='1']")!;
  const event = {
    item,
    from,
    to: from,
    oldDraggableIndex: 0,
    newDraggableIndex: 0,
  } as SortableEvent;
  const sortable = Sortable.get(from)!;
  await act(async () => sortable.option("onStart")(event));
  return { from, item, event, sortable };
};

it("hides empty Other at rest while keeping its drop target registered at the bottom", async () => {
  await render();
  expect(otherGroup()?.hidden).toBe(true);
  expect(Sortable.get(list(""))).toBeDefined();
  expect(list("quotes").parentElement?.hidden).toBe(false);
  expect(list("").parentElement?.nextElementSibling).toBeNull();
  const target = Sortable.get(list(""));
  const { event, sortable } = await startDrag();
  expect(otherGroup()?.hidden).toBe(false);
  expect(Sortable.get(list(""))).toBe(target);
  await act(async () => sortable.option("onEnd")(event));
  expect(otherGroup()?.hidden).toBe(true);
  expect(fixture.post).not.toHaveBeenCalled();
});

const health: DashboardWidget = {
  uid: "health",
  type: "activity-health",
  title: "Activity & Health",
  size: "2x2",
  groupUid: "assigned",
  beforeId: null,
  revision: "first",
  replacesBanner: true,
};
const settle = async () => {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
};
const banner = () => host.querySelector(".ff-log-alert");
const loadHealth = async (ready: boolean) => {
  const frame = host.querySelector("iframe")!;
  Object.defineProperty(frame, "contentDocument", {
    configurable: true,
    value: {
      URL: "https://craft.test/health",
      querySelector: () => (ready ? {} : null),
    },
  });
  await act(async () => frame.dispatchEvent(new Event("load")));
};

it("never flashes the log banner during a delayed widget list and health document load", async () => {
  fixture.errors = 5;
  client.removeQueries({ queryKey: widgetKey(2) });
  let resolveWidgets!: (value: unknown) => void;
  fixture.get.mockImplementation((url: string) =>
    url === "/api/forms/widgets"
      ? new Promise((resolve) => {
          resolveWidgets = resolve;
        })
      : Promise.resolve({ data: { forms: {} } }),
  );
  const flashes: Element[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (
          node instanceof Element &&
          (node.matches(".ff-log-alert") || node.querySelector(".ff-log-alert"))
        )
          flashes.push(node);
      }
    }
  });
  observer.observe(host, { childList: true, subtree: true });
  try {
    await render();
    expect(banner()).toBeNull();
    await act(async () =>
      resolveWidgets({ data: { items: [health], types: [] } }),
    );
    await settle();
    expect(host.querySelector("iframe")).not.toBeNull();
    expect(banner()).toBeNull();
    await loadHealth(true);
    expect(banner()).toBeNull();
    expect(flashes).toHaveLength(0);
  } finally {
    observer.disconnect();
  }
});

it.each(["empty", "failed"])(
  "shows log alerts after the widget list is %s",
  async (result) => {
    fixture.errors = 5;
    client.removeQueries({ queryKey: widgetKey(2) });
    if (result === "failed")
      fixture.get.mockRejectedValue(new Error("Unavailable"));
    await render();
    await settle();
    expect(banner()?.textContent).toContain("5 errors");
  },
);

it("restores alerts for a failed health document, hides them during a replacement load, and restores them when removed", async () => {
  fixture.errors = 5;
  client.setQueryData(widgetKey(2), { items: [health], types: [] });
  await render();
  await settle();
  expect(banner()).toBeNull();
  await loadHealth(false);
  expect(banner()?.textContent).toContain("5 errors");
  await act(async () =>
    client.setQueryData(widgetKey(2), {
      items: [{ ...health, revision: "updated" }],
      types: [],
    }),
  );
  await settle();
  expect(banner()).toBeNull();
  await loadHealth(true);
  expect(banner()).toBeNull();
  await act(async () =>
    client.setQueryData(widgetKey(2), { items: [], types: [] }),
  );
  await settle();
  expect(banner()?.textContent).toContain("5 errors");
});

it("shows log alerts while searching hides a replacement widget", async () => {
  fixture.errors = 5;
  client.setQueryData(widgetKey(2), { items: [health], types: [] });
  await render();
  await settle();
  expect(banner()).toBeNull();
  await render("Form");
  expect(host.querySelector("iframe")).toBeNull();
  expect(banner()?.textContent).toContain("5 errors");
  await render();
  expect(banner()).toBeNull();
});

it("accepts a drop into the newly revealed Other area and keeps the unassigned card visible", async () => {
  await render();
  const { item, event, sortable } = await startDrag();
  const to = list("");
  expect(Sortable.get(to)).toBeDefined();
  await act(async () => {
    to.append(item);
    sortable.option("onEnd")({ ...event, to });
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(otherGroup()?.hidden).toBe(false);
  expect(list("").querySelector("[data-id='1']")).not.toBeNull();
  expect(fixture.post).toHaveBeenCalledExactlyOnceWith(
    "/api/forms/groups/move",
    { formId: 1, groupUid: null, beforeId: null, siteId: 2 },
  );
});

it("shows existing unassigned forms without requiring a drag", async () => {
  client.setQueryData(key, { ...data(), forms: [form(2)] });
  await render();
  expect(otherGroup()?.hidden).toBe(false);
  expect(list("").textContent).toContain("Form 2");
});

it("does not show an empty Other area during initial loading or without organize permission", async () => {
  client.clear();
  fixture.loading = true;
  await render();
  expect(otherGroup()).toBeUndefined();
  fixture.loading = false;
  fixture.canMove = false;
  await act(async () => client.setQueryData(key, data()));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
  expect(otherGroup()).toBeUndefined();
});
