import { afterEach, describe, expect, it } from "vitest";
import { initToolbarEditors, moveToolbarItem, parseToolbar } from "./toolbar";

const mount = (value: string, disabled = false) => {
  document.body.innerHTML = `<form><div data-toolbar-editor><div class="field"><div class="heading"><label>Toolbar</label></div><div class="instructions"><p>Configure the toolbar.</p></div><div class="input"><input type="text" name="toolbar" ${disabled ? "disabled" : ""}></div><p id="toolbar-tip">This can begin with an environment variable.</p></div></div></form>`;
  document.querySelector<HTMLInputElement>("input")!.value = value;
  initToolbarEditors();
  return document.querySelector<HTMLInputElement>("input")!;
};
const submitted = () =>
  new FormData(document.querySelector("form")!).get("toolbar");
afterEach(() => {
  document.body.innerHTML = "";
});

describe("toolbar configuration compatibility", () => {
  it("edits Craft 6's named combobox without moving its textbox or losing its form value", () => {
    if (!customElements.get("craft-combobox")) {
      customElements.define(
        "craft-combobox",
        class extends HTMLElement {
          get value() {
            return this.querySelector<HTMLInputElement>('input[type="hidden"]')!
              .value;
          }
          set value(value: string) {
            this.querySelector<HTMLInputElement>(
              'input[type="hidden"]',
            )!.value = value;
          }
          get disabled() {
            return this.hasAttribute("disabled");
          }
        },
      );
    }
    document.body.innerHTML = `<form><div data-toolbar-editor><craft-field class="field"><craft-combobox slot="input"><input role="combobox"><input type="hidden" name="toolbar" value="bold | italic"></craft-combobox><div slot="help-text"><p>Configure the toolbar.</p></div><span slot="tip">Environment variable hint</span></craft-field></div></form>`;
    const combobox = document.querySelector<HTMLElement>("craft-combobox")!;
    const textbox = combobox.querySelector("input")!;
    initToolbarEditors();
    expect(combobox.parentElement?.tagName).toBe("CRAFT-FIELD");
    expect(textbox.parentElement).toBe(combobox);
    expect(combobox.hidden).toBe(true);
    expect(
      document.querySelector('[slot="help-text"] [data-toolbar-toggle]'),
    ).not.toBeNull();
    expect(submitted()).toBe("bold | italic");
    document
      .querySelector<HTMLButtonElement>('[aria-label="Remove Italic"]')!
      .click();
    expect(submitted()).toBe("bold |");
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(combobox.hidden).toBe(false);
    const hidden = combobox.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    )!;
    hidden.value = "$TOOLBAR";
    combobox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      document.querySelector<HTMLElement>(".ff-toolbar-visual")!.hidden,
    ).toBe(true);
    expect(submitted()).toBe("$TOOLBAR");
    initToolbarEditors();
    expect(document.querySelectorAll(".ff-toolbar-editor")).toHaveLength(1);
  });

  it("keeps the mode switch in the instructions and leaves no footer in the preview", () => {
    mount("bold italic");
    const toggle = document.querySelector<HTMLButtonElement>(
      "[data-toolbar-toggle]",
    )!;
    expect(toggle.closest(".instructions")).toBe(
      document.querySelector(".field > .instructions"),
    );
    expect(document.querySelector(".ff-toolbar-editor")!.contains(toggle)).toBe(
      false,
    );
    expect(document.querySelector(".ff-toolbar-actions")).toBeNull();
    toggle.click();
    expect(toggle.textContent).toBe("Visual editor");
    expect(
      document.querySelector<HTMLElement>(".ff-toolbar-visual")!.hidden,
    ).toBe(true);
  });

  it("shows the environment-variable hint only while editing the raw value", () => {
    mount("bold italic");
    const tip = document.querySelector<HTMLElement>("#toolbar-tip")!;
    expect(tip.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(tip.hidden).toBe(false);
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(tip.hidden).toBe(true);
  });

  it("keeps the same named input and exact value when switching to raw and back", () => {
    const input = mount("  bold  | italic ");
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(document.activeElement).toBe(input);
    expect(submitted()).toBe("  bold  | italic ");
    input.value = "underline  bold";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(document.querySelector('input[name="toolbar"]')).toBe(input);
    expect(submitted()).toBe("underline  bold");
    expect(document.querySelectorAll(".ff-toolbar-chip")).toHaveLength(2);
  });

  it("uses TinyMCE SVGs in the toolbar and picker while keeping custom names as text", () => {
    mount("bold customButton");
    expect(
      document.querySelector(
        '[data-command="bold"] .ff-toolbar-chip-symbol svg',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '[data-toolbar-option="italic"] .ff-toolbar-choice-icon svg',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '[data-command="customButton"] .ff-toolbar-chip-symbol',
      )?.textContent,
    ).toBe("customButton");
  });

  it.each([
    ["bold italic underline", "Italic", "bold underline"],
    ["bold italic underline", "Underline", "bold italic"],
    ["bold", "Bold", ""],
  ])(
    "closes the deleted slot in %s without expanding a neighbor",
    (value, label, expected) => {
      mount(value);
      document
        .querySelector<HTMLButtonElement>(`[aria-label="Remove ${label}"]`)!
        .dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: 100,
            clientY: 100,
          }),
        );
      expect(submitted()).toBe(expected);
      expect(document.activeElement).toBe(
        document.querySelector("[data-toolbar-add]"),
      );
      const items = document.querySelector<HTMLElement>(".ff-toolbar-items")!;
      expect(items.dataset.previewPaused).toBe("true");
      items.dispatchEvent(
        new MouseEvent("pointermove", { clientX: 100, clientY: 100 }),
      );
      expect(items.dataset.previewPaused).toBe("true");
      items.dispatchEvent(
        new MouseEvent("pointermove", { clientX: 110, clientY: 100 }),
      );
      expect(items.dataset.previewPaused).toBeUndefined();
    },
  );

  it("restores keyboard preview behavior when returning to the toolbar after removal", () => {
    mount("bold italic");
    document
      .querySelector<HTMLButtonElement>('[aria-label="Remove Italic"]')!
      .click();
    document.querySelector<HTMLButtonElement>("[data-toolbar-handle]")!.focus();
    expect(
      document.querySelector<HTMLElement>(".ff-toolbar-items")!.dataset
        .previewPaused,
    ).toBeUndefined();
  });

  it("keeps Divider first and available after adding multiple dividers", () => {
    mount("bold | italic");
    for (let count = 0; count < 2; count++) {
      const menu = document.querySelector<HTMLElement>("[role=menu]")!;
      const add =
        document.querySelector<HTMLButtonElement>("[data-toolbar-add]")!;
      expect(add.textContent).toBe("Add…");
      expect(menu.firstElementChild?.getAttribute("aria-label")).toBe(
        "Divider",
      );
      add.click();
      document
        .querySelector<HTMLButtonElement>('[data-toolbar-option="|"]')!
        .click();
    }
    expect(submitted()).toBe("bold | italic | |");
    expect(document.querySelector('[data-toolbar-option="|"]')).not.toBeNull();
  });

  it("previews only available buttons and supports keyboard dismissal and selection", () => {
    mount("bold | italic");
    const add =
      document.querySelector<HTMLButtonElement>("[data-toolbar-add]")!;
    const menu = document.querySelector<HTMLElement>("[role=menu]")!;
    expect(document.querySelector('[data-toolbar-option="bold"]')).toBeNull();
    expect(document.querySelector('[data-toolbar-option="italic"]')).toBeNull();
    const underline = document.querySelector<HTMLButtonElement>(
      '[data-toolbar-option="underline"]',
    )!;
    expect(underline.querySelector(".ff-toolbar-choice-icon")).not.toBeNull();
    expect(
      underline.querySelector('[data-example="underline"]')?.textContent,
    ).toBe("Underline");
    add.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(menu.hidden).toBe(false);
    expect(document.activeElement).toBe(menu.querySelector("button"));
    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    expect(document.activeElement).toBe(menu.lastElementChild);
    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(add);
    expect(submitted()).toBe("bold | italic");
    add.click();
    underline.click();
    expect(submitted()).toBe("bold | italic underline");
    expect(menu.hidden).toBe(true);
    expect(
      document.querySelector('[data-toolbar-option="underline"]'),
    ).toBeNull();
    document
      .querySelector<HTMLButtonElement>('[aria-label="Remove Underline"]')!
      .click();
    expect(
      document.querySelector('[data-toolbar-option="underline"]'),
    ).not.toBeNull();
  });

  it("uses the configured toolbar as its only preview without changing the saved value", () => {
    mount("bold | numlist table");
    expect(document.querySelector(".ff-toolbar-preview")).toBeNull();
    expect(document.querySelectorAll(".ff-toolbar-chip")).toHaveLength(4);
    expect(document.querySelector('[data-example="bold"]')?.textContent).toBe(
      "Bold",
    );
    expect(
      document.querySelector('[data-example="numlist"]')?.textContent,
    ).toBe("Numbered list");
    expect(
      document.querySelector(
        '[data-command="bold"] .ff-toolbar-handle .ff-toolbar-example',
      ),
    ).not.toBeNull();
    const handle = document.querySelector<HTMLButtonElement>(
      "[data-toolbar-handle]",
    )!;
    handle.focus();
    handle.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(
      handle.closest<HTMLElement>(".ff-toolbar-chip")!.dataset.previewDismissed,
    ).toBe("true");
    expect(submitted()).toBe("bold | numlist table");
  });
  it("leaves the exact original value, including whitespace and unknown commands, untouched on load", () => {
    const original = "  blocks  customCommand | bold   italic  ";
    mount(original);
    expect(submitted()).toBe(original);
    expect(
      document.querySelector('[data-command="customCommand"]'),
    ).not.toBeNull();
    expect(document.querySelectorAll('input[name="toolbar"]')).toHaveLength(1);
    initToolbarEditors();
    expect(document.querySelectorAll(".ff-toolbar-editor")).toHaveLength(1);
  });

  it.each(["$EDITOR_TOOLBAR", "bold || italic", "mygroup: { bold italic }"])(
    "preserves %s in the raw editor",
    (value) => {
      mount(value);
      expect(submitted()).toBe(value);
      expect(
        document
          .querySelector<HTMLElement>(".input")!
          .classList.contains("hidden"),
      ).toBe(false);
      expect(
        document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!
          .disabled,
      ).toBe(true);
      expect(
        document.querySelector<HTMLElement>(".ff-toolbar-visual")!.hidden,
      ).toBe(true);
    },
  );

  it("reorders with the keyboard without dropping unknown buttons or separators", () => {
    mount("bold customButton | italic");
    document
      .querySelectorAll<HTMLButtonElement>("[data-toolbar-handle]")[1]
      .dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowLeft",
          altKey: true,
          bubbles: true,
        }),
      );
    expect(submitted()).toBe("customButton bold | italic");
    expect(document.activeElement?.getAttribute("aria-label")).toContain(
      "customButton",
    );
  });

  it("reorders dragged buttons and ignores drops from outside this toolbar", () => {
    mount("bold italic underline");
    const chips = document.querySelectorAll(".ff-toolbar-chip");
    chips[0].dispatchEvent(
      new Event("drop", { bubbles: true, cancelable: true }),
    );
    expect(submitted()).toBe("bold italic underline");
    chips[0].dispatchEvent(new Event("dragstart", { bubbles: true }));
    chips[2].dispatchEvent(
      new Event("drop", { bubbles: true, cancelable: true }),
    );
    expect(submitted()).toBe("italic underline bold");
  });

  it("adds and removes only the selected button, including duplicate legacy tokens", () => {
    mount("bold bold");
    document
      .querySelector<HTMLButtonElement>('[aria-label="Remove Bold"]')!
      .click();
    expect(submitted()).toBe("bold");
    document.querySelector<HTMLButtonElement>("[data-toolbar-add]")!.click();
    document
      .querySelector<HTMLButtonElement>('[data-toolbar-option="italic"]')!
      .click();
    expect(submitted()).toBe("bold italic");
    document.querySelector<HTMLButtonElement>("[data-toolbar-add]")!.click();
    document
      .querySelector<HTMLButtonElement>('[data-toolbar-option="|"]')!
      .click();
    expect(submitted()).toBe("bold italic |");
  });

  it("keeps raw edits exact and updates the visual editor when the value becomes editable", () => {
    const input = mount("$EDITOR_TOOLBAR");
    input.value = "  bold  customButton | italic ";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector<HTMLButtonElement>("[data-toolbar-toggle]")!.click();
    expect(submitted()).toBe("  bold  customButton | italic ");
    expect(
      document.querySelector<HTMLElement>(".ff-toolbar-visual")!.hidden,
    ).toBe(false);
    expect(document.querySelectorAll(".ff-toolbar-chip")).toHaveLength(4);
  });

  it("does not submit or modify read-only values", () => {
    const input = mount("bold | italic", true);
    document.querySelector<HTMLButtonElement>("[data-toolbar-add]")!.click();
    document
      .querySelector<HTMLButtonElement>('[data-toolbar-option="|"]')!
      .click();
    expect(input.value).toBe("bold | italic");
    expect(submitted()).toBeNull();
    expect(
      Array.from(
        document.querySelectorAll<HTMLElement>(".ff-toolbar-chip"),
      ).every((chip) => !chip.draggable),
    ).toBe(true);
  });

  it("supports an empty toolbar and safe move boundaries", () => {
    mount("");
    expect(submitted()).toBe("");
    expect(parseToolbar("")).toEqual([]);
    expect(moveToolbarItem(["bold"], 0, -1)).toEqual(["bold"]);
    expect(moveToolbarItem(["bold"], 0, 2)).toEqual(["bold"]);
  });
});
