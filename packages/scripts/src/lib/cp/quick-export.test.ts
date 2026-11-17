import { beforeEach, describe, expect, it } from "vitest";
import { bindQuickExportFields } from "./quick-export";

describe("Quick Export field selection", () => {
  let form: HTMLFormElement;
  beforeEach(() => {
    document.body.innerHTML = `<form>
      <select name="form_id"><option value="1">Contact</option><option value="2">Quote</option></select>
      <section class="form-field-list" data-id="1">
        <button type="button" data-export-field-selection="all"><span>Select all</span></button><button type="button" data-export-field-selection="none">Clear</button>
        <span data-export-field-count data-count-label="{count} of {total} fields selected"></span>
        <input type="hidden" name="export_fields[1][name][checked]" value="0"><input type="checkbox" name="export_fields[1][name][checked]" value="1" checked>
        <input type="checkbox" name="export_fields[1][email][checked]" value="1">
      </section>
      <section class="form-field-list" data-id="2">
        <button type="button" data-export-field-selection="all">Select all</button><button type="button" data-export-field-selection="none">Clear</button>
        <span data-export-field-count data-count-label="{count} of {total} fields selected"></span>
        <input type="checkbox" name="export_fields[2][message][checked]" value="1" checked>
      </section>
      <section><h2>Formatting options</h2><select name="formatting[headings]"><option value="handles" selected>Field handles</option></select><input type="checkbox" name="rememberFormatting" value="1" checked></section>
    </form>`;
    form = document.querySelector("form")!;
    bindQuickExportFields(form);
  });

  it("selects and clears only the current form and reports the selected count", () => {
    const first = form.querySelector<HTMLElement>('[data-id="1"]')!;
    const other = form.querySelector<HTMLInputElement>('[data-id="2"] input')!;
    first
      .querySelector<HTMLElement>('[data-export-field-selection="all"] span')!
      .click();
    expect(first.querySelector("[data-export-field-count]")!.textContent).toBe(
      "2 of 2 fields selected",
    );
    first
      .querySelector<HTMLElement>('[data-export-field-selection="none"]')!
      .click();
    expect(first.querySelector("[data-export-field-count]")!.textContent).toBe(
      "0 of 2 fields selected",
    );
    expect(other.checked).toBe(true);
    expect(other.disabled).toBe(true);
  });

  it("preserves each form's field choices and excludes inactive form fields from the POST", () => {
    const selector = form.querySelector("select")!;
    selector.value = "2";
    selector.dispatchEvent(new Event("change", { bubbles: true }));
    expect([...new FormData(form).keys()]).not.toContain(
      "export_fields[1][name][checked]",
    );
    expect(new FormData(form).get("export_fields[2][message][checked]")).toBe(
      "1",
    );
    selector.value = "1";
    selector.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      form.querySelector<HTMLInputElement>(
        '[name="export_fields[1][name][checked]"][type="checkbox"]',
      )!.checked,
    ).toBe(true);
    expect(
      form.querySelector<HTMLInputElement>(
        '[name="export_fields[1][email][checked]"]',
      )!.checked,
    ).toBe(false);
  });

  it("submits formatting choices and supports opting out of remembering them", () => {
    expect(new FormData(form).get("formatting[headings]")).toBe("handles");
    expect(new FormData(form).get("rememberFormatting")).toBe("1");
    form.querySelector<HTMLInputElement>(
      '[name="rememberFormatting"]',
    )!.checked = false;
    expect(new FormData(form).has("rememberFormatting")).toBe(false);
  });
});
