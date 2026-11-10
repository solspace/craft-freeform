import { Edition } from "@config/freeform/freeform.config";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeContent } from "./welcome";
import { setupOptions } from "./welcome.setup.test-fixtures";

vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express", Lite: "lite", Pro: "pro" },
  default: { editions: { edition: "pro" } },
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@ff-client/utils/urls", () => ({ generateUrl: (url: string) => url }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? key),
}));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const render = (edition: Edition) =>
  act(() =>
    root.render(
      <MemoryRouter>
        <WelcomeContent
          canUseSetupGuide
          edition={edition}
          settingsUrl="/admin/freeform/settings"
          demosUrl="/admin/freeform/settings/demo-templates"
        />
      </MemoryRouter>,
    ),
  );

describe("Welcome page", () => {
  it("links Configure Freeform directly to settings when setup access is unavailable", async () => {
    const load = vi.fn();
    await act(async () =>
      root.render(
        <MemoryRouter>
          <WelcomeContent
            edition={Edition.Pro}
            settingsUrl="/admin/freeform/settings"
            demosUrl="/demos"
            canUseSetupGuide={false}
            setupApi={{ load, save: vi.fn() }}
          />
        </MemoryRouter>,
      ),
    );
    const link = Array.from(
      host.querySelectorAll<HTMLAnchorElement>("a.welcome-resource"),
    ).find((link) => link.textContent?.includes("Configure Freeform"));
    expect(link?.getAttribute("href")).toBe("/admin/freeform/settings");
    expect(host.querySelector("button.welcome-setup-trigger")).toBeNull();
    expect(host.querySelector(".setup-guide")).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });
  it.each([Edition.Express, Edition.Lite, Edition.Pro])(
    "shows the installed %s edition without assuming Express",
    (edition) => {
      render(edition);
      const expected = {
        [Edition.Express]: "Express",
        [Edition.Lite]: "Lite",
        [Edition.Pro]: "Pro",
      }[edition];
      expect(host.querySelector("h1")?.textContent).toBe(
        "Ready for your first form.",
      );
      const footer = host.querySelectorAll(".welcome-resource-description")[3]
        ?.textContent;
      expect(footer).toContain(
        edition === Edition.Pro
          ? `See what’s included in Freeform ${expected}.`
          : "See what Pro adds to your forms.",
      );
      expect(
        host.querySelector("button.welcome-compare-trigger")?.textContent,
      ).toContain(
        edition === Edition.Pro ? "Compare editions" : "Explore Freeform Pro",
      );
      expect(
        host.querySelector("thead .edition-current-column .edition-name")
          ?.textContent,
      ).toBe(expected);
    },
  );

  it("keeps one primary Forms action and preserves the settings and demo destinations", () => {
    render(Edition.Pro);
    const primary = host.querySelectorAll("a.btn.submit");
    expect(primary).toHaveLength(1);
    expect(primary[0].getAttribute("href")).toBe("/forms");
    expect(
      [...host.querySelectorAll(".welcome-resource")].map((link) =>
        link.getAttribute("href"),
      ),
    ).toEqual([
      "/admin/freeform/settings/demo-templates",
      null,
      "https://docs.solspace.com/craft/freeform/v5/guides/getting-started/",
      null,
    ]);
    expect(host.querySelector("form")).toBeNull();
  });

  it("keeps the setup face visible until returning to Settings", async () => {
    const exit = vi.fn();
    await act(async () =>
      root.render(
        <MemoryRouter>
          <WelcomeContent
            edition={Edition.Pro}
            settingsUrl="/settings"
            demosUrl="/demos"
            canUseSetupGuide
            initialView="setup"
            onWelcome={exit}
            setupBackLabel="Back to settings"
            setupApi={{ load: async () => setupOptions, save: vi.fn() }}
          />
        </MemoryRouter>,
      ),
    );
    expect(host.querySelector(".edition-toolbar")?.textContent).not.toContain(
      "All settings",
    );
    await act(async () =>
      host.querySelector<HTMLButtonElement>(".edition-back")!.click(),
    );
    expect(exit).toHaveBeenCalledOnce();
    expect(
      host.querySelector(".welcome-home")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });
  it("uses direct links without nested interactive controls", () => {
    render(Edition.Express);
    expect(host.querySelectorAll("a a, a button, button a")).toHaveLength(0);
    for (const link of host.querySelectorAll('a[target="_blank"]'))
      expect(link.getAttribute("rel")).toContain("noreferrer");
    expect(
      host.querySelector(".welcome-wordmark")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });
  it("opens the comparison inside Welcome and restores focus when closed", async () => {
    render(Edition.Lite);
    const button = host.querySelector<HTMLButtonElement>(
      "button.welcome-compare-trigger",
    )!;
    const panel = host.querySelector(".welcome-comparison-view")!;
    const home = host.querySelector(".welcome-home")!;
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(panel.hasAttribute("inert")).toBe(true);
    act(() => button.click());
    await act(() => new Promise(requestAnimationFrame));
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    expect(home.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(
      host.querySelector("#edition-comparison-title"),
    );
    act(() => host.querySelector<HTMLButtonElement>(".edition-back")!.click());
    await act(() => new Promise(requestAnimationFrame));
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(home.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(button);
    act(() => button.click());
    act(() =>
      panel.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    await act(() => new Promise(requestAnimationFrame));
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("shows the documented form limits and Pro-only features", () => {
    render(Edition.Express);
    const rows = [...host.querySelectorAll(".edition-table tbody tr")];
    const cells = (label: string) => [
      ...rows
        .find((row) => row.querySelector("th")?.textContent === label)!
        .querySelectorAll("td"),
    ];
    expect(cells("Forms").map((cell) => cell.textContent)).toEqual([
      "1",
      "Unlimited",
      "Unlimited",
    ]);
    expect(cells("Fields per form").map((cell) => cell.textContent)).toEqual([
      "20",
      "Unlimited",
      "Unlimited",
    ]);
    expect(
      cells("Multi-page forms").map((cell) =>
        cell.querySelector("[role=img]")?.getAttribute("aria-label"),
      ),
    ).toEqual(["Not included", "Included", "Included"]);
    expect(
      cells("Conditional rules and Save & Continue").map((cell) =>
        cell.querySelector("[role=img]")?.getAttribute("aria-label"),
      ),
    ).toEqual(["Not included", "Not included", "Included"]);
    expect(host.querySelectorAll(".edition-price")).toHaveLength(3);
    expect(host.querySelector(".welcome-home")?.textContent).not.toContain(
      "A few good places to start",
    );
  });
});
