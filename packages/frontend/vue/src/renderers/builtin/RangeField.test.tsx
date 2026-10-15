import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { RangeFieldRenderer } from "./RangeField.js";

const field = {
  id: 1,
  uid: "budget",
  handle: "budget",
  type: "range",
  label: "Budget",
  defaultValue: 0,
  frontend: { config: { min: -5, max: 5, step: 0.5 } },
};
function props(value: unknown, input = {}) {
  return {
    field,
    value,
    input: { id: "budget", name: "budget", ...input },
    classNames: { input: "theme-input" },
  } as unknown as VueFieldRendererProps;
}

describe("Vue Range Slider", () => {
  it("updates during input and submits the numeric option value", async () => {
    const Fixture = defineComponent({
      setup() {
        const value = ref("0");
        return () => (
          <form>
            <RangeFieldRenderer
              {...props(value.value, {
                onChange: (event: Event) => {
                  value.value = (event.target as HTMLInputElement).value;
                },
              })}
            />
          </form>
        );
      },
    });
    const wrapper = mount(Fixture, { attachTo: document.body });
    const input = wrapper.get("input");
    const element = input.element as HTMLInputElement;
    expect(element.min).toBe("-5");
    expect(element.max).toBe("5");
    expect(element.step).toBe("0.5");
    element.value = "-2.5";
    await input.trigger("input");
    expect(wrapper.get("output").text()).toBe("-2.5");
    expect(new FormData(element.form!).get("budget")).toBe("-2.5");
    wrapper.unmount();
  });
  it("reflects externally updated values, blur, and error attributes", async () => {
    const blur = vi.fn();
    const wrapper = mount(RangeFieldRenderer, {
      props: props(0, {
        disabled: true,
        "aria-invalid": true,
        "aria-describedby": "error",
        onBlur: blur,
      }),
    });
    expect((wrapper.get("input").element as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(wrapper.get("input").attributes("aria-describedby")).toBe("error");
    await wrapper.setProps(props(3, { onBlur: blur }));
    expect(wrapper.get("output").text()).toBe("3");
    await wrapper.get("input").trigger("blur");
    expect(blur).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
