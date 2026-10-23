import type { FormWithGroup } from "@ff-client/types/form-groups";
import type { FormWithStats } from "@ff-client/types/forms";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import Sortable from "sortablejs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ListProvider } from "./index";

const fixture = vi.hoisted(() => ({
  groups: {} as FormWithGroup,
  forms: [] as FormWithStats[],
}));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express", Lite: "lite", Pro: "pro" },
  default: {
    metadata: {
      craft: { is5: true },
      freeform: { canCreate: true, canOrganizeForms: true },
    },
    editions: { is: () => false, isAtLeast: () => true },
  },
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 1 },
    getCurrentHandleWithFallback: () => "default",
  }),
}));
vi.mock("@ff-client/queries/form-groups", () => ({
  QKGroups: { all: () => ["groups", "default"] },
  useFetchFormGroups: () => ({ data: fixture.groups, isFetching: false }),
}));
vi.mock("@ff-client/queries/forms", () => ({
  QKForms: { base: ["forms"] },
  useQueryFormsWithStats: () => ({ data: fixture.forms, isFetching: false }),
}));
vi.mock("@ff-client/queries/field-types", () => ({
  QKFieldTypes: { all: ["fields"], propertySections: () => ["sections"] },
  fetchFieldTypes: async () => [],
  fetchFieldPropertySections: async () => [],
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("./modals/hooks/use-add-form-modal", () => ({
  useAddFormModal: () => vi.fn(),
  useFormLimitModal: () => vi.fn(),
}));
vi.mock("./modals/hooks/use-edit-group-modal", () => ({
  useEditGroupModal: () => vi.fn(),
}));
vi.mock("./views/grid/grid.widgets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./views/grid/grid.widgets")>()),
  useDashboardWidgets: () => ({
    items: [],
    isSaving: false,
    isError: false,
    siteId: 1,
    save: vi.fn(),
    reload: vi.fn(),
  }),
}));
vi.mock("./notices/notices", () => ({ Notices: () => null }));
vi.mock("./views/grid/grid.empty", () => ({
  GridEmpty: () => <p>Create your first form</p>,
}));
vi.mock("./views/grid/card/card", () => ({
  Card: ({ form, canMove }: { form: FormWithStats; canMove: boolean }) => (
    <li data-id={form.id}>
      {form.name}
      {canMove && (
        <button type="button" className="handle">
          Move
        </button>
      )}
    </li>
  ),
}));
vi.mock("./views/list/list.table.row", () => ({
  ListTableRow: ({ form }: { form: FormWithStats }) => (
    <tr data-id={form.id}>
      <td>{form.name}</td>
    </tr>
  ),
}));
vi.mock("./views/grid/archived/archived", () => ({
  Archived: ({ data }: { data: FormWithStats[] }) => (
    <div data-archived>
      {data?.map((form) => (
        <span key={form.id}>{form.name}</span>
      ))}
    </div>
  ),
}));

const form = (
  id: number,
  name: string,
  handle: string,
  description?: string,
  dateArchived: string | null = null,
): FormWithStats => ({
  id,
  uid: String(id),
  name,
  handle,
  description,
  dateArchived,
  type: "regular",
  isNew: false,
  settings: {},
  links: [],
  chartData: [],
  counters: { submissions: 0, spam: 0 },
});
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  const contact = form(1, "Contact Us", "contactUs", "Main enquiries");
  const quote = form(2, "Get a Quote", "quoteRequest", "Sales estimates");
  const survey = form(3, "Survey", "customerFeedback");
  const archived = form(
    4,
    "Old Contact",
    "oldContact",
    undefined,
    "2026-10-01",
  );
  fixture.groups = {
    forms: [survey],
    archivedForms: [archived],
    formGroups: {
      groups: [
        { uid: "contact", label: "Contact", formIds: [1], forms: [contact] },
        { uid: "sales", label: "Sales", formIds: [2], forms: [quote] },
      ],
    },
  };
  fixture.forms = [contact, quote, survey, archived];
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <ListProvider />
      </QueryClientProvider>,
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  vi.unstubAllGlobals();
});
const input = () =>
  host.querySelector<HTMLInputElement>('input[type="search"]')!;
const search = async (value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input(), value);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
};
const ids = () =>
  Array.from(host.querySelectorAll("[data-id]"), (node) =>
    node.getAttribute("data-id"),
  );
const listView = async () => {
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[title="Display as list"]')!.click(),
  );
};

