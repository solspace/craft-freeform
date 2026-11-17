import { afterEach, describe, expect, it } from "vitest";
import { initializeSettingsControls } from "./controls";

afterEach(() => document.body.replaceChildren());

describe("Craft 6 settings controls", () => {
  it("reveals dependent fields on the first enable before Craft updates aria-checked", () => {
    document.body.innerHTML =
      '<craft-switch><craft-switch-button class="fieldtoggle" role="switch" aria-checked="false" data-target="purge" data-reverse-target="disabled"></craft-switch-button></craft-switch><div id="purge" class="hidden"></div><div id="disabled"></div>';
    const button = document.querySelector("craft-switch-button")!;
    const target = document.querySelector("#purge")!;
    const reverseTarget = document.querySelector("#disabled")!;
    // Craft's FieldToggle listens before Freeform and reads the ARIA state.
    button.addEventListener("change", () => {
      const enabled = button.getAttribute("aria-checked") === "true";
      target.classList.toggle("hidden", !enabled);
      reverseTarget.classList.toggle("hidden", enabled);
    });
    initializeSettingsControls();
    for (const checked of [true, false, true, false]) {
      Object.assign(button, { checked });
      button.dispatchEvent(new Event("change", { bubbles: true }));
      expect(target.classList.contains("hidden")).toBe(!checked);
      expect(reverseTarget.classList.contains("hidden")).toBe(checked);
      expect(button.getAttribute("aria-checked")).toBe(String(checked));
    }
    Object.assign(button, { indeterminate: true });
    button.dispatchEvent(new Event("change", { bubbles: true }));
    expect(button.getAttribute("aria-checked")).toBe("mixed");
    expect(target.classList.contains("hidden")).toBe(true);
  });

  it("uses Never as the disabled retention value and preserves the selected forms", async () => {
    document.body.innerHTML =
      '<form><div data-freeform-retention-setting><select name="settings[purgableSubmissionAgeInDays]"><option value="0">Never</option><option value="14" selected>14 days</option></select><div data-freeform-retention-details><input type="checkbox" name="settings[purgableFormIds][]" value="4" checked><span>Deletion warning</span></div></div></form>';
    initializeSettingsControls();
    const select = document.querySelector<HTMLSelectElement>("select")!;
    const details = document.querySelector<HTMLElement>(
      "[data-freeform-retention-details]",
    )!;
    expect(details.hidden).toBe(false);
    select.value = "0";
    select.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(details.hidden).toBe(true);
    const saved = new FormData(document.querySelector("form")!);
    expect(saved.get("settings[purgableSubmissionAgeInDays]")).toBe("0");
    expect(saved.getAll("settings[purgableFormIds][]")).toEqual(["4"]);
    select.value = "14";
    select.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(details.hidden).toBe(false);
  });

  it("shows a single deletion warning only for a changed active retention value", async () => {
    document.body.innerHTML =
      '<div data-freeform-retention-setting><craft-select><select><option value="0">Never</option><option value="14" selected>14 days</option><option value="30">30 days</option></select></craft-select><div data-freeform-retention-details><div data-freeform-retention-warning hidden>Permanent deletion</div></div></div>';
    initializeSettingsControls();
    const select = document.querySelector<HTMLSelectElement>("select")!;
    const warning = document.querySelector<HTMLElement>(
      "[data-freeform-retention-warning]",
    )!;
    expect(warning.hidden).toBe(true);
    for (const [value, visible] of [
      ["30", true],
      ["30", true],
      ["14", false],
      ["0", false],
      ["30", true],
    ] as const) {
      select.value = value;
      select.dispatchEvent(new Event("change"));
      await Promise.resolve();
      expect(warning.hidden).toBe(!visible);
      expect(
        document.querySelectorAll("[data-freeform-retention-warning]"),
      ).toHaveLength(1);
    }
  });

  it("reads the native builder switch rather than looking for inputs inside its button", () => {
    document.body.innerHTML =
      '<craft-switch><craft-switch-button id="allow-builder-templates"></craft-switch-button><input slot="hidden-input" value=""></craft-switch><div id="template-default" class="combined hidden"></div>';
    initializeSettingsControls();
    const button = document.querySelector("#allow-builder-templates")!;
    Object.assign(button, { checked: true });
    button.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      document.querySelector("#template-default")?.classList.contains("hidden"),
    ).toBe(false);
    Object.assign(button, { checked: false });
    button.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      document.querySelector("#template-default")?.classList.contains("hidden"),
    ).toBe(true);
  });

  it("places warnings in the native field slot without duplicating or removing other warnings", () => {
    document.body.innerHTML =
      '<div id="script-insert-warning" hidden>Load scripts manually.</div><craft-field class="field"><div slot="input"><select name="settings[scriptInsertLocation]"><option value="manual" selected>Manual</option><option value="footer">Footer</option></select></div><span slot="warning">Existing warning</span></craft-field>';
    initializeSettingsControls();
    const select = document.querySelector("select")!;
    select.value = "manual";
    select.dispatchEvent(new Event("change"));
    expect(
      document.querySelectorAll("[data-freeform-setting-warning]"),
    ).toHaveLength(1);
    expect(
      document
        .querySelector("[data-freeform-setting-warning]")
        ?.getAttribute("slot"),
    ).toBe("warning");
    expect(
      document.querySelector("[data-freeform-setting-warning]")?.textContent,
    ).toBe("Load scripts manually.");
    select.value = "footer";
    select.dispatchEvent(new Event("change"));
    expect(
      document.querySelector("[data-freeform-setting-warning]"),
    ).toBeNull();
    expect(document.querySelector('[slot="warning"]')?.textContent).toBe(
      "Existing warning",
    );
  });
});
