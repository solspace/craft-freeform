// @ts-nocheck
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { TextareaFieldRenderer } from "./TextareaField.js";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const field = (config = { autoGrow: true, rows: 3 }) => ({
  id: 1,
  uid: "message",
  handle: "message",
  type: "textarea",
  label: "Message",
  required: false,
  frontend: { config },
});

describe("Vue textarea auto grow", () => {
  it("uses configured rows and leaves values unchanged", async () => {
    const Fixture = defineComponent({
      setup() {
        const value = ref("Hello");
        return () => (
          <form>
            <TextareaFieldRenderer
              field={field()}
              value={value.value}
              classNames={{ input: "input" }}
              input={{
                id: "message",
                name: "message",
                value: value.value,
                onChange: (e) => (value.value = e.target.value),
              }}
            />
          </form>
        );
      },
    });

    const wrapper = mount(Fixture);
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("rows")).toBe("3");
    textarea.element.value = "Updated answer";
    await textarea.trigger("input");
    expect(new FormData(wrapper.element).get("message")).toBe("Updated answer");
    wrapper.unmount();
  });

  it("works together with character counts", () => {
    const wrapper = mount(TextareaFieldRenderer, {
      props: {
        field: field({
          autoGrow: true,
          autoGrowMaxHeight: 240,
          rows: 2,
          showCharacterCount: true,
        }),
        classNames: { characterCount: "muted" },
        input: { id: "message", value: "Hi" },
      },
    });
    expect(wrapper.find("textarea").attributes("rows")).toBe("2");
    expect(wrapper.text()).toBe("2 characters");
    wrapper.unmount();
  });
});
