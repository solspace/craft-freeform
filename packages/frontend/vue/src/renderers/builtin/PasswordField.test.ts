import { expect, it } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import { PasswordFieldRenderer } from "./PasswordField.js";

it("toggles, remasks on reset/clear, and supports opting out", async () => {
  const props = reactive({
    field: {
      uid: "pw",
      type: "password",
      frontend: { config: { showPasswordToggle: true } },
    },
    input: { id: "pw", name: "password", value: "secret", disabled: false },
    classNames: {},
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    render: () => h("form", [h(PasswordFieldRenderer, props)]),
  });
  app.mount(host);
  const input = host.querySelector("input")!;
  host.querySelector("button")!.click();
  await nextTick();
  expect(input.type).toBe("text");
  expect(input.value).toBe("secret");
  expect(host.querySelector("button")!.textContent).toBe("Hide password");
  host.querySelector("form")!.reset();
  await Promise.resolve();
  await nextTick();
  expect(input.type).toBe("password");
  host.querySelector("button")!.click();
  await nextTick();
  props.input.value = "";
  props.input.disabled = true;
  await nextTick();
  expect(input.type).toBe("password");
  expect(host.querySelector("button")!.disabled).toBe(true);
  props.field.frontend.config.showPasswordToggle = false;
  await nextTick();
  expect(host.querySelector("button")).toBeNull();
  app.unmount();
  host.remove();
});
