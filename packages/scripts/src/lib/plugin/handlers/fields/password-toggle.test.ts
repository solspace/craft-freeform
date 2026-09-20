import type Freeform from "@components/front-end/plugin/freeform";
import { beforeEach, expect, it } from "vitest";
import PasswordToggleHandler from "./password-toggle";

beforeEach(() => {
  document.body.innerHTML = "";
});
function setup() {
  document.body.innerHTML = `<form><input id="pw" name="password" type="password" value="secret" data-freeform-password-toggle aria-describedby="help"><label for="pw">Password</label></form>`;
  const form = document.querySelector("form")!;
  const handler = new PasswordToggleHandler({ form } as Freeform);
  return {
    form,
    handler,
    input: form.querySelector("input")!,
    button: form.querySelector("button")!,
  };
}
it("preserves the value, floating label, accessibility links and submission", () => {
  const { form, input, button } = setup();
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  expect(button.type).toBe("button");
  expect(button.getAttribute("aria-controls")).toBe(input.id);
  button.click();
  expect(input.type).toBe("text");
  expect(button.textContent).toBe("Hide password");
  expect(input.getAttribute("aria-describedby")).toBe("help");
  expect(new FormData(form).get("password")).toBe("secret");
  button.click();
  expect(input.type).toBe("password");
});
it("remasks on reset and AJAX reload without duplicate controls", async () => {
  const { form, input, button, handler } = setup();
  button.click();
  form.reset();
  await Promise.resolve();
  expect(input.type).toBe("password");
  button.click();
  handler.reload();
  expect(input.type).toBe("password");
  expect(form.querySelectorAll("button")).toHaveLength(1);
  form.innerHTML = '<input type="password" data-freeform-password-toggle>';
  handler.reload();
  expect(form.querySelectorAll("button")).toHaveLength(1);
  expect(form.querySelector("input")!.id).toBeTruthy();
});
it("respects canceled resets and disabled inputs and renders labels as text", async () => {
  const { form, input, button, handler } = setup();
  input.dataset.passwordShowLabel = "<img src=x onerror=alert(1)>";
  handler.reload();
  expect(button.children).toHaveLength(0);
  button.click();
  form.addEventListener("reset", (e) => e.preventDefault());
  form.reset();
  await Promise.resolve();
  expect(input.type).toBe("text");
  input.disabled = true;
  await Promise.resolve();
  expect(button.disabled).toBe(true);
  button.click();
  expect(input.type).toBe("text");
});
it("does not add controls to existing password fields", () => {
  document.body.innerHTML = '<form><input type="password"></form>';
  new PasswordToggleHandler({
    form: document.querySelector("form"),
  } as Freeform);
  expect(document.querySelector("button")).toBeNull();
});
