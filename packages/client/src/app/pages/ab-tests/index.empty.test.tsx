import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { AbTests } from ".";
import { ABTestModal } from "./ab-tests.modal";

const state = vi.hoisted(() => ({
  query: {
    data: [] as unknown[] | undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  },
  openModal: vi.fn(),
  permission: "manage",
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    permissions: {
      get abTests() {
        return state.permission;
      },
    },
  },
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@components/modals/modal.context", () => ({
  useModal: () => ({ openModal: state.openModal }),
}));
vi.mock("@ff-client/hooks/use-sidebar-select", () => ({
  useSidebarSelect: () => {},
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams()],
}));
vi.mock("./ab-tests.queries", () => ({
  useAbTestsDashboard: () => state.query,
}));
vi.mock("./ab-tests.modal", () => ({ ABTestModal: () => null }));
vi.mock("./ab-tests.modal.delete", () => ({ ABTestDeleteModal: () => null }));
vi.mock("./ab-tests.chart", () => ({ ABTestChart: () => null }));
vi.mock("./ab-tests.actions", () => ({ ABTestActions: () => null }));
vi.mock("./ab-tests.card", () => ({ ABTestCard: () => null }));
vi.mock("./ab-tests.panel", () => ({ ABTestPanel: () => null }));

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.query = {
    data: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  };
  state.openModal.mockReset();
  state.permission = "manage";
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
function render() {
  act(() => root.render(<AbTests />));
}

it("shows the shared empty state and opens the existing test creation modal", () => {
  render();
  expect(host.querySelector(".ff-empty-state h2")?.textContent).toBe(
    "Create your first A/B test",
  );
  expect(
    host.querySelector(".ff-empty-state-icon")?.getAttribute("aria-hidden"),
  ).toBe("true");
  const create = Array.from(host.querySelectorAll("button")).find(
    (button) => button.textContent === "Create A/B test",
  )!;
  expect(create.type).toBe("button");
  act(() => create.click());
  expect(state.openModal).toHaveBeenCalledWith(ABTestModal, {});
  const docs = host.querySelector<HTMLAnchorElement>(".ff-empty-state a")!;
  expect(docs.href).toBe(
    "https://docs.solspace.com/craft/freeform/v5/forms/ab-testing/",
  );
  expect(docs.rel).toContain("noopener");
});

it("does not claim there are no tests while the dashboard loads", () => {
  state.query.data = undefined;
  state.query.isPending = true;
  render();
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    "Loading A/B tests…",
  );
  expect(host.querySelector(".ff-empty-state")).toBeNull();
});

it.each(["access", "none"])(
  "keeps onboarding visible without creation controls for %s permission",
  (permission) => {
    state.permission = permission;
    render();
    expect(host.querySelector(".ff-empty-state h2")?.textContent).toBe(
      "No A/B tests yet",
    );
    expect(host.querySelector(".ff-empty-state a")?.textContent).toBe(
      "View documentation",
    );
    expect(host.textContent).not.toContain("Create A/B test");
    expect(host.textContent).not.toContain("Add Test");
  },
);

it("offers retry after a failed load instead of showing first-test onboarding", () => {
  state.query.data = undefined;
  state.query.isError = true;
  render();
  expect(host.querySelector(".ff-empty-state h2")?.textContent).toBe(
    "Unable to load A/B tests",
  );
  const retry = Array.from(host.querySelectorAll("button")).find(
    (button) => button.textContent === "Try again",
  )!;
  act(() => retry.click());
  expect(state.query.refetch).toHaveBeenCalledOnce();
  expect(host.textContent).not.toContain("Create your first A/B test");
});

it("removes onboarding when a subsequent query returns an existing test", () => {
  render();
  state.query.data = [
    {
      id: 1,
      name: "Existing experiment",
      variants: [],
      variantCount: 0,
      days: 2,
      totalImpressions: 0,
      totalInteractions: 0,
      totalFailures: 0,
      totalConversions: 0,
    },
  ];
  render();
  expect(host.querySelector(".ff-empty-state")).toBeNull();
  expect(host.textContent).toContain("Existing experiment");
});
