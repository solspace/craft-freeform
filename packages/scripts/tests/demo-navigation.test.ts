import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync(
  resolve(__dirname, "../../plugin/src/codepack/assets/js/demo.js"),
  "utf8",
);
const dropdown = (label: string, items: string) => `
  <div class="freeform-nav-dropdown" data-dropdown-label="${label}">
    <button type="button" class="freeform-nav-button">Choose ${label}</button>
    <div class="freeform-nav-dropdown-content">${items}</div>
  </div>`;
const key = (element: Element, name: string) =>
  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: name,
      bubbles: true,
      cancelable: true,
    }),
  );

function setup(popover = false) {
  document.body.innerHTML =
    dropdown(
      "Forms",
      `
    <a href="#quote" aria-current="page">Home Insurance Quote</a><hr>
    <a href="#contact">Contact</a><a href="#cafe">Café registration</a>
  `,
    ) +
    dropdown("Formatting templates", `<a href="#basic">Basic Dark</a>`) +
    `<button id="outside">Outside</button>`;
  if (popover) {
    document
      .querySelectorAll<HTMLElement>(".freeform-nav-dropdown-content")
      .forEach((panel) => {
        Object.assign(panel, { showPopover: vi.fn(), hidePopover: vi.fn() });
      });
  }
  // Execute the exact standalone asset shipped with the demo templates.
  // biome-ignore lint/security/noGlobalEval: this is trusted repository source in a DOM test.
  window.eval(source);
  const button = document.querySelector<HTMLButtonElement>(
    ".freeform-nav-button",
  )!;
  const panel = document.querySelector<HTMLElement>(
    ".freeform-nav-dropdown-content",
  )!;
  const search = panel.querySelector<HTMLInputElement>("input")!;
  const links = [...panel.querySelectorAll<HTMLAnchorElement>("a")];
  return { button, panel, search, links };
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  document
    .querySelectorAll<HTMLButtonElement>('[aria-expanded="true"]')
    .forEach((button) => {
      button.click();
    });
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("demo navigation", () => {
  it("opens the mobile menu, closes with Escape, and restores toggle focus", () => {
    document.body.innerHTML = `<header data-demo-navigation>
      <div class="freeform-nav-main">
        <button data-demo-menu-toggle aria-expanded="false" aria-controls="sections">Menu</button>
        <nav id="sections"><a href="#forms">Forms</a><a href="#submissions">Submissions</a></nav>
      </div>
      <button id="context">Choose a form</button>
    </header>`;
    // biome-ignore lint/security/noGlobalEval: execute the trusted standalone navigation asset.
    window.eval(source);
    const header = document.querySelector<HTMLElement>("header")!;
    const toggle = document.querySelector<HTMLButtonElement>(
      "[data-demo-menu-toggle]",
    )!;
    const link = document.querySelector("a")!;
    toggle.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(header.hasAttribute("data-menu-open")).toBe(true);
    link.focus();
    key(link, "Escape");
    expect(header.hasAttribute("data-menu-open")).toBe(false);
    expect(document.activeElement).toBe(toggle);
    toggle.click();
    document.querySelector<HTMLButtonElement>("#context")!.focus();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.click();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(header.hasAttribute("data-menu-open")).toBe(false);
  });

  it.each([false, true])(
    "opens on click, focuses search and supports popover=%s",
    (popover) => {
      const { button, panel, search } = setup(popover);
      button.click();
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(button.getAttribute("aria-controls")).toBe(panel.id);
      expect(document.activeElement).toBe(search);
      expect(
        panel.style.getPropertyValue("--freeform-dropdown-available-height"),
      ).not.toBe("");
      if (popover) expect(panel.showPopover).toHaveBeenCalledOnce();
      key(search, "Escape");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(button);
      if (popover) expect(panel.hidePopover).toHaveBeenCalledOnce();
    },
  );

  it("filters by every word, ignores accents/case and announces empty results", () => {
    const { button, panel, search, links } = setup();
    button.click();
    search.value = "QUOTE home";
    search.dispatchEvent(new Event("input"));
    expect(links.map((link) => link.hidden)).toEqual([false, true, true]);
    expect(panel.querySelector("hr")!.hidden).toBe(true);
    search.value = "CAFE";
    search.dispatchEvent(new Event("input"));
    expect(links.map((link) => link.hidden)).toEqual([true, true, false]);
    search.value = "no such form";
    search.dispatchEvent(new Event("input"));
    expect(
      panel.querySelector<HTMLElement>(".freeform-nav-empty")!.hidden,
    ).toBe(false);
    expect(panel.querySelector('[role="status"]')!.textContent).toBe(
      "0 of 3 forms",
    );
    key(search, "ArrowDown"); // Empty results must not break keyboard navigation.
    search.value = "";
    search.dispatchEvent(new Event("input"));
    expect(links.every((link) => !link.hidden)).toBe(true);
    expect(panel.querySelector("hr")!.hidden).toBe(false);
  });

  it("moves through filtered links with arrows, Home and End", () => {
    const { button, search, links } = setup();
    key(button, "ArrowDown");
    expect(document.activeElement).toBe(links[0]);
    key(links[0], "End");
    expect(document.activeElement).toBe(links[2]);
    key(links[2], "ArrowDown");
    expect(document.activeElement).toBe(links[0]);
    key(links[0], "ArrowUp");
    expect(document.activeElement).toBe(links[2]);
    key(links[2], "Home");
    expect(document.activeElement).toBe(links[0]);
    search.focus();
    search.value = "contact";
    search.dispatchEvent(new Event("input"));
    key(search, "ArrowDown");
    expect(document.activeElement).toBe(links[1]);
  });

  it("opens only one dropdown and closes on outside pointer or focus leaving", async () => {
    const { button } = setup();
    button.click();
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      ".freeform-nav-button",
    );
    buttons[1].click();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(buttons[1].getAttribute("aria-expanded")).toBe("true");
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(buttons[1].getAttribute("aria-expanded")).toBe("false");
    button.click();
    document.querySelector<HTMLButtonElement>("#outside")!.focus();
    await Promise.resolve();
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it.each([false, true])(
    "preserves native link activation with popover=%s and resets search on reopening",
    async (popover) => {
      const { button, panel, search, links } = setup(popover);
      button.click();
      search.value = "Contact";
      search.dispatchEvent(new Event("input"));
      // Native focusout can run while activeElement is temporarily BODY,
      // before the link receives focus and the pointer click is dispatched.
      search.blur();
      search.dispatchEvent(
        new FocusEvent("focusout", {
          bubbles: true,
          relatedTarget: links[1],
        }),
      );
      await Promise.resolve();
      expect(button.getAttribute("aria-expanded")).toBe("true");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      links[1].dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(links[1].hidden).toBe(false);
      if (popover) expect(panel.hidePopover).not.toHaveBeenCalled();
      button.click();
      button.click();
      expect(search.value).toBe("");
      expect(links.every((link) => !link.hidden)).toBe(true);
    },
  );

  it("clamps a dropdown at the right edge and opens upwards near the bottom", () => {
    const { button, panel } = setup();
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      left: 1000,
      top: 700,
      right: 1100,
      bottom: 730,
      width: 100,
      height: 30,
    } as DOMRect);
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
      width: 300,
      height: 300,
    } as DOMRect);
    button.click();
    expect(Number.parseFloat(panel.style.left)).toBe(window.innerWidth - 308);
    expect(panel.style.top).toBe("394px");
    expect(
      panel.style.getPropertyValue("--freeform-dropdown-available-height"),
    ).toBe("686px");
  });
});

