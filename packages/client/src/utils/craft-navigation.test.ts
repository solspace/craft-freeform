import { afterEach, describe, expect, it } from "vitest";
import {
  findFreeformNavLink,
  isPlainNavigation,
  selectFreeformNavLink,
  withCurrentSite,
} from "./craft-navigation";

afterEach(() => document.body.replaceChildren());

describe("Craft 6 Freeform navigation", () => {
  it("preserves the selected site without carrying page-specific parameters", () => {
    expect(withCurrentSite("/forms", "?site=french&source=form%3A42")).toBe(
      "/forms?site=french",
    );
    expect(withCurrentSite("/integrations", "?source=form%3A42")).toBe(
      "/integrations",
    );
  });
  it("finds native nav hosts with a query string and ignores similar paths", () => {
    document.body.innerHTML =
      '<craft-nav-list class="global-sidebar__nav"><craft-nav-item href="/admin/freeform/forms-other">Other</craft-nav-item><craft-nav-item id="forms" href="/admin/freeform/forms/?site=english">Forms</craft-nav-item></craft-nav-list>';
    expect(findFreeformNavLink("/freeform/forms")?.id).toBe("forms");
  });

  it("updates the selected section after React navigation", () => {
    document.body.innerHTML =
      '<craft-nav-item id="nav-freeform-link" active><craft-nav-list slot="subnav"><craft-nav-item id="forms" href="/admin/freeform/forms" active current>Forms</craft-nav-item><craft-nav-item id="integrations" href="/admin/freeform/integrations">Integrations</craft-nav-item></craft-nav-list></craft-nav-item>';
    selectFreeformNavLink("/integrations/single/42");
    expect(document.querySelector("#forms")?.hasAttribute("current")).toBe(
      false,
    );
    expect(document.querySelector("#forms")?.hasAttribute("active")).toBe(
      false,
    );
    expect(
      document.querySelector("#integrations")?.hasAttribute("current"),
    ).toBe(true);
    expect(
      document.querySelector("#nav-freeform-link")?.hasAttribute("active"),
    ).toBe(true);
  });

  it("preserves modifier clicks and already-handled events", () => {
    expect(isPlainNavigation(new MouseEvent("click"))).toBe(true);
    for (const options of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      expect(isPlainNavigation(new MouseEvent("click", options))).toBe(false);
    }
    const prevented = new MouseEvent("click", { cancelable: true });
    prevented.preventDefault();
    expect(isPlainNavigation(prevented)).toBe(false);
  });
});
