import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { BreadcrumbProvider, useBreadcrumbs } from "./breadcrumbs.context";

vi.mock("./breadcrumbs.site", () => ({ SiteCrumb: (): null => null }));

let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
});

const Screen = () => {
  useBreadcrumbs({ id: "forms", label: "Forms", url: "/forms" });
  return <input aria-label="Field label" defaultValue="Preserved field" />;
};

it.each(["legacy", "beta", "missing"])(
  "keeps the editor mounted with the %s header",
  async (header) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML =
      header === "legacy"
        ? '<div id="crumbs"></div><main></main>'
        : header === "beta"
          ? '<header><div class="cp-header-bar__breadcrumbs"></div></header><main></main>'
          : "<main></main>";
    const mount = document.querySelector("main")!;
    root = createRoot(mount);
    await act(() =>
      root?.render(
        <MemoryRouter>
          <BreadcrumbProvider>
            <Screen />
          </BreadcrumbProvider>
        </MemoryRouter>,
      ),
    );
    expect(mount.querySelector("input")?.value).toBe("Preserved field");
    if (header !== "missing") {
      const link = document.querySelector('nav[aria-label="Breadcrumbs"] a');
      expect(link?.textContent).toBe("Forms");
      expect(link?.getAttribute("href")).toBe("/forms");
    }
  },
);
