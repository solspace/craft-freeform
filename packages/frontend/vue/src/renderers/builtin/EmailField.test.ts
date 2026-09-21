import { expect, it } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { EmailFieldRenderer } from "./EmailField.js";

it("offers on blur, updates the runtime only on acceptance, follows external values and cleans up", async () => {
  const props = reactive({
    field: {
      uid: "email",
      handle: "email",
      type: "email",
      frontend: { config: { suggestEmailCorrections: true } },
    },
    input: {
      id: "email",
      name: "email",
      value: "Jane+sales@gmial.com",
      onChange: (e: Event) => {
        props.input.value = (e.target as HTMLInputElement).value;
      },
    },
    classNames: {},
    form: {
      setValue: (_handle: string, value: string) => {
        props.input.value = value;
      },
    },
  });

  const host = document.createElement("div");
  document.body.append(host);

  const app = createApp({ render: () => h(EmailFieldRenderer, props) });
  app.mount(host);

  const input = host.querySelector("input")!;
  input.dispatchEvent(new Event("blur"));
  await nextTick();

  expect(props.input.value).toBe("Jane+sales@gmial.com");
  expect(
    host.querySelector<HTMLElement>(".freeform-email-suggestion")!.hidden,
  ).toBe(false);

  host.querySelector("button")!.click();
  await nextTick();

  expect(props.input.value).toBe("Jane+sales@gmail.com");
  expect(input.value).toBe("Jane+sales@gmail.com");

  props.input.value = "a@gmial.com";
  await nextTick();
  input.dispatchEvent(new Event("blur"));
  props.input.value = "";
  await nextTick();

  expect(
    host.querySelector<HTMLElement>(".freeform-email-suggestion")!.hidden,
  ).toBe(true);

  props.field.frontend.config.suggestEmailCorrections = false;
  await nextTick();

  expect(host.querySelector(".freeform-email-suggestion")).toBeNull();

  app.unmount();
  host.remove();
});
