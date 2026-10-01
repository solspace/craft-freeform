import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { enhanceCraft6Navigation } from "./navigation";
import { enhanceCraft6Shell } from "./shell";

function shell(): void {
  document.body.innerHTML = `
    <div id="global-container">
      <cp-global-sidebar>
        <header class="global-sidebar">
          <div class="global-sidebar__header"><a id="system-info" href="https://site.test">Craft</a></div>
          <craft-nav-list class="global-sidebar__nav"><craft-nav-item><span slot="icon"><svg><path></path></svg></span>Freeform</craft-nav-item></craft-nav-list>
        </header>
      </cp-global-sidebar>
      <div id="page-container">
        <div id="global-header"><div class="flex"><div id="crumbs"><a href="/admin/freeform">Freeform</a></div></div><cp-notification-center></cp-notification-center><button id="user-info">Account</button></div>
        <form id="main-form" method="post">
          <input type="hidden" name="_token" value="csrf">
          <header id="header"><h1>General</h1><div class="buttons"><button type="submit">Save</button></div></header>
          <div id="main-content"><input name="settings[name]" value="Freeform"></div>
        </form>
      </div>
    </div>
    <template id="freeform-shell-indicators"><div data-freeform-shell-indicators><craft-badge>Dev Mode</craft-badge></div></template>`;
}

afterEach(() => {
  document.body.replaceChildren();
  document.body.classList.remove("freeform-cp");
  document.head.querySelector("[data-shell-test-style]")?.remove();
});

describe("Craft 6 Freeform shell", () => {
  it("moves the live header and system link into a single full-width top bar", () => {
    shell();
    const account = document.querySelector("#user-info")!;
    const click = vi.fn();
    account.addEventListener("click", click);
    enhanceCraft6Shell();
    enhanceCraft6Shell();
    expect(document.querySelector("#global-container > :first-child")?.id).toBe(
      "global-header",
    );
    expect(
      document.querySelector("#global-header")?.getAttribute("data-theme"),
    ).toBe("dark");
    expect(
      document.querySelector("#global-header #system-info"),
    ).not.toBeNull();
    expect(
      document.querySelectorAll("[data-freeform-shell-indicators]"),
    ).toHaveLength(1);
    expect(document.querySelector("#user-info")).toBe(account);
    account.dispatchEvent(new Event("click"));
    expect(click).toHaveBeenCalledOnce();
  });

  it("moves save controls to a footer without changing the form or its fields", () => {
    shell();
    const form = document.querySelector<HTMLFormElement>("#main-form")!;
    const button = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )!;
    enhanceCraft6Shell();
    expect(button.form).toBe(form);
    expect(form.querySelector("#footer .buttons button")).toBe(button);
    expect(new FormData(form).get("_token")).toBe("csrf");
    expect(new FormData(form).get("settings[name]")).toBe("Freeform");
  });

  it("uses the native icon wrapper and refreshes its nav row", () => {
    shell();
    const row = document.querySelector("craft-nav-item")!;
    const update = vi.fn();
    Object.assign(row, { requestUpdate: update });
    enhanceCraft6Shell();
    expect(
      row.querySelector('craft-icon[slot="icon"] svg path'),
    ).not.toBeNull();
    expect(row.querySelector('span[slot="icon"]')).toBeNull();
    expect(update).toHaveBeenCalledOnce();
  });

  it("ships styles that hide the cog's accessible text on a legacy CP page", () => {
    shell();
    document.body.classList.add("freeform-cp");
    const row = document.querySelector("craft-nav-item")!;
    row.id = "nav-freeform-link";
    row.insertAdjacentHTML(
      "beforeend",
      '<craft-nav-list slot="subnav"><craft-nav-item href="/admin/freeform/settings">Settings</craft-nav-item></craft-nav-list>',
    );
    enhanceCraft6Navigation();
    const style = document.createElement("style");
    style.setAttribute("data-shell-test-style", "");
    style.textContent = readFileSync(
      resolve(process.cwd(), "../plugin/src/Resources/css/cp/craft6.css"),
      "utf8",
    );
    document.head.append(style);
    const label = document.querySelector(
      "[data-freeform-settings] .cp-visually-hidden",
    )!;
    const computed = getComputedStyle(label);
    expect(computed.position).toBe("absolute");
    expect(computed.width).toBe("1px");
    expect(computed.overflow).toBe("hidden");
    expect(label.textContent).toBe("Settings");
  });
});
