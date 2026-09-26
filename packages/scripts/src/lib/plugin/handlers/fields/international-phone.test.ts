import { afterEach, beforeEach, expect, it } from "vitest";
import {
  mountInternationalPhone,
  phoneValue,
} from "../../../../../../frontend/core/src/phone/international-phone";

let cleanup: (() => void) | undefined;
beforeEach(() => {
  document.body.innerHTML =
    '<form><input type="tel" name="phone" id="phone"><label for="phone">Phone</label></form>';
});
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});
function setup(value = "") {
  const input = document.querySelector("input")!;
  input.value = value;
  const values: string[] = [];
  const controller = mountInternationalPhone(
    input,
    {
      international: true,
      defaultCountry: "GB",
      allowedCountries: ["GB", "US", "CA"],
      examples: { GB: "020 7946 0018", US: "201-555-0123" },
    },
    (value) => values.push(value),
  );
  cleanup = controller.destroy;
  return {
    input,
    controller,
    values,
    button: document.querySelector("button")!,
    panel: document.querySelector(".freeform-phone-country")!,
  };
}
it("preserves floating labels and formats valid numbers without losing country context", () => {
  const { input, values, controller } = setup();
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  expect(input.placeholder).toBe("020 7946 0018");
  input.value = "020 7946 0018";
  input.dispatchEvent(new Event("input"));
  expect(values.at(-1)).toBe("+442079460018");
  controller.update("+442079460018");
  expect(input.value).toBe("020 7946 0018");
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("+44 20 7946 0018");
  expect(controller.getValue()).toBe("+442079460018");
});
it("searches only allowed countries by name, code or dial code, supports Escape and changes country", () => {
  const { input, button, controller } = setup();
  button.click();
  expect(button.getAttribute("aria-expanded")).toBe("true");
  const search = document.querySelector(
    "input[type=search]",
  )! as HTMLInputElement;
  const options = () => [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ];
  search.value = "United States";
  search.dispatchEvent(new Event("input"));
  expect(options().map((o) => o.dataset.country)).toEqual(["US"]);
  options()[0].click();
  expect(button.getAttribute("aria-expanded")).toBe("false");
  input.value = "2015550123";
  input.dispatchEvent(new Event("input"));
  expect(controller.getValue()).toBe("+12015550123");
  button.click();
  search.value = "Germany";
  search.dispatchEvent(new Event("input"));
  expect(options()).toHaveLength(0);
  search.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(button);
});
it("handles pasted numbers, external changes, resets and cleanup", async () => {
  const { input, button, controller } = setup();
  input.value = "+12015550123";
  input.dispatchEvent(new Event("input"));
  expect(button.getAttribute("aria-label")).toContain("United States");
  controller.update("");
  expect(input.value).toBe("");
  expect(button.getAttribute("aria-label")).toContain("United Kingdom");
  input.value = "020 7946 0018";
  input.dispatchEvent(new Event("input"));
  input.form!.reset();
  await Promise.resolve();
  expect(input.value).toBe("");
  input.disabled = true;
  await Promise.resolve();
  expect(button.disabled).toBe(true);
  controller.destroy();
  expect(document.querySelector(".freeform-phone-country")).toBeNull();
  expect(input.name).toBe("phone");
  expect(input.hasAttribute("placeholder")).toBe(false);
});
it("retains invalid input for server rejection and does not impose mobile-only rules", () => {
  expect(phoneValue("020 7946 0018", "GB")).toBe("+442079460018");
  expect(phoneValue("call me", "GB")).toBe("+44 call me");
  expect(phoneValue("020 7946 0018 ext 12", "GB")).toContain("ext 12");
  expect(phoneValue("", "GB")).toBe("");
  expect(phoneValue("+4930123456", "US")).toBe("+4930123456");
});
it("preserves custom placeholders and fails closed when no configured countries are valid", () => {
  const input = document.querySelector("input")!;
  input.placeholder = "Custom example";
  const controller = mountInternationalPhone(input, {
    defaultCountry: "US",
    allowedCountries: ["ZZ"],
  });
  cleanup = controller.destroy;
  expect(input.placeholder).toBe("Custom example");
  expect(document.querySelector("button")!.disabled).toBe(true);
});

it("navigates the country list without submitting the form and closes when focus leaves", () => {
  const { button, input, controller } = setup();
  button.click();
  const search =
    document.querySelector<HTMLInputElement>("input[type=search]")!;
  const key = (key: string) =>
    search.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  key("Home");
  const active = () =>
    document.getElementById(search.getAttribute("aria-activedescendant")!)!;
  expect(active().dataset.country).toBe("CA");
  key("ArrowDown");
  expect(active().dataset.country).toBe("GB");
  key("End");
  expect(active().dataset.country).toBe("US");
  expect(key("Enter")).toBe(false);
  expect(button.getAttribute("aria-label")).toContain("United States");
  input.value = "2015550123";
  expect(controller.getValue()).toBe("+12015550123");
  button.click();
  input.focus();
  expect(button.getAttribute("aria-expanded")).toBe("false");
});
it("restores layout styles and handles multiple fields sharing a parent", () => {
  const { input, controller } = setup();
  const parent = input.parentElement!;
  const other = document.createElement("input");
  other.style.setProperty("padding-inline-start", "20px", "important");
  parent.append(other);
  const second = mountInternationalPhone(other, { defaultCountry: "CA" });
  expect(input.parentElement).toBe(parent);
  expect(parent.style.position).toBe("relative");
  controller.destroy();
  expect(input.style.paddingInlineStart).toBe("");
  expect(parent.style.position).toBe("relative");
  second.destroy();
  expect(parent.style.position).toBe("");
  expect(other.style.paddingInlineStart).toBe("20px");
  expect(other.style.getPropertyPriority("padding-inline-start")).toBe(
    "important",
  );
});
it("closes an open selector when the input becomes readonly", async () => {
  const { input, button } = setup();
  button.click();
  input.readOnly = true;
  await Promise.resolve();
  expect(button.disabled).toBe(true);
  expect(button.getAttribute("aria-expanded")).toBe("false");
});
