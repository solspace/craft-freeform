import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import FieldRenderer from "../components/FieldRenderer.vue";
import { defaultTheme } from "../theme/defaultTheme.js";

it.each([
  "radios",
  "checkboxes",
  "multiple-select",
  "rating",
  "opinion-scale",
  "cards",
])(
  "names %s groups and connects their descriptions and errors",
  async (type) => {
    const setValue = vi.fn();
    const field = {
      id: 1,
      uid: "choices",
      handle: "choices",
      type,
      label: "Preferences",
      required: true,
      instructions: "Choose your preferences",
      options: [
        { value: "one", label: "Premier" },
        { value: "two", label: "Deuxième" },
      ],
      frontend: {
        renderer: type,
        config: {
          cards: [
            { value: "one", label: "Premier" },
            { value: "two", label: "Deuxième" },
          ],
        },
      },
    };
    const form = {
      values: {},
      fieldErrors: { choices: ["Choose an option"] },
      isFieldVisible: () => true,
      isFieldEnabled: () => true,
      setValue,
      getFieldProps: () => ({
        id: "freeform-choices",
        name: "choices",
        required: true,
      }),
    };
    const view = mount(FieldRenderer, {
      props: { field, form, theme: defaultTheme, renderers: {} } as never,
    });
    const group = view.get("fieldset").element;
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    expect(group.firstElementChild?.textContent).toContain("Preferences");
    expect(group.firstElementChild?.hasAttribute("for")).toBe(false);
    for (const input of group.querySelectorAll("input, select")) {
      expect(input.getAttribute("aria-invalid")).toBe("true");
      for (const id of input.getAttribute("aria-describedby")!.split(" ")) {
        expect(view.find(`#${id}`).exists()).toBe(true);
      }
    }
    if (type === "multiple-select") {
      expect(view.get("select").attributes("aria-labelledby")).toBe(
        "freeform-choices-legend",
      );
    } else {
      await view.find("input").trigger("change");
      expect(setValue).toHaveBeenCalled();
    }
    expect(group.querySelector("fieldset")).toBeNull();
    view.unmount();
  },
);
