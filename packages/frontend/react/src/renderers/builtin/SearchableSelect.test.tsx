import { fireEvent, render } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { MultipleSelectFieldRenderer } from "./MultipleSelectField.js";
import { SelectFieldRenderer } from "./SelectField.js";

function fixture(enabled: boolean, multiple: boolean, blur: () => void) {
  return function Fixture() {
    const [value, setValue] = useState<string | string[]>(multiple ? [] : "");
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
      value,
      errors: [],
      classNames: { input: value.length ? "changed" : "initial" },
      input: {
        name: "drink",
        value,
        required: true,
        onBlur: blur,
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
          setValue(event.target.value),
      },
      form: { setValue: (_handle: string, next: string[]) => setValue(next) },
    } as unknown as ReactFieldRendererProps;
    const Renderer = multiple
      ? MultipleSelectFieldRenderer
      : SelectFieldRenderer;
    return (
      <form>
        <Renderer {...props} />
        <output>{JSON.stringify(value)}</output>
        <button
          type="button"
          onClick={() => setValue(multiple ? ["cafe", "tea"] : "tea")}
        >
          Set externally
        </button>
      </form>
    );
  };
}

describe("React searchable fields", () => {
  it("keeps ordinary selects when search is off", () => {
    const Fixture = fixture(false, false, vi.fn());
    const view = render(<Fixture />);
    expect(view.container.querySelector(".ff-searchable")).toBeNull();
    expect(view.container.querySelector("select")?.tabIndex).toBe(0);
    view.unmount();
  });
  it.each([false, true])(
    "handles controlled updates, blur, and StrictMode cleanup (multiple=%s)",
    (multiple) => {
      const blur = vi.fn();
      const Fixture = fixture(true, multiple, blur);
      const view = render(
        <StrictMode>
          <Fixture />
        </StrictMode>,
      );
      expect(view.container.querySelectorAll(".ff-searchable")).toHaveLength(1);
      const input = view.getByRole("combobox") as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: "cafe" } });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(view.container.querySelector("output")?.textContent).toBe(
        multiple ? '["cafe"]' : '"cafe"',
      );
      expect(
        view.container
          .querySelector("select")
          ?.classList.contains("ff-searchable-native"),
      ).toBe(true);
      fireEvent.blur(input);
      expect(blur).toHaveBeenCalled();
      fireEvent.click(view.getByText("Set externally"));
      if (multiple)
        expect(view.getByRole("button", { name: "Remove Tea" })).toBeTruthy();
      else expect(input.value).toBe("Tea");
      if (multiple)
        expect(
          Array.from(
            view.container.querySelector("select")!.selectedOptions,
          ).map((option) => option.value),
        ).toEqual(["cafe", "tea"]);
      view.unmount();
      expect(view.container.querySelector(".ff-searchable")).toBeNull();
    },
  );
});
