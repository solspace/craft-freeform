// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchableSelect } from "./searchable-select.js";

const controls: SearchableSelect[] = [];
function setup(
  attributes = "",
  options = '<option value="">Choose</option><option value="cafe">Café</option><option value="tea">Tea</option>',
) {
  document.body.innerHTML = `<form><label for="drink">Drink</label><select id="drink" name="drink" ${attributes}>${options}</select><button>Submit</button></form>`;
  const select = document.querySelector("select")!;
  const control = new SearchableSelect(select);
  controls.push(control);
  return { control, select, input: control.input, form: select.form! };
}
const key = (input: HTMLInputElement, name: string) =>
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: name,
      bubbles: true,
      cancelable: true,
    }),
  );
const type = (input: HTMLInputElement, query: string) => {
  input.value = query;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
afterEach(() => {
  controls.splice(0).forEach((control) => {
    control.destroy();
  });
  document.body.replaceChildren();
});

describe("searchable select", () => {
  it("filters accents, selects with keys, and submits only the native value", () => {
    const { input, select, form } = setup();
    const change = vi.fn();
    select.addEventListener("change", change);
    input.focus();
    type(input, "cafe");
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(1);
    expect(new FormData(form).get("drink")).toBe("");
    key(input, "ArrowDown");
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
    key(input, "Enter");
    expect(new FormData(form).getAll("drink")).toEqual(["cafe"]);
    expect(input.value).toBe("Café");
    expect(change).toHaveBeenCalledTimes(1);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-label")).toBe("Drink");
  });

  it("restores the selection on Escape, Tab, and outside clicks without accepting free text", () => {
    const { input, select } = setup();
    select.value = "tea";
    select.dispatchEvent(new Event("change"));
    for (const name of ["Escape", "Tab"]) {
      input.click();
      type(input, "something else");
      key(input, name);
      expect(input.value).toBe("Tea");
      expect(select.value).toBe("tea");
    }
    input.click();
    type(input, "unmatched");
    expect(document.querySelector('[role="status"]')?.textContent).toBe(
      "No results found.",
    );
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(input.value).toBe("Tea");
  });

  it("supports multi selection, removable choices, Backspace, and native event consumers", () => {
    const { input, select, form } = setup("multiple");
    const changes = vi.fn();
    const inputs = vi.fn();
    select.addEventListener("change", changes);
    select.addEventListener("input", inputs);
    input.focus();
    key(input, "ArrowDown");
    key(input, "Enter");
    key(input, "ArrowDown");
    key(input, "ArrowDown");
    key(input, "Enter");
    expect(new FormData(form).getAll("drink")).toEqual(["cafe", "tea"]);
    expect(
      document
        .querySelector('[role="listbox"]')
        ?.getAttribute("aria-multiselectable"),
    ).toBe("true");
    (
      document.querySelector('[aria-label="Remove Café"]') as HTMLButtonElement
    ).click();
    expect(new FormData(form).getAll("drink")).toEqual(["tea"]);
    key(input, "Backspace");
    expect(new FormData(form).getAll("drink")).toEqual([]);
    expect(changes).toHaveBeenCalledTimes(4);
    expect(inputs).toHaveBeenCalledTimes(4);
  });

  it("skips hidden and disabled choices, including disabled optgroups", () => {
    const { input, select } = setup(
      "",
      '<optgroup label="Unavailable" disabled><option value="x">Locked</option></optgroup><option hidden value="h">Hidden</option><option disabled value="d">Disabled</option><optgroup label="Drinks"><option value="tea">Tea</option></optgroup>',
    );
    input.focus();
    expect(document.querySelectorAll('[role="group"]')).toHaveLength(2);
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(3);
    key(input, "ArrowDown");
    key(input, "Enter");
    expect(select.value).toBe("tea");
  });

  it("renders labels and search strings as literal text", () => {
    const { input, select } = setup();
    const option = new Option('<img src=x onerror="alert(1)">', "unsafe");
    select.append(option);
    input.focus();
    type(input, "<img");
    key(input, "ArrowDown");
    key(input, "Enter");
    expect(input.value).toBe(option.label);
    expect(document.querySelector("img")).toBeNull();
    input.click();
    type(input, "[.*(");
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it("forwards native focus and validation to the visible input and clears errors on selection", () => {
    const { input, select, form } = setup("required");
    expect(form.checkValidity()).toBe(false);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.validationMessage).toBeTruthy();
    type(input, "tea");
    key(input, "ArrowDown");
    key(input, "Enter");
    expect(form.checkValidity()).toBe(true);
    select.focus();
    expect(document.activeElement).toBe(input);
  });

  it("updates options, disabled state, and server errors without recreating the control", async () => {
    const { input, select } = setup();
    input.focus();
    select.replaceChildren(new Option("Water", "water"));
    select.setAttribute("aria-describedby", "help");
    select.setAttribute("aria-invalid", "true");
    await tick();
    expect(document.querySelector('[role="option"]')?.textContent).toBe(
      "Water",
    );
    expect(input.getAttribute("aria-describedby")).toBe("help");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    select.disabled = true;
    await tick();
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    select.disabled = false;
    await tick();
    expect(input.disabled).toBe(false);
  });

  it("respects disabled fieldsets", async () => {
    const { select, control } = setup();
    control.destroy();
    const fieldset = document.createElement("fieldset");
    select.before(fieldset);
    fieldset.append(select);
    const next = new SearchableSelect(select);
    controls.push(next);
    fieldset.disabled = true;
    await tick();
    expect(next.input.disabled).toBe(true);
    fieldset.disabled = false;
    await tick();
    expect(next.input.disabled).toBe(false);
  });

  it("resets selection and query and honors a canceled reset", async () => {
    const { input, select, form } = setup();
    select.value = "tea";
    select.dispatchEvent(new Event("change"));
    input.focus();
    type(input, "wat");
    form.reset();
    await tick();
    expect(input.value).toBe("Choose");
    expect(select.value).toBe("");
    select.value = "tea";
    select.dispatchEvent(new Event("change"));
    form.addEventListener("reset", (event) => event.preventDefault());
    form.reset();
    await tick();
    expect(input.value).toBe("Tea");
  });

  it("restores native attributes and removes listeners on teardown", () => {
    const { control, select, input } = setup(
      'tabindex="2" aria-hidden="false"',
    );
    control.destroy();
    control.destroy();
    expect(document.querySelector(".ff-searchable")).toBeNull();
    expect(select.tabIndex).toBe(2);
    expect(select.getAttribute("aria-hidden")).toBe("false");
    expect(select.classList.contains("ff-searchable-native")).toBe(false);
    select.focus();
    expect(document.activeElement).toBe(select);
    key(input, "ArrowDown");
    key(input, "Enter");
    expect(select.value).toBe("");
  });
});
