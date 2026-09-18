import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, describe, expect, it } from "vitest";
import RuleHandler from "../form/rules";
import RangeHandler from "./range";

function setup() {
  document.body.innerHTML =
    '<form><div data-field-container="budget"><label for="budget">Budget</label><div class="ff-range"><input id="budget" name="budget" type="range" min="-10" max="10" step="0.5" value="0" data-freeform-range><output for="budget" hidden>0</output></div></div><div data-field-container="details"><input name="details"></div></form>';
  const form = document.querySelector("form")!;
  const input = form.querySelector("input")!;
  const freeform = { form } as Freeform;
  const handler = new RangeHandler(freeform);
  return {
    form,
    input,
    handler,
    freeform,
    output: form.querySelector("output")!,
  };
}
afterEach(() => {
  document.body.replaceChildren();
});
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("classic Range Slider", () => {
  it("updates on input and change without replacing the native field", () => {
    const { input, form, output } = setup();
    expect(output.hidden).toBe(false);
    input.value = "-2.5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(output.textContent).toBe("-2.5");
    expect(new FormData(form).get("budget")).toBe("-2.5");
    input.value = "5";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(output.textContent).toBe("5");
    input.disabled = true;
    expect(new FormData(form).has("budget")).toBe(false);
  });
  it("restores the default on reset and supports AJAX replacement", async () => {
    const { input, form, output, handler } = setup();
    input.value = "10";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.reset();
    await tick();
    expect(output.textContent).toBe("0");
    input.value = "5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.addEventListener("reset", (event) => event.preventDefault(), {
      once: true,
    });
    form.reset();
    await tick();
    expect(output.textContent).toBe("5");
    form.innerHTML =
      '<div class="ff-range"><input name="next" type="range" value="25" data-freeform-range><output hidden></output></div>';
    handler.reload();
    const next = form.querySelector("input")!;
    next.value = "30";
    next.dispatchEvent(new Event("input", { bubbles: true }));
    expect(form.querySelector("output")?.textContent).toBe("30");
  });
  it("updates conditional Rules when moved with a pointer", () => {
    const { form, input, freeform } = setup();
    // jsdom does not implement HTMLFormElement's named property getter.
    Object.defineProperty(form, "budget", { value: input });
    const data = document.createElement("div");
    data.dataset.rulesJson = JSON.stringify({
      values: {},
      rules: {
        fields: [
          {
            field: "details",
            display: "show",
            combinator: "and",
            conditions: [
              { field: "budget", operator: "greaterThan", value: "2" },
            ],
          },
        ],
        buttons: [],
      },
    });
    form.append(data);
    new RuleHandler(freeform);
    const details = form.querySelector<HTMLElement>(
      '[data-field-container="details"]',
    )!;
    expect(details.style.display).toBe("none");
    input.value = "3";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(details.style.display).toBe("");
    input.value = "0";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(details.style.display).toBe("none");
  });
});
