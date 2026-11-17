import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { defaultTheme } from "../theme/defaultTheme.js";
import type { FreeformRuntime } from "../types.js";
import { FieldRenderer } from "./FieldRenderer.js";

afterEach(cleanup);

it.each([
  "radios",
  "checkboxes",
  "multiple-select",
  "rating",
  "opinion-scale",
  "cards",
])("names %s groups and connects their descriptions and errors", (type) => {
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
  } as unknown as FreeformRuntime;
  const view = render(
    <FieldRenderer
      field={field}
      form={form}
      theme={defaultTheme}
      renderers={{}}
    />,
  );
  const group = view.getByRole("group", { name: "Preferences" });
  expect(group.tagName).toBe("FIELDSET");
  expect(group.firstElementChild?.tagName).toBe("LEGEND");
  expect(group.firstElementChild?.hasAttribute("for")).toBe(false);
  for (const input of group.querySelectorAll("input, select")) {
    expect(input.getAttribute("aria-invalid")).toBe("true");
    for (const id of input.getAttribute("aria-describedby")!.split(" ")) {
      expect(view.container.querySelector(`#${id}`)).not.toBeNull();
    }
  }
  if (type === "multiple-select") {
    expect(view.getByRole("listbox", { name: "Preferences" })).toBeTruthy();
  } else {
    const input = view.getByRole(
      type === "checkboxes" || type === "cards" ? "checkbox" : "radio",
      { name: "Premier" },
    );
    fireEvent.click(input);
    expect(setValue).toHaveBeenCalled();
  }
  expect(group.querySelector("fieldset")).toBeNull();
});
