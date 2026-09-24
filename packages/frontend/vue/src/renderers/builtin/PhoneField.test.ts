import { expect, it } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { PhoneFieldRenderer } from "./PhoneField.js";

it("writes canonical values, follows external updates and cleans up on unmount", async () => {
  const props = reactive({
    field: {
      uid: "phone",
      handle: "phone",
      type: "phone",
      frontend: {
        config: {
          international: true,
          defaultCountry: "GB",
          allowedCountries: ["GB", "US"],
        },
      },
    },
    input: { id: "phone", name: "phone", value: "", disabled: false },
    classNames: {},
    form: {
      setValue: (_handle: string, value: string) => {
        props.input.value = value;
      },
    },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({ render: () => h(PhoneFieldRenderer, props) });
  app.mount(host);
  const input = host.querySelector("input")!;
  input.value = "020 7946 0018";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await nextTick();
  expect(props.input.value).toBe("+442079460018");
  expect(input.value).toBe("020 7946 0018");
  input.dispatchEvent(new Event("blur"));
  expect(input.value).toBe("+44 20 7946 0018");
  props.input.value = "";
  await nextTick();
  expect(input.value).toBe("");
  props.input.disabled = true;
  await nextTick();
  await Promise.resolve();
  expect(host.querySelector("button")!.disabled).toBe(true);
  props.field.frontend.config.international = false;
  await nextTick();
  await nextTick();
  expect(host.querySelector("button")).toBeNull();
  app.unmount();
  host.remove();
});
