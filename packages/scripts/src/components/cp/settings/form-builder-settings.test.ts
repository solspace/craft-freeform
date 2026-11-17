import { afterEach, describe, expect, it } from "vitest";
import { initializeFormBuilderSettings } from "./form-builder-settings";

afterEach(() => document.body.replaceChildren());

function mountCreation(aiEnabled = true): {
  form: HTMLFormElement;
  checkbox: HTMLInputElement;
  region: HTMLElement;
  select: HTMLSelectElement;
} {
  document.body.innerHTML = `<form><div data-form-creation-methods>
    <craft-checkbox><input type="checkbox" name="settings[formCreationOptions][]" value="wizard" checked></craft-checkbox>
    <craft-checkbox><input type="checkbox" name="settings[formCreationOptions][]" value="ai" ${aiEnabled ? "checked" : ""}></craft-checkbox>
  </div><div data-form-creation-ai><craft-select><select name="settings[defaultAiIntegration]"><option value="saved-integration" selected>Saved AI integration</option><option value="other-integration">Other AI integration</option></select></craft-select></div></form>`;
  initializeFormBuilderSettings();
  return {
    form: document.querySelector("form")!,
    checkbox: document.querySelector('input[value="ai"]')!,
    region: document.querySelector("[data-form-creation-ai]")!,
    select: document.querySelector("select")!,
  };
}

describe("Form Builder preferences", () => {
  it("keeps lock actions, accessible names, and submitted state in sync without duplicate handlers", () => {
    document.body.innerHTML = `<form><button type="button" data-default-lock
      data-lock-label="Lock this default: General — Form Type"
      data-unlock-label="Unlock this default: General — Form Type">
      <input type="hidden" name="locked" value="0"></button></form>`;
    initializeFormBuilderSettings();
    initializeFormBuilderSettings();
    const button = document.querySelector("button")!;
    const form = document.querySelector("form")!;
    expect(button.tabIndex).toBe(0);
    expect(button.title).toBe("Lock this default: General — Form Type");
    button.click();
    expect(new FormData(form).get("locked")).toBe("1");
    expect(button.getAttribute("aria-label")).toBe(
      "Unlock this default: General — Form Type",
    );
    expect(button.title).toBe(button.getAttribute("aria-label"));
    button.click();
    expect(new FormData(form).get("locked")).toBe("0");
    expect(button.getAttribute("aria-label")).toBe(
      "Lock this default: General — Form Type",
    );
  });

  it("hides the AI preference when unavailable while retaining its saved submitted value", () => {
    const { form, checkbox, region, select } = mountCreation(false);
    expect(region.hidden).toBe(true);
    expect(select.disabled).toBe(false);
    expect(new FormData(form).get("settings[defaultAiIntegration]")).toBe(
      "saved-integration",
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(region.hidden).toBe(false);
    expect(select.value).toBe("saved-integration");
    select.value = "other-integration";
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(region.hidden).toBe(true);
    expect(new FormData(form).get("settings[defaultAiIntegration]")).toBe(
      "other-integration",
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(select.value).toBe("other-integration");
  });

  it("restores dependent visibility after a native form reset", async () => {
    const { form, checkbox, region, select } = mountCreation(true);
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    select.value = "other-integration";
    expect(region.hidden).toBe(true);
    form.reset();
    await Promise.resolve();
    expect(region.hidden).toBe(false);
    expect(select.value).toBe("saved-integration");
  });

  it("keeps collapsed default values and lock state in native form submissions", () => {
    document.body.innerHTML = `<form><details data-defaults-section><summary><h2>Default Form Settings</h2></summary>
      <craft-input><input name="settings[defaults][settings][general][title][value]" value="Contact"></craft-input>
      <craft-select><select name="settings[defaults][settings][processing][display][value]"><option value="overlay" selected>Overlay</option></select></craft-select>
      <craft-switch><input type="hidden" name="settings[defaults][settings][processing][ajax][value]" value="1"></craft-switch>
      <input type="hidden" name="settings[defaults][settings][processing][ajax][locked]" value="1">
    </details></form>`;
    initializeFormBuilderSettings();
    expect(document.querySelector("details")!.open).toBe(false);
    const saved = new FormData(document.querySelector("form")!);
    expect([...saved.entries()]).toEqual([
      ["settings[defaults][settings][general][title][value]", "Contact"],
      ["settings[defaults][settings][processing][display][value]", "overlay"],
      ["settings[defaults][settings][processing][ajax][value]", "1"],
      ["settings[defaults][settings][processing][ajax][locked]", "1"],
    ]);
  });

  it("opens only the affected defaults section on validation and focus", () => {
    document.body.innerHTML = `<details data-defaults-section><summary>Notification Defaults</summary><input value="email"></details>
      <details data-defaults-section><summary>Default Form Settings</summary><input required></details>`;
    initializeFormBuilderSettings();
    const [notifications, settings] = Array.from(
      document.querySelectorAll("details"),
    );
    expect(notifications.open).toBe(false);
    notifications
      .querySelector("summary")!
      .dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(notifications.open).toBe(false);
    expect(settings.querySelector("input")!.checkValidity()).toBe(false);
    expect(settings.open).toBe(true);
    expect(notifications.open).toBe(false);
    notifications
      .querySelector("input")!
      .dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(notifications.open).toBe(true);
  });

  it("opens a defaults section that contains server-rendered errors", () => {
    document.body.innerHTML =
      '<details data-defaults-section><summary>Default Form Settings</summary><craft-input invalid><input aria-invalid="true"></craft-input></details>';
    initializeFormBuilderSettings();
    expect(document.querySelector("details")!.open).toBe(true);
  });
});
