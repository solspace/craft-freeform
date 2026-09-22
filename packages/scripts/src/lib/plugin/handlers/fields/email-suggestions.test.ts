import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountEmailSuggestions } from "../../../../../../frontend/core/src/email/suggestions";
import EmailSuggestionsHandler from "./email-suggestions";

let dispose: (() => void) | undefined;
beforeEach(() => {
  document.body.innerHTML =
    '<form><input id="email" type="email" name="email" aria-describedby="help errors" value="Jane+sales@gmial.com" data-freeform-email-suggestions><label for="email">Email</label></form>';
});
afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.innerHTML = "";
});
function setup() {
  const input = document.querySelector("input")!;
  const control = mountEmailSuggestions(input);
  dispose = control.destroy;
  return {
    input,
    control,
    form: input.form!,
    root: document.querySelector(".freeform-email-suggestion")! as HTMLElement,
    button: document.querySelector("button")!,
  };
}
it("offers after blur and changes/submits the address only when accepted", () => {
  const { input, form, root, button } = setup();
  const changed = vi.fn();
  const typed = vi.fn();
  input.addEventListener("change", changed);
  input.addEventListener("input", typed);
  expect(root.hidden).toBe(true);
  input.dispatchEvent(new Event("blur"));
  expect(root.hidden).toBe(false);
  expect(root.textContent).toContain("Did you mean Jane+sales@gmail.com?");
  expect(new FormData(form).get("email")).toBe("Jane+sales@gmial.com");
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  expect(input.getAttribute("aria-describedby")).toMatch(
    /^help errors freeform-email-suggestion-/,
  );
  expect(root.querySelector("[role=status]")?.getAttribute("aria-live")).toBe(
    "polite",
  );
  expect(button.type).toBe("button");
  button.click();
  expect(input.value).toBe("Jane+sales@gmail.com");
  expect(new FormData(form).get("email")).toBe(input.value);
  expect(changed).toHaveBeenCalledOnce();
  expect(typed).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(input);
  expect(root.hidden).toBe(true);
  expect(input.getAttribute("aria-describedby")).toBe("help errors");
});
it("dismisses on edits/reset and refuses stale programmatic values", async () => {
  const { input, form, root, button } = setup();
  input.dispatchEvent(new Event("blur"));
  input.value = "other@company.com";
  button.click();
  expect(input.value).toBe("other@company.com");
  expect(root.hidden).toBe(true);
  input.value = "a@gmial.com";
  input.dispatchEvent(new Event("blur"));
  input.dispatchEvent(new Event("input"));
  expect(root.hidden).toBe(true);
  input.dispatchEvent(new Event("blur"));
  form.reset();
  await Promise.resolve();
  expect(root.hidden).toBe(true);
  input.dispatchEvent(new Event("blur"));
  form.addEventListener("reset", (e) => e.preventDefault());
  form.reset();
  await Promise.resolve();
  expect(root.hidden).toBe(false);
});
it("respects readonly/disabled fields, multiple values and maxlength", async () => {
  const { input, root, button } = setup();
  input.readOnly = true;
  input.dispatchEvent(new Event("blur"));
  expect(root.hidden).toBe(true);
  input.readOnly = false;
  input.value = "a@gmai.com";
  input.maxLength = 10;
  input.dispatchEvent(new Event("blur"));
  expect(root.hidden).toBe(true);
  input.removeAttribute("maxlength");
  input.dispatchEvent(new Event("blur"));
  expect(root.hidden).toBe(false);
  input.disabled = true;
  button.click();
  expect(input.value).toBe("a@gmai.com");
  await Promise.resolve();
  expect(root.hidden).toBe(true);
  input.disabled = false;
  input.multiple = true;
  input.dispatchEvent(new Event("blur"));
  expect(root.hidden).toBe(true);
});
it("renders translated text safely and removes only its own accessibility description", () => {
  const input = document.querySelector("input")!;
  const control = mountEmailSuggestions(input, {
    message: "<img src=x> {suggestion}",
    action: "<script>Accept</script>",
  });
  dispose = control.destroy;
  input.dispatchEvent(new Event("blur"));
  expect(document.querySelector(".freeform-email-suggestion img")).toBeNull();
  expect(
    document.querySelector(".freeform-email-suggestion script"),
  ).toBeNull();
  input.setAttribute(
    "aria-describedby",
    `${input.getAttribute("aria-describedby")} later-error`,
  );
  control.destroy();
  expect(input.getAttribute("aria-describedby")).toBe(
    "help errors later-error",
  );
});
it("initializes once and cleans up after AJAX replacements; ordinary emails remain unchanged", () => {
  const form = document.querySelector("form")!;
  const handler = new EmailSuggestionsHandler({ form } as Freeform);
  handler.reload();
  expect(form.querySelectorAll(".freeform-email-suggestion")).toHaveLength(1);
  const old = form.querySelector("input")!;
  form.innerHTML =
    '<input type="email" data-freeform-email-suggestions><input type="email">';
  handler.reload();
  expect(old.getAttribute("aria-describedby")).toBe("help errors");
  expect(form.querySelectorAll(".freeform-email-suggestion")).toHaveLength(1);
  form.innerHTML = "";
  handler.reload();
});
