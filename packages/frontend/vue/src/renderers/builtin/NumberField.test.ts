import { afterEach, expect, it } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { NumberFieldRenderer } from "./NumberField.js";

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
});

it("preserves controlled edits, shows feedback after blur, and clears on reset and server responses", async () => {
  const props = reactive({
    field: {
      handle: "amount",
      type: "number",
      frontend: { config: { decimalCount: 2, min: 1, max: 100 } },
    },
    input: {
      name: "amount",
      value: "",
      "aria-describedby": "help",
      onChange: (event: Event) => {
        props.input.value = (event.target as HTMLInputElement).value;
      },
    },
    errors: [] as string[],
    classNames: { errors: "errors", error: "error" },
    form: { resetVersion: 0 },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    render: () => h("form", [h(NumberFieldRenderer, props)]),
  });
  app.mount(host);
  dispose = () => {
    app.unmount();
    host.remove();
  };
  const input = host.querySelector("input")!;
  expect(input.inputMode).toBe("decimal");
  expect(input.step).toBe("0.01");
  input.value = "12.345";
  input.dispatchEvent(new Event("input"));
  await nextTick();
  expect(host.querySelector('[role="status"]')).toBeNull();
  input.dispatchEvent(new Event("blur"));
  await nextTick();
  expect(host.querySelector('[role="status"]')!.textContent).toBe(
    "Use no more than 2 decimal places.",
  );
  expect(input.value).toBe("12.345");
  expect(props.input.value).toBe("12.345");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  input.value = "12.34";
  input.dispatchEvent(new Event("input"));
  await nextTick();
  expect(input.value).toBe("12.34");
  expect(props.input.value).toBe("12.34");
  expect(host.querySelector('[role="status"]')).toBeNull();
  input.dispatchEvent(new Event("blur"));
  expect(input.validity.valid).toBe(true);
  props.input.value = "101";
  await nextTick();
  input.dispatchEvent(new Event("blur"));
  await nextTick();
  expect(host.querySelector('[role="status"]')!.textContent).toBe(
    "Enter a number between 1 and 100.",
  );
  props.errors = ["Server validation"];
  await nextTick();
  expect(host.querySelector('[role="status"]')).toBeNull();
  props.errors = [];
  await nextTick();
  input.dispatchEvent(new Event("blur"));
  await nextTick();
  props.form.resetVersion++;
  await nextTick();
  expect(host.querySelector('[role="status"]')).toBeNull();
  dispose();
  dispose = undefined;
  input.dispatchEvent(new Event("blur"));
  expect(input.validity.customError).toBe(false);
});
