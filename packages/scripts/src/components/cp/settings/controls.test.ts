import { afterEach, describe, expect, it } from "vitest";
import { initializeSettingsControls } from "./controls";

afterEach(() => document.body.replaceChildren());

describe("Craft 6 settings controls", () => {
  it("clears the purge age when the native switch turns off before its hidden input updates", () => {
    document.body.innerHTML =
      '<craft-switch><craft-switch-button checked></craft-switch-button><input slot="hidden-input" name="purge-toggle" value="1"></craft-switch><select id="purge-value"><option value="0">Disabled</option><option value="30" selected>30 days</option></select>';
    initializeSettingsControls();
    const button = document.querySelector("craft-switch-button")!;
    Object.assign(button, { checked: false });
    button.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      document.querySelector<HTMLSelectElement>("#purge-value")?.value,
    ).toBe("0");
    expect(
      document.querySelector<HTMLInputElement>('input[name="purge-toggle"]')
        ?.value,
    ).toBe("1");
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
      '<div id="logging-level-warning" hidden>Verbose logging uses more disk space.</div><craft-field class="field"><div slot="input"><select name="settings[loggingLevel]"><option value="info" selected>Info</option><option value="debug">Debug</option><option value="error">Error</option></select></div><span slot="warning">Existing warning</span></craft-field>';
    initializeSettingsControls();
    const select = document.querySelector("select")!;
    select.value = "debug";
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
    ).toBe("Verbose logging uses more disk space.");
    select.value = "error";
    select.dispatchEvent(new Event("change"));
    expect(
      document.querySelector("[data-freeform-setting-warning]"),
    ).toBeNull();
    expect(document.querySelector('[slot="warning"]')?.textContent).toBe(
      "Existing warning",
    );
  });
});
