import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountWebsite } from "../../../../../../frontend/core/src/website/website";
import WebsiteHandler from "./website";

let dispose: (() => void) | undefined;
beforeEach(() => {
  document.body.innerHTML =
    '<form><input id="website" type="url" name="website" data-freeform-website aria-describedby="help" maxlength="200"><input name="notes"><button><span>Submit</span></button></form>';
});
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.innerHTML = "";
});
function setup() {
  const input = document.querySelector<HTMLInputElement>("#website")!;
  const controller = mountWebsite(input);
  dispose = controller.destroy;
  return { input, form: input.form! };
}

it("completes on blur without modifying the value while typing, notifying form bindings and rules", () => {
  const { input, form } = setup();
  const changes = vi.fn();
  const rules = vi.fn();
  input.addEventListener("change", changes);
  input.addEventListener("keyup", rules);
  input.value = "example.com/Contact?ref=AbC#Team";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  expect(input.value).toBe("example.com/Contact?ref=AbC#Team");
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("https://example.com/Contact?ref=AbC#Team");
  expect(new FormData(form).get("website")).toBe(input.value);
  expect(input.checkValidity()).toBe(true);
  expect(input.getAttribute("aria-describedby")).toBe("help");
  expect(input.maxLength).toBe(200);
  expect(changes).toHaveBeenCalledOnce();
  expect(rules).toHaveBeenCalledOnce();
});

it.each(["click", "enter", "submit"])(
  "normalizes before %s submission without requiring a blur",
  (method) => {
    const { input, form } = setup();
    input.value = "example.com";
    const submitted = vi.fn((event: Event) => {
      event.preventDefault();
      expect(new FormData(form).get("website")).toBe("https://example.com");
    });
    form.addEventListener("submit", submitted);
    if (method === "click") form.querySelector("span")!.click();
    if (method === "enter") {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      form.requestSubmit();
    }
    if (method === "submit")
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    expect(submitted).toHaveBeenCalledOnce();
  },
);

it("keeps malformed input editable, clears its translated error after editing and respects other validators", () => {
  const { input } = setup();
  input.dataset.websiteError = "Voer een websiteadres in, zoals example.com.";
  input.value = "bad address";
  expect(input.checkValidity()).toBe(false);
  expect(input.validationMessage).toBe(input.dataset.websiteError);
  input.value = "example.com";
  input.dispatchEvent(new Event("input"));
  expect(input.validity.customError).toBe(false);
  input.dispatchEvent(new Event("blur"));
  expect(input.checkValidity()).toBe(true);
  input.setCustomValidity("Custom validation");
  input.dispatchEvent(new Event("input"));
  input.dispatchEvent(new Event("blur"));
  expect(input.validationMessage).toBe("Custom validation");
});

it("preserves disabled and readonly inputs, required constraints and form resets", () => {
  const { input, form } = setup();
  input.value = "example.com";
  input.readOnly = true;
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("example.com");
  input.readOnly = false;
  input.disabled = true;
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("example.com");
  input.disabled = false;
  input.value = "bad address";
  input.checkValidity();
  form.reset();
  expect(input.value).toBe("");
  expect(input.validity.customError).toBe(false);
  input.required = true;
  expect(input.checkValidity()).toBe(false);
  expect(input.validity.valueMissing).toBe(true);
});

it("initializes once, leaves ordinary inputs alone and detaches replaced controls and their form listeners", () => {
  const form = document.querySelector("form")!;
  const handler = new WebsiteHandler({ form } as Freeform);
  handler.reload();
  const input = form.querySelector("input")!;
  const rules = vi.fn();
  input.addEventListener("keyup", rules);
  input.value = "example.com";
  input.dispatchEvent(new Event("blur"));
  expect(rules).toHaveBeenCalledOnce();
  const notes = form.querySelector<HTMLInputElement>('[name="notes"]')!;
  notes.value = "example.com";
  notes.dispatchEvent(new Event("blur"));
  expect(notes.value).toBe("example.com");
  form.innerHTML =
    '<input type="url" name="website" data-freeform-website><button>Submit</button>';
  handler.reload();
  input.value = "example.com";
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("example.com");
  form.addEventListener("submit", (event) => event.preventDefault());
  form.querySelector("input")!.value = "example.org";
  form.querySelector("button")!.click();
  expect(input.value).toBe("example.com");
  expect(form.querySelector("input")!.value).toBe("https://example.org");
  form.innerHTML = "";
  handler.reload();
});
