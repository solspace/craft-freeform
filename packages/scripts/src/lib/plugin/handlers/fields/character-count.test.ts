import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, describe, expect, it } from "vitest";
import CharacterCountHandler from "./character-count";

function setup() {
  document.body.innerHTML =
    '<form><textarea id="message" name="message" maxlength="5" data-freeform-character-count aria-describedby="help error">é</textarea><label for="message">Message</label><p id="help">Help</p><div id="error">Error</div></form>';
  const form = document.querySelector("form")!;
  const input = form.querySelector("textarea")!;
  const handler = new CharacterCountHandler({ form } as Freeform);
  const counter = () =>
    form.querySelector<HTMLElement>(".freeform-character-count")!;
  return { form, input, handler, counter };
}
afterEach(() => document.body.replaceChildren());
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
describe("classic character counters", () => {
  it("updates text safely, preserves floating labels and existing descriptions", () => {
    const { input, counter, handler } = setup();
    expect(counter().textContent).toBe("1 / 5 characters");
    expect(input.nextElementSibling?.tagName).toBe("LABEL");
    expect(input.getAttribute("aria-describedby")).toBe(
      `help error ${counter().id}`,
    );
    expect(counter().getAttribute("aria-live")).toBe("off");
    input.value = "😀hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(counter().textContent).toBe("7 / 5 characters");
    expect(counter().dataset.overLimit).toBe("true");
    expect(new FormData(input.form!).get("message")).toBe("😀hello");
    input.dataset.characterCountLimitMessage = "<img src=x> {count} / {limit}";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(counter().querySelector("img")).toBeNull();
    handler.reload();
    expect(document.querySelectorAll(".freeform-character-count")).toHaveLength(
      1,
    );
  });
  it("handles reset, canceled reset, AJAX replacement and unlimited values", async () => {
    const { form, input, counter, handler } = setup();
    input.value = "hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.reset();
    await tick();
    expect(counter().textContent).toBe("1 / 5 characters");
    input.value = "hi";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.addEventListener("reset", (e) => e.preventDefault(), { once: true });
    form.reset();
    await tick();
    expect(counter().textContent).toBe("2 / 5 characters");
    form.innerHTML =
      '<input name="other" data-freeform-character-count data-character-count-message="{count} Zeichen" value="abc"><input name="off">';
    handler.reload();
    expect(counter().textContent).toBe("3 Zeichen");
    expect(form.querySelectorAll(".freeform-character-count")).toHaveLength(1);
  });
  it("uses unique associations for multiple forms and does not change disabled controls", () => {
    const { form, input, counter } = setup();
    input.disabled = true;
    const copy = form.cloneNode(true) as HTMLFormElement;
    copy.querySelector(".freeform-character-count")?.remove();
    copy.querySelector("textarea")?.removeAttribute("aria-describedby");
    document.body.append(copy);
    new CharacterCountHandler({ form: copy } as Freeform);
    expect(copy.querySelector(".freeform-character-count")?.id).not.toBe(
      counter().id,
    );
    expect(input.disabled).toBe(true);
    expect(new FormData(form).has("message")).toBe(false);
  });
});
