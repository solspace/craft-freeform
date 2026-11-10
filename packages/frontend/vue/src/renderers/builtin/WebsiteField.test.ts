import { afterEach, expect, it, vi } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { WebsiteFieldRenderer } from "./WebsiteField.js";

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  dispose = undefined;
});

it("keeps runtime values in sync after blur and Enter, respects external updates, and detaches on unmount", async () => {
  const blur = vi.fn();
  const props = reactive({
    field: { handle: "website", type: "website" },
    input: {
      name: "website",
      value: "example.com/Contact?ref=AbC#Team",
      onChange: (event: Event) => {
        props.input.value = (event.target as HTMLInputElement).value;
      },
      onBlur: blur,
    },
    classNames: { input: "website-input" },
    form: {
      setValue: (_handle: string, value: string) => {
        props.input.value = value;
      },
    },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    render: () =>
      h("form", { onSubmit: (event: Event) => event.preventDefault() }, [
        h(WebsiteFieldRenderer, props),
      ]),
  });
  app.mount(host);
  dispose = () => {
    app.unmount();
    host.remove();
  };
  const input = host.querySelector("input")!;
  input.dispatchEvent(new Event("blur"));
  await nextTick();
  expect(props.input.value).toBe("https://example.com/Contact?ref=AbC#Team");
  expect(input.value).toBe(props.input.value);
  expect(blur).toHaveBeenCalledOnce();
  props.input.value = "http://example.com/Other";
  await nextTick();
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("http://example.com/Other");
  props.input.value = "bad address";
  await nextTick();
  expect(input.checkValidity()).toBe(false);
  expect(input.validity.customError).toBe(true);
  props.input.value = "";
  await nextTick();
  expect(input.value).toBe("");
  expect(input.validity.customError).toBe(false);
  props.input.value = "example.org";
  await nextTick();
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  await nextTick();
  expect(props.input.value).toBe("https://example.org");
  expect(new FormData(host.querySelector("form")!).get("website")).toBe(
    "https://example.org",
  );
  dispose();
  dispose = undefined;
  input.value = "example.net";
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("example.net");
});
