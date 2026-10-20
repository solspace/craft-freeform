import type { FormWithStats } from "@ff-client/types/forms";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { ListTable } from "./list.table";

const version = vi.hoisted(() => ({ supported: true }));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Lite: "lite" },
  default: {
    metadata: {
      craft: {
        get is5() {
          return version.supported;
        },
      },
      freeform: { canCreate: true, canDelete: false },
    },
    editions: { isAtLeast: () => false },
  },
}));
vi.mock("../../modals/hooks/use-add-form-modal", () => ({
  useAddFormModal: () => vi.fn(),
}));
vi.mock("../../modals/hooks/use-delete-form-modal", () => ({
  useDeleteFormModal: () => vi.fn(),
}));
vi.mock("../grid/grid.mutations", () => ({
  useArchiveFormMutation: () => ({}),
  useCloneFormMutation: () => ({}),
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ getCurrentHandleWithFallback: () => "default" }),
}));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({}) }));
vi.mock("@ff-client/queries/form-monitor", () => ({
  useFMFormStatsQuery: () => ({}),
}));
vi.mock("../grid/card/card.monitor.stats", () => ({
  FormMonitorStats: () => null,
  getLastTestStatus: () => null,
}));
vi.mock("recharts", () => ({
  ResponsiveContainer: () => null,
  AreaChart: ({ children }: { children: ReactNode }) => children,
  Area: () => null,
}));
let root: Root;
let host: HTMLDivElement;
function render(forms?: FormWithStats[], loading = false) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <MemoryRouter>
        <ListTable forms={forms} isFetching={loading} />
      </MemoryRouter>,
    ),
  );
}
const form = (withIcon = true, monitoring = false) =>
  ({
    id: 1,
    name: "Contact",
    handle: "contact",
    description: "Contact form",
    settings: { general: { color: "#4385b7" } },
    dateArchived: null,
    links: [],
    chartData: [],
    formMonitor: { enabled: monitoring },
    iconSvg: withIcon
      ? '<svg viewBox="0 0 10 10"><path d="M0 0h10v10Z"/></svg>'
      : null,
  }) as unknown as FormWithStats;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  version.supported = true;
  vi.unstubAllGlobals();
});
it("puts a colored icon first, with no visible heading", () => {
  render([form()]);
  const heading = host.querySelector("th")!;
  expect(heading.textContent).toBe("");
  expect(heading.getAttribute("aria-label")).toBe("Form Icon");
  const row = host.querySelector("tbody tr")!;
  expect(row.children).toHaveLength(8);
  expect(row.children[0].querySelector("svg")).not.toBeNull();
  expect((row.children[0].firstElementChild as HTMLElement).style.color).toBe(
    "rgb(67, 133, 183)",
  );
  expect(row.children[1].textContent).toBe("Contact");
  expect(row.children[3].className).toBe("form-description");
});
it("keeps an empty icon cell when a form has no icon", () => {
  render([form(false)]);
  expect(host.querySelector("tbody tr")!.children[0].children).toHaveLength(0);
  expect(host.querySelector("tbody tr")!.children[1].textContent).toBe(
    "Contact",
  );
});
it("keeps monitoring columns aligned", () => {
  render([form(true, true)]);
  expect(host.querySelectorAll("th")).toHaveLength(10);
  expect(host.querySelector("tbody tr")!.children).toHaveLength(10);
});
it("includes the icon column in loading and empty states", () => {
  render(undefined, true);
  expect(host.querySelector("tbody tr")!.children).toHaveLength(8);
  act(() =>
    root.render(
      <MemoryRouter>
        <ListTable forms={[]} />
      </MemoryRouter>,
    ),
  );
  expect(host.querySelector("tbody td")!.getAttribute("colspan")).toBe("8");
});
it("omits the column entirely on Craft 4", () => {
  version.supported = false;
  render([form()]);
  expect(host.querySelectorAll("th")).toHaveLength(7);
  expect(host.querySelector("th")!.textContent).toBe("Name");
  expect(host.querySelector("tbody tr")!.children).toHaveLength(7);
  expect(host.querySelector(".form-icon-column")).toBeNull();
  act(() =>
    root.render(
      <MemoryRouter>
        <ListTable forms={[]} />
      </MemoryRouter>,
    ),
  );
  expect(host.querySelector("tbody td")!.getAttribute("colspan")).toBe("7");
});
