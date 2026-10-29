import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountNumber } from "../../../../../../frontend/core/src/number/number";
import NumberHandler from "./number";

let dispose: (() => void) | undefined;
beforeEach(() => {
  document.body.innerHTML =
    '<form novalidate><div class="form-floating"><input id="number" type="number" name="number" step="0.01" aria-describedby="help"><label for="number">Number</label></div><button type="submit">Submit</button></form>';
});
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.innerHTML = "";
});
function setup() {
  const input = document.querySelector("input")!;
  const control = mountNumber(input, { decimalCount: 2, min: 1, max: 100 });
  dispose = control.destroy;
  return { input, control, form: input.form! };
}

it("waits until blur, preserves invalid digits and places feedback below the label in the same field column", () => {
  const { input } = setup();
  input.value = "12.345";
  input.dispatchEvent(new Event("input"));
  expect(document.querySelector(".freeform-number-error")).toBeNull();
  input.dispatchEvent(new Event("blur"));
  const error = document.querySelector(".freeform-number-error")!;
  expect(error.textContent).toBe("Use no more than 2 decimal places.");
  expect(input.value).toBe("12.345");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe(`help ${error.id}`);
  expect(error.parentElement?.className).toBe("form-floating");
  expect(error.previousElementSibling?.tagName).toBe("LABEL");
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  input.value = "12.34";
  input.dispatchEvent(new Event("input"));
  expect(document.querySelector(".freeform-number-error")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("help");
  input.dispatchEvent(new Event("blur"));
  expect(input.validity.valid).toBe(true);
});

it("reports bounds and custom increments without clamping or rounding", () => {
  const { input } = setup();
  input.value = "101";
  input.dispatchEvent(new Event("blur"));
  expect(document.querySelector(".freeform-number-error")!.textContent).toBe(
    "Enter a number between 1 and 100.",
  );
  expect(input.value).toBe("101");
  input.step = "0.25";
  input.min = "0";
  input.value = "12.1";
  input.dispatchEvent(new Event("input"));
  input.dispatchEvent(new Event("blur"));
  expect(document.querySelector(".freeform-number-error")!.textContent).toBe(
    "Enter a number in increments of 0.25.",
  );
  expect(input.value).toBe("12.1");
});

it("uses the compiled regular error markup and styles without overriding the theme", () => {
  const input = document.querySelector("input")!;
  const control = mountNumber(input, {
    decimalCount: 0,
    error: {
      tag: "ul",
      itemTag: "li",
      attributes: {
        class: "list-unstyled m-0 fst-italic text-danger",
        id: "number-error",
        "data-custom": "error",
      },
    },
  });
  dispose = control.destroy;
  input.value = "12.5";
  input.dispatchEvent(new Event("blur"));
  const error = document.querySelector<HTMLElement>(".freeform-number-error")!;
  expect(error.tagName).toBe("UL");
  expect(error.firstElementChild?.tagName).toBe("LI");
  expect(error.textContent).toBe("Enter a whole number.");
  expect(error.classList.contains("text-danger")).toBe(true);
  expect(error.classList.contains("fst-italic")).toBe(true);
  expect(error.dataset.custom).toBe("error");
  expect(error.id).toBe("number-error");
  expect(error.getAttribute("style")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("help number-error");
  input.dispatchEvent(new Event("input"));
  expect(document.querySelector("#number-error")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("help");
});

it("respects custom error tags and safely renders messages as text", () => {
  const input = document.querySelector("input")!;
  const control = mountNumber(input, {
    error: {
      tag: "div",
      itemTag: "div",
      attributes: {
        class: "my-errors",
        style: "color: red",
        "aria-live": "assertive",
      },
    },
    messages: { whole: "<img src=x> Enter a whole number." },
  });
  dispose = control.destroy;
  input.value = "12.5";
  input.dispatchEvent(new Event("blur"));
  const error = document.querySelector<HTMLElement>(".freeform-number-error")!;
  expect(error.tagName).toBe("DIV");
  expect(error.firstElementChild?.tagName).toBe("DIV");
  expect(error.querySelector("img")).toBeNull();
  expect(error.textContent).toBe("<img src=x> Enter a whole number.");
  expect(error.style.color).toBe("red");
  expect(error.getAttribute("aria-live")).toBe("assertive");
});

it("clears on reset, skips disabled/readonly/conditional fields and detaches listeners", async () => {
  const { input, form, control } = setup();
  input.value = "101";
  input.disabled = true;
  expect(control.validate()).toBe(true);
  input.disabled = false;
  input.readOnly = true;
  expect(control.validate()).toBe(true);
  input.readOnly = false;
  input.parentElement!.setAttribute("data-hidden", "");
  expect(control.validate()).toBe(true);
  input.parentElement!.removeAttribute("data-hidden");
  expect(control.validate()).toBe(false);
  form.reset();
  await Promise.resolve();
  expect(document.querySelector(".freeform-number-error")).toBeNull();
  expect(input.validity.customError).toBe(false);
  control.destroy();
  input.value = "101";
  input.dispatchEvent(new Event("blur"));
  expect(document.querySelector(".freeform-number-error")).toBeNull();
});

it("lets invalid values reach regular form validation, preserves ordinary controls and cleans up after AJAX replacement", () => {
  const input = document.querySelector("input")!;
  const form = input.form!;
  input.setAttribute(
    "data-freeform-number",
    JSON.stringify({ decimalCount: 2 }),
  );
  const handler = new NumberHandler({ form } as Freeform);
  handler.reload();
  const submit = vi.fn((event: Event) => event.preventDefault());
  form.addEventListener("submit", submit);
  input.value = "12.345";
  input.dispatchEvent(new Event("blur"));
  form.querySelector("button")!.click();
  expect(submit).toHaveBeenCalledOnce();
  expect(input.validity.customError).toBe(false);
  expect(new FormData(form).get("number")).toBe("12.345");
  expect(form.querySelectorAll(".freeform-number-error")).toHaveLength(1);
  input.value = "12.34";
  input.dispatchEvent(new Event("input"));
  form.querySelector("button")!.click();
  expect(submit).toHaveBeenCalledTimes(2);
  form.innerHTML =
    '<input type="number" data-freeform-number="{}"><input type="number"><button type="submit">Submit</button>';
  handler.reload();
  input.value = "12.345";
  input.dispatchEvent(new Event("blur"));
  expect(input.validity.customError).toBe(false);
  const ordinary = form.querySelectorAll("input")[1];
  ordinary.value = "12.5";
  ordinary.dispatchEvent(new Event("blur"));
  expect(form.querySelector(".freeform-number-error")).toBeNull();
  form.innerHTML = "";
  handler.reload();
});

it("keeps blur feedback supplemental and leaves other validators in control", () => {
  const { input, control } = setup();
  input.value = "101";
  input.dispatchEvent(new Event("blur"));
  expect(document.querySelector(".freeform-number-error")!.textContent).toBe(
    "Enter a number between 1 and 100.",
  );
  expect(input.validity.customError).toBe(false);
  expect(input.validity.valid).toBe(true);
  input.setCustomValidity("Another validator's error");
  control.validate();
  input.dispatchEvent(new Event("input"));
  expect(document.querySelector(".freeform-number-error")).toBeNull();
  expect(input.validationMessage).toBe("Another validator's error");
});
