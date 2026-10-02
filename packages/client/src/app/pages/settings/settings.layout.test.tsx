import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SettingsLayout } from "./settings.layout";

vi.mock("./settings.sidebar", () => ({
  SettingsSidebar: () => <aside id="sidebar-container">Settings</aside>,
}));

it("keeps Save outside the content and restores Craft's notice on route unmount", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const page = document.createElement("div");
  const app = document.createElement("div");
  const notice = document.createElement("footer");
  notice.id = "global-footer";
  notice.innerHTML = '<a href="/upgrade">Buy now</a>';
  page.append(app, notice);
  document.body.append(page);
  const root = createRoot(app);
  const save = vi.fn();
  try {
    await act(() =>
      root.render(
        <SettingsLayout
          activeKey="limited-users"
          header={<header id="header-container">Limited Users</header>}
          footer={
            <button type="button" onClick={save}>
              Save
            </button>
          }
        >
          <input name="profile-name" defaultValue="Editors" />
        </SettingsLayout>,
      ),
    );
    expect(app.querySelector(".freeform-footer-notices #global-footer")).toBe(
      notice,
    );
    const button = app.querySelector<HTMLButtonElement>(
      ".freeform-secondary-layout > .freeform-form-footer button",
    )!;
    expect(app.querySelector("#content button")).toBeNull();
    await act(() => button.click());
    expect(save).toHaveBeenCalledOnce();
    await act(() => root.unmount());
    expect(page.lastElementChild).toBe(notice);
    expect(notice.querySelector("a")?.getAttribute("href")).toBe("/upgrade");
  } finally {
    page.remove();
  }
});
