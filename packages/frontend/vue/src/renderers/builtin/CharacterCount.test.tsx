// @ts-nocheck
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { TextareaFieldRenderer } from "./TextareaField.js";
import { TextFieldRenderer } from "./TextField.js";

const field = (type) => ({
  id: 1,
  uid: "message",
  handle: "message",
  type,
  label: "Message",
  required: false,
  frontend: { config: { showCharacterCount: true } },
  validation: { maxLength: 5 },
});
describe("Vue character counters", () => {
  it.each(["text", "textarea"])(
    "updates %s on input before blur",
    async (type) => {
      const Renderer =
        type === "text" ? TextFieldRenderer : TextareaFieldRenderer;
      const Fixture = defineComponent({
        setup() {
          const value = ref("é");
          return () => (
            <form>
              <Renderer
                field={field(type)}
                value={value.value}
                classNames={{ characterCount: "muted" }}
                input={{
                  id: "message",
                  name: "message",
                  value: value.value,
                  "aria-describedby": "help",
                  onChange: (e) => (value.value = e.target.value),
                }}
              />
            </form>
          );
        },
      });
      const wrapper = mount(Fixture);
      const input = wrapper.find(type === "text" ? "input" : "textarea");
      expect(input.attributes("aria-describedby")).toBe(
        "help message-character-count",
      );
      expect(input.element.maxLength).toBe(5);
      input.element.value = "😀abc";
      await input.trigger("input");
      expect(wrapper.text()).toBe("5 / 5 characters");
      expect(wrapper.find('[aria-live="off"]').exists()).toBe(true);
      expect(new FormData(wrapper.element).get("message")).toBe("😀abc");
      wrapper.unmount();
    },
  );
  it("follows external resets and the optional setting", async () => {
    const wrapper = mount(TextFieldRenderer, {
      props: {
        field: field("text"),
        classNames: { characterCount: "muted", characterCountError: "error" },
        input: { id: "message", value: "toolong", disabled: true },
      },
    });
    expect(wrapper.find(".error").text()).toBe("7 / 5 characters");
    await wrapper.setProps({
      input: { id: "message", value: "", disabled: true },
    });
    expect(wrapper.find(".muted").text()).toBe("0 / 5 characters");
    await wrapper.setProps({
      field: { ...field("text"), frontend: undefined },
    });
    expect(wrapper.find("[aria-live]").exists()).toBe(false);
    wrapper.unmount();
  });
});
