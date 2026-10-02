import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsSidebar } from "./settings.sidebar";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      general: { title: "General Settings" },
      "limited-users": { title: "Limited Users" },
      ai: { title: "SolspaceAI" },
      logs: { heading: "Logs" },
      errors: {
        title:
          'Errors <span class="badge">2</span><img src="x" onerror="alert(1)">',
      },
    },
    isFetching: false,
  }),
}));
vi.mock("@ff-client/utils/urls", () => ({
  generateUrl: (path: string) => `/admin/freeform/${path}`,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let root: Root;
let container: HTMLDivElement;
const Location = () => <output>{useLocation().pathname}</output>;

beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root.render(
      <MemoryRouter initialEntries={["/settings/limited-users"]}>
        <SettingsSidebar activeKey="limited-users" />
        <Location />
      </MemoryRouter>,
    ),
  );
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const item = (key: string) =>
  container.querySelector<HTMLElement>(
    `craft-nav-item[href="/admin/freeform/settings/${key}"]`,
  )!;

describe("native settings secondary navigation", () => {
  it("uses Craft components, marks the selected item, and preserves safe badges and headings", () => {
    expect(
      container.querySelector(".freeform-secondary-nav craft-nav-list"),
    ).not.toBeNull();
    expect(item("limited-users").hasAttribute("active")).toBe(true);
    expect(item("limited-users").hasAttribute("current")).toBe(true);
    expect(item("general").hasAttribute("active")).toBe(false);
    expect(container.querySelector("craft-nav-item[group]")?.textContent).toBe(
      "Logs",
    );
    expect(item("errors").querySelector(".badge")?.textContent).toBe("2");
    expect(item("errors").querySelector("[onerror]")).toBeNull();
    expect(container.querySelector("a.sel")).toBeNull();
  });
  it("keeps React settings links on the client router", async () => {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    await act(() => item("ai").dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(container.querySelector("output")?.textContent).toBe("/settings/ai");
  });
  it("leaves modified clicks and Twig page links to the browser", async () => {
    const modified = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    const twig = new MouseEvent("click", { bubbles: true, cancelable: true });
    await act(() => {
      item("ai").dispatchEvent(modified);
      item("general").dispatchEvent(twig);
    });
    expect(modified.defaultPrevented).toBe(false);
    expect(twig.defaultPrevented).toBe(false);
    expect(container.querySelector("output")?.textContent).toBe(
      "/settings/limited-users",
    );
  });
});
