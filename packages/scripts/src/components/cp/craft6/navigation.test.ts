import { afterEach, describe, expect, it } from "vitest";
import { enhanceCraft6Navigation } from "./navigation";

function sidebar(settings = true): HTMLElement {
  document.body.innerHTML = `
    <craft-nav-list class="global-sidebar__nav">
      <craft-nav-item id="nav-users-link" href="/admin/users">
        Users<craft-nav-list slot="subnav"><craft-nav-item href="/admin/users/all">All Users</craft-nav-item></craft-nav-list>
      </craft-nav-item>
      <craft-nav-item id="nav-freeform-link" href="/admin/freeform" active>
        <span slot="icon"><svg></svg></span>Freeform
        <craft-nav-list slot="subnav">
          <craft-nav-item href="/admin/freeform/forms"><span slot="icon"><span class="nav-indicator"></span></span>Forms</craft-nav-item>
          ${settings ? '<craft-nav-item href="/admin/freeform/settings"><span slot="icon"><span class="nav-indicator"></span></span>Einstellungen</craft-nav-item>' : ""}
        </craft-nav-list>
      </craft-nav-item>
    </craft-nav-list>`;
  return document.querySelector("#nav-freeform-link") as HTMLElement;
}

afterEach(() => document.body.replaceChildren());

describe("Craft 6 legacy CP navigation", () => {
  it("keeps the current section inline and puts other pages in native flyouts", () => {
    const freeform = sidebar();
    enhanceCraft6Navigation();
    expect(freeform.hasAttribute("subnav-display")).toBe(false);
    expect(
      document.querySelector("#nav-users-link")?.getAttribute("subnav-display"),
    ).toBe("flyout");
    // No explicit inline override: icon-only mode can still use its own flyout.
    freeform.setAttribute("icon-only", "");
    expect(freeform.hasAttribute("subnav-display")).toBe(false);
    expect(freeform.querySelector(".nav-indicator")).toBeNull();
    expect(freeform.querySelector(':scope > [slot="icon"] svg')).not.toBeNull();
  });

  it("adds one accessible settings cog using the permitted translated link", () => {
    const freeform = sidebar();
    enhanceCraft6Navigation();
    enhanceCraft6Navigation();
    const actions = freeform.querySelectorAll("[data-freeform-settings]");
    expect(actions).toHaveLength(1);
    const action = actions[0];
    expect(action.getAttribute("slot")).toBe("actions");
    expect(action.getAttribute("icon")).toBe("gear");
    expect(action.getAttribute("href")).toBe("/admin/freeform/settings");
    expect(action.getAttribute("aria-label")).toBe("Einstellungen");
  });

  it("omits the cog when the settings permission removed the link", () => {
    const freeform = sidebar(false);
    enhanceCraft6Navigation();
    expect(freeform.querySelector('[slot="actions"]')).toBeNull();
  });
});
