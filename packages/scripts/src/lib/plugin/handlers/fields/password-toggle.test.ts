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
  expect(button.getAttribute("aria-label")).toBe("Show password");
  expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  expect(button.dataset.passwordVisible).toBe("false");
  button.click();
  expect(input.type).toBe("text");
  expect(button.getAttribute("aria-label")).toBe("Hide password");
  expect(button.title).toBe("Hide password");
  expect(button.dataset.passwordVisible).toBe("true");
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
it("respects canceled resets and disabled inputs and treats translated labels as plain text", async () => {
  const { form, input, button, handler } = setup();
  input.dataset.passwordShowLabel = "<img src=x onerror=alert(1)>";
  handler.reload();
  expect(button.querySelector("img")).toBeNull();
  expect(button.getAttribute("aria-label")).toBe(
    "<img src=x onerror=alert(1)>",
  );
  expect(button.title).toBe("<img src=x onerror=alert(1)>");
  expect(button.querySelectorAll("svg")).toHaveLength(1);
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
it("positions the icon against the input rather than the surrounding labels and errors", () => {
  const { input, button, handler } = setup();
  Object.defineProperties(input, {
    offsetLeft: { configurable: true, value: 12 },
    offsetTop: { configurable: true, value: 40 },
    offsetWidth: { configurable: true, value: 300 },
    offsetHeight: { configurable: true, value: 44 },
  });
  handler.reload();
  expect(button.style.left).toBe("308px");
  expect(button.style.top).toBe("62px");
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  Object.defineProperty(input, "offsetWidth", { value: 200 });
  window.dispatchEvent(new Event("resize"));
  expect(button.style.left).toBe("208px");
});
it("does not add controls to existing password fields", () => {
  document.body.innerHTML = '<form><input type="password"></form>';
  new PasswordToggleHandler({
    form: document.querySelector("form"),
  } as Freeform);
  expect(document.querySelector("button")).toBeNull();
});