it("places search, view, chart period, and Form groups in toolbar order", () => {
  expect(input().getAttribute("aria-label")).toBe("Search forms");
  expect(input().placeholder).toBe("Search");
  expect(input().parentElement!.classList.contains("texticon")).toBe(true);
  const controls = input().parentElement!.parentElement!;
  expect(controls.firstElementChild!.contains(input())).toBe(true);
  expect(controls.children[1].getAttribute("aria-label")).toBe("View");
  expect(
    controls.children[2].querySelector('[aria-label="Chart period"]'),
  ).not.toBeNull();
  expect(
    controls.children[3].querySelector('[aria-label="Insert widget"]'),
  ).not.toBeNull();
  expect(controls.children[4].textContent).toBe("Form groups");
  expect(host.textContent).not.toContain("Submission history");
  expect(host.textContent).not.toContain("UTC · today so far");
});

it("exposes the selected view using Craft's native pressed button state", async () => {
  const cards = host.querySelector('[aria-label="Display as cards"]')!;
  const table = host.querySelector('[aria-label="Display in a table"]')!;
  expect(cards.getAttribute("aria-pressed")).toBe("true");
  expect(table.getAttribute("aria-pressed")).toBe("false");
  await listView();
  expect(cards.getAttribute("aria-pressed")).toBe("false");
  expect(table.getAttribute("aria-pressed")).toBe("true");
  expect(host.querySelector('[aria-label="Chart period"]')).toBeNull();
  await act(async () =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Display as cards"]')!
      .click(),
  );
  const period = host.querySelector('[aria-label="Chart period"]');
  expect(period).not.toBeNull();
  const selected = period.querySelector('[aria-pressed="true"]');
  expect(selected.textContent).toContain("30");
  expect(selected.classList.contains("btn")).toBe(true);
  expect(selected.classList.contains("active")).toBe(true);
});

it("filters grouped and unassigned forms live and hides empty groups", async () => {
  await search("  QUOTE  ");
  expect(ids()).toEqual(["2"]);
  expect(host.querySelector('[data-form-group="sales"]')).not.toBeNull();
  expect(host.querySelector('[data-form-group="contact"]')).toBeNull();
  expect(host.querySelector('[data-form-group=""]')).toBeNull();
  await search("customerFeedback");
  expect(ids()).toEqual(["3"]);
  await search("main enquiries");
  expect(ids()).toEqual(["1"]);
});

it("matches multiple search terms across name, handle, and description", async () => {
  await search("contact   ENQUIRIES");
  expect(ids()).toEqual(["1"]);
});

it("preserves the query and filters in both views, including archived forms", async () => {
  await search("contact");
  expect(ids()).toEqual(["1"]);
  expect(host.querySelector("[data-archived]")!.textContent).toBe(
    "Old Contact",
  );
  await listView();
  expect(input().value).toBe("contact");
  expect(ids()).toEqual(["1"]);
  expect(host.querySelector("[data-archived]")!.textContent).toBe(
    "Old Contact",
  );
  await search("ESTIMATES");
  expect(ids()).toEqual(["2"]);
  expect(host.querySelector("[data-archived]")!.textContent).toBe("");
});

it("shows a no-results message in both views instead of onboarding", async () => {
  await search("nonexistent");
  expect(host.querySelector('[role="status"]')!.textContent).toBe(
    "No forms match your search.",
  );
  expect(host.textContent).not.toContain("Create your first form");
  await listView();
  expect(host.querySelector('[role="status"]')!.textContent).toBe(
    "No forms match your search.",
  );
  expect(host.textContent).not.toContain("You don't have any forms yet");
});

it("clears via button or Escape, restores forms, and returns focus to search", async () => {
  await search("quote");
  await act(async () =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Clear search"]')!
      .click(),
  );
  expect(input().value).toBe("");
  expect(ids()).toEqual(["1", "2", "3"]);
  expect(document.activeElement).toBe(input());
  await search("nonexistent");
  await act(async () =>
    input().dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(input().value).toBe("");
  expect(ids()).toEqual(["1", "2", "3"]);
});

it("disables reordering during search and restores it when cleared", async () => {
  const group = () =>
    host.querySelector<HTMLElement>('[data-form-group="contact"]')!;
  expect(Sortable.get(group())).toBeDefined();
  await search("contact");
  expect(Sortable.get(group())).toBeNull();
  expect(host.querySelector(".handle")).toBeNull();
  await search("");
  expect(Sortable.get(group())).toBeDefined();
  expect(host.querySelector(".handle")).not.toBeNull();
});

it("treats whitespace as an empty search and preserves fetched form ordering", async () => {
  const originalIds = fixture.forms.map((form) => form.id);
  await search("   ");
  expect(ids()).toEqual(["1", "2", "3"]);
  await listView();
  expect(ids()).toEqual(["1", "2", "3"]);
  expect(fixture.forms.map((form) => form.id)).toEqual(originalIds);
});
