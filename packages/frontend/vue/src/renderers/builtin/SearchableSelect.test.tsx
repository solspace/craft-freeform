import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import type { VueFieldRendererProps } from "../../types.js";
import { MultipleSelectFieldRenderer } from "./MultipleSelectField.js";
import { SelectFieldRenderer } from "./SelectField.js";

function fixture(enabled: boolean, multiple: boolean, blur: () => void) {
  return defineComponent({
    setup() {
      const value = ref<string | string[]>(multiple ? [] : "");
      return () => {
        const props = {
          field: {
            id: 1,
            uid: "drink",
            handle: "drink",
            type: "dropdown",
            label: "Drink",
            placeholder: "Choose",
            required: true,
            options: [
              { label: "Café", value: "cafe" },
              { label: "Tea", value: "tea" },
            ],
            frontend: { config: { searchable: { enabled } } },
          },
          value: value.value,
          errors: [],
          classNames: { input: value.value.length ? "changed" : "initial" },
          input: {
            name: "drink",
            value: value.value,
            required: true,
            onBlur: blur,
            onChange: (event: Event) => {
              value.value = (event.target as HTMLSelectElement).value;
            },
          },
          form: {
            setValue: (_handle: string, next: string[]) => {
              value.value = next;
            },
          },
        } as unknown as VueFieldRendererProps;
        const Renderer = multiple
          ? MultipleSelectFieldRenderer
          : SelectFieldRenderer;
        return (
          <form>
            <Renderer {...props} />
            <output>{JSON.stringify(value.value)}</output>
            <button
              type="button"
              onClick={() => {
                value.value = multiple ? ["cafe", "tea"] : "tea";
              }}
            >
              Set externally
            </button>
          </form>
        );
      };
    },
  });
}

describe("Vue searchable fields", () => {
  it("keeps ordinary selects when search is off", () => {
    const wrapper = mount(fixture(false, false, vi.fn()), {
      attachTo: document.body,
    });
    expect(wrapper.find(".ff-searchable").exists()).toBe(false);
    wrapper.unmount();
  });
  it.each([false, true])(
    "syncs selection, external updates and cleanup (multiple=%s)",
    async (multiple) => {
      const blur = vi.fn();
      const wrapper = mount(fixture(true, multiple, blur), {
        attachTo: document.body,
      });
      const input = wrapper.get('input[role="combobox"]');
      await input.trigger("focus");
      await input.setValue("cafe");
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "Enter" });
      expect(wrapper.get("output").text()).toBe(
        multiple ? '["cafe"]' : '"cafe"',
      );
      expect(wrapper.get("select").classes()).toContain("ff-searchable-native");
      await input.trigger("focusout");
      expect(blur).toHaveBeenCalled();
      await wrapper.get("form > button").trigger("click");
      await nextTick();
      if (multiple)
        expect(wrapper.find('[aria-label="Remove Tea"]').exists()).toBe(true);
      else expect((input.element as HTMLInputElement).value).toBe("Tea");
      if (multiple)
        expect(
          Array.from(
            (wrapper.get("select").element as HTMLSelectElement)
              .selectedOptions,
          ).map((option) => option.value),
        ).toEqual(["cafe", "tea"]);
      wrapper.unmount();
      expect(document.querySelector(".ff-searchable")).toBeNull();
    },
  );
});
