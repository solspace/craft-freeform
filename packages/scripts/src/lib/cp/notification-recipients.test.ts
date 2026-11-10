import { beforeEach, describe, expect, it } from "vitest";
import {
  bindNotificationRecipients,
  notificationTemplateMode,
  selectedNotificationEmails,
} from "./notification-recipients";

describe("additional notification recipients", () => {
  let form: HTMLFormElement;

  beforeEach(() => {
    document.body.innerHTML = `<form>
      <span data-recipient-count data-count-label="{count} selected"></span>
      <button type="button" data-select-recipients="all" data-select-label="Select All" data-deselect-label="Deselect All">Select All</button>
      <input type="checkbox" name="selectedEmails[]" value="alice@example.test">
      <input type="checkbox" name="selectedEmails[]" value="bob@example.test">
      <textarea name="emails">team@example.test</textarea>
    </form>`;
    form = document.querySelector("form")!;
  });

  it("starts unchecked and only includes explicitly selected recipients", () => {
    bindNotificationRecipients(form);
    const toggle = form.querySelector<HTMLButtonElement>(
      "[data-select-recipients]",
    )!;
    expect(toggle.textContent).toBe("Select All");
    expect(selectedNotificationEmails(form)).toEqual([]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "0 selected",
    );
    form.querySelector<HTMLInputElement>("input")!.click();
    expect(selectedNotificationEmails(form)).toEqual(["alice@example.test"]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "1 selected",
    );
    expect(toggle.textContent).toBe("Deselect All");
    toggle.click();
    expect(selectedNotificationEmails(form)).toEqual([]);
    expect(toggle.textContent).toBe("Select All");
  });

  it("selects and deselects every recipient without changing manual addresses", () => {
    bindNotificationRecipients(form);
    const toggle = form.querySelector<HTMLButtonElement>(
      "[data-select-recipients]",
    )!;
    toggle.focus();
    form
      .querySelector<HTMLButtonElement>('[data-select-recipients="all"]')!
      .click();
    expect(selectedNotificationEmails(form)).toEqual([
      "alice@example.test",
      "bob@example.test",
    ]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "2 selected",
    );
    expect(toggle.textContent).toBe("Deselect All");
    expect(document.activeElement).toBe(toggle);
    form
      .querySelector<HTMLButtonElement>('[data-select-recipients="none"]')!
      .click();
    expect(selectedNotificationEmails(form)).toEqual([]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "0 selected",
    );
    expect(form.querySelector("textarea")!.value).toBe("team@example.test");
    expect(toggle.textContent).toBe("Select All");
    expect(document.activeElement).toBe(toggle);
  });

  it("supports manual-only sending when there are no discovered recipients", () => {
    form.querySelectorAll("input, button").forEach((element) => {
      element.remove();
    });
    bindNotificationRecipients(form);
    expect(selectedNotificationEmails(form)).toEqual([]);
  });

  it("switches template modes, hides unavailable addresses, and restores their selections", () => {
    form.innerHTML = `<input type="radio" name="templateMode" value="custom" checked>
      <input type="radio" name="templateMode" value="configured">
      <div class="recipient-option" data-configured-count="2"><input type="checkbox" name="selectedEmails[]" value="configured@example.test" checked></div>
      <div class="recipient-option" data-configured-count="0"><input type="checkbox" name="selectedEmails[]" value="unconfigured@example.test" checked></div>
      <span data-custom-mode>1 email</span><span data-configured-mode hidden>2 emails</span>
      <div data-template-field><label data-template-label data-custom-label="All recipients" data-configured-label="Additional emails"></label><select name="template"><option value="">---</option><option value="12">Test</option></select></div>
      <textarea name="emails"></textarea>`;
    bindNotificationRecipients(form);
    const custom = form.querySelector<HTMLInputElement>(
      'input[value="custom"]',
    )!;
    const configured = form.querySelector<HTMLInputElement>(
      'input[value="configured"]',
    )!;
    const select = form.querySelector("select")!;
    const textarea = form.querySelector("textarea")!;
    const templateField = form.querySelector<HTMLElement>(
      "[data-template-field]",
    )!;
    configured.click();
    const unconfiguredRow = form.querySelector<HTMLElement>(
      '.recipient-option[data-configured-count="0"]',
    )!;
    expect(unconfiguredRow.hidden).toBe(true);
    expect(notificationTemplateMode(form)).toBe("configured");
    expect(selectedNotificationEmails(form)).toEqual([
      "configured@example.test",
    ]);
    expect(templateField.hidden).toBe(true);
    expect(select.required).toBe(false);
    expect(select.disabled).toBe(true);
    expect(form.querySelector<HTMLElement>("[data-custom-mode]")!.hidden).toBe(
      true,
    );
    expect(
      form.querySelector<HTMLElement>("[data-configured-mode]")!.hidden,
    ).toBe(false);
    textarea.value = "extra@example.test";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(templateField.hidden).toBe(false);
    expect(select.required).toBe(true);
    expect(select.disabled).toBe(false);
    expect(form.querySelector("[data-template-label]")!.textContent).toBe(
      "Additional emails",
    );
    select.value = "12";
    custom.click();
    expect(unconfiguredRow.hidden).toBe(false);
    expect(selectedNotificationEmails(form)).toEqual([
      "configured@example.test",
      "unconfigured@example.test",
    ]);
    expect(select.value).toBe("12");
    expect(textarea.value).toBe("extra@example.test");
    expect(form.querySelector("[data-template-label]")!.textContent).toBe(
      "All recipients",
    );
  });

  it("shows an empty state instead of the list and selection controls when none are configured", () => {
    form.innerHTML = `<input type="radio" name="templateMode" value="custom" checked>
      <input type="radio" name="templateMode" value="configured">
      <div data-recipient-controls><button type="button" data-select-recipients="all">Select All</button></div>
      <div data-recipient-controls><div class="recipient-option" data-configured-count="0"><input type="checkbox" name="selectedEmails[]" value="unconfigured@example.test" checked></div></div>
      <p data-recipient-empty hidden>No configured notifications</p>`;
    bindNotificationRecipients(form);
    const controls = Array.from(
      form.querySelectorAll<HTMLElement>("[data-recipient-controls]"),
    );
    const empty = form.querySelector<HTMLElement>("[data-recipient-empty]")!;
    expect(controls.every((element) => !element.hidden)).toBe(true);
    expect(empty.hidden).toBe(true);
    form.querySelector<HTMLInputElement>('input[value="configured"]')!.click();
    expect(controls.every((element) => element.hidden)).toBe(true);
    expect(empty.hidden).toBe(false);
    expect(selectedNotificationEmails(form)).toEqual([]);
    form.querySelector<HTMLInputElement>('input[value="custom"]')!.click();
    expect(controls.every((element) => !element.hidden)).toBe(true);
    expect(empty.hidden).toBe(true);
    expect(selectedNotificationEmails(form)).toEqual([
      "unconfigured@example.test",
    ]);
  });

  it("Select All in configured mode includes only eligible addresses", () => {
    form.insertAdjacentHTML(
      "afterbegin",
      '<input type="radio" name="templateMode" value="configured" checked>',
    );
    const checkboxes = form.querySelectorAll<HTMLInputElement>(
      'input[name="selectedEmails[]"]',
    );
    for (const [index, checkbox] of Array.from(checkboxes).entries()) {
      const row = document.createElement("div");
      row.className = "recipient-option";
      row.dataset.configuredCount = String(index);
      checkbox.before(row);
      row.append(checkbox);
    }
    bindNotificationRecipients(form);
    const toggle = form.querySelector<HTMLButtonElement>(
      "[data-select-recipients]",
    )!;
    expect(toggle.dataset.selectRecipients).toBe("none");
    toggle.click();
    expect(selectedNotificationEmails(form)).toEqual([]);
    toggle.click();
    expect(selectedNotificationEmails(form)).toEqual(["bob@example.test"]);
  });

  it("selects every eligible recipient when entering configured mode and keeps later deselections", () => {
    form.innerHTML = `<input type="radio" name="templateMode" value="custom" checked>
      <input type="radio" name="templateMode" value="configured">
      <span data-recipient-count data-count-label="{count} selected"></span>
      <div class="recipient-option" data-configured-count="1"><input type="checkbox" name="selectedEmails[]" value="alice@example.test"></div>
      <div class="recipient-option" data-configured-count="2"><input type="checkbox" name="selectedEmails[]" value="bob@example.test"></div>
      <div class="recipient-option" data-configured-count="0"><input type="checkbox" name="selectedEmails[]" value="unconfigured@example.test"></div>
      <textarea name="emails"></textarea>
      <button type="button" data-select-recipients="all" data-select-label="Select All" data-deselect-label="Deselect All">Select All</button>`;
    bindNotificationRecipients(form);
    expect(selectedNotificationEmails(form)).toEqual([]);
    const configured = form.querySelector<HTMLInputElement>(
      'input[value="configured"]',
    )!;
    configured.click();
    expect(selectedNotificationEmails(form)).toEqual([
      "alice@example.test",
      "bob@example.test",
    ]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "2 selected",
    );
    const alice = form.querySelector<HTMLInputElement>(
      'input[value="alice@example.test"]',
    )!;
    alice.click();
    const textarea = form.querySelector("textarea")!;
    textarea.value = "extra@example.test";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(selectedNotificationEmails(form)).toEqual(["bob@example.test"]);
    form
      .querySelector<HTMLButtonElement>('[data-select-recipients="none"]')!
      .click();
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    expect(selectedNotificationEmails(form)).toEqual([]);
    expect(form.querySelector("[data-recipient-count]")!.textContent).toBe(
      "0 selected",
    );
    form.querySelector<HTMLInputElement>('input[value="custom"]')!.click();
    configured.click();
    expect(selectedNotificationEmails(form)).toEqual([
      "alice@example.test",
      "bob@example.test",
    ]);
  });

  it("also defaults to all eligible recipients when opened in configured mode", () => {
    form.innerHTML = `<input type="radio" name="templateMode" value="configured" checked>
      <div class="recipient-option" data-configured-count="1"><input type="checkbox" name="selectedEmails[]" value="alice@example.test"></div>
      <div class="recipient-option" data-configured-count="0"><input type="checkbox" name="selectedEmails[]" value="unconfigured@example.test"></div>`;
    bindNotificationRecipients(form);
    expect(selectedNotificationEmails(form)).toEqual(["alice@example.test"]);
    expect(
      form.querySelector<HTMLInputElement>(
        'input[value="unconfigured@example.test"]',
      )!.disabled,
    ).toBe(true);
  });
});