describe("demo preview preference", () => {
  const storageKey = "freeform-demo-preview-template";
  const preview = (template = "basic-light", implicit = true) => {
    document.body.innerHTML = `<header data-demo-preview="${template}" data-demo-forms-url="https://example.test/qa/demo/forms" ${implicit ? "data-demo-preview-implicit" : ""}>
      ${["basic-light", "basic-dark", "default"].map((choice) => `<a class="freeform-nav-template-option" href="https://example.test/qa/demo/forms/${choice}/contact/edit/token">${choice}</a>`).join("")}
    </header>`;
    const location = {
      href: "https://example.test/qa/demo/forms?search=contact#forms",
      search: "?search=contact",
      hash: "#forms",
      replace: vi.fn(),
    };
    // Inject only the navigation boundary; execute the unchanged shipped asset.
    new Function("window", source)({ location });
    return location.replace;
  };

  beforeEach(() => localStorage.clear());

  it("starts with Basic Light, including when storage is unavailable", () => {
    expect(preview()).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe("basic-light");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    expect(preview()).not.toHaveBeenCalled();
  });

  it("restores a saved template only on the implicit overview and preserves query/hash", () => {
    localStorage.setItem(storageKey, "basic-dark");
    expect(preview()).toHaveBeenCalledWith(
      "https://example.test/qa/demo/forms/basic-dark?search=contact#forms",
    );
    expect(preview("default", false)).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe("default");
    expect(preview()).toHaveBeenCalledWith(
      "https://example.test/qa/demo/forms/default?search=contact#forms",
    );
  });

  it("does not redirect for the current template or unrecognized stored values", () => {
    localStorage.setItem(storageKey, "basic-light");
    expect(preview()).not.toHaveBeenCalled();
    localStorage.setItem(storageKey, "https://untrusted.test");
    expect(preview()).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe("basic-light");
  });
});
