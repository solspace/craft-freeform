import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { LimitedUsers } from "./limited-users";

const state = vi.hoisted(() => ({ canConfigure: true, pro: true }));
vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Pro: "pro" },
  default: {
    editions: { isAtLeast: () => state.pro },
    metadata: { craft: { is5: true } },
    permissions: {
      get settings() {
        return state.canConfigure;
      },
    },
  },
}));
vi.mock("./limited-users.queries", () => ({
  useLimitedUsersQuery: () => ({
    data: [] as never[],
    isFetching: false,
    isError: false,
  }),
  useLimitedUsersDeleteMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/hooks/use-sidebar-select", () => ({
  useSidebarSelect: (): void => {},
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: (): null => null,
}));
vi.mock("../settings/settings.sidebar", () => ({
  SettingsSidebar: (): null => null,
}));
vi.mock("@components/empty-block/empty-block", () => ({
  EmptyBlock: (): null => null,
}));
vi.mock("./limited-users.styles", () => ({
  SettingsPage: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.canConfigure = true;
  state.pro = true;
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
  act(() =>
    root.render(
      <MemoryRouter>
        <LimitedUsers />
      </MemoryRouter>,
    ),
  );
}

it("offers profile creation to Pro users with settings permission", () => {
  render();
  expect(host.querySelector(".ff-empty-state a.btn")?.textContent).toBe(
    "Create profile",
  );
  expect(host.textContent).toContain("New Profile");
});

it("keeps the empty state but hides both creation controls without settings permission", () => {
  state.canConfigure = false;
  render();
  expect(host.querySelector(".ff-empty-state h2")?.textContent).toBe(
    "No Limited Users profiles yet",
  );
  expect(host.querySelector("a.btn")).toBeNull();
  expect(host.textContent).not.toContain("New Profile");
  expect(host.textContent).toContain("View documentation");
});

it("does not offer profile creation below Pro even with settings permission", () => {
  state.pro = false;
  render();
  expect(host.querySelector("a.btn")).toBeNull();
  expect(host.querySelector(".ff-empty-state")).toBeNull();
});
