import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
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
  } as unknown as ReactFieldRendererProps;
}

describe("React Range Slider", () => {
  it("updates its value continuously and preserves the native submitted value", () => {
    function Fixture() {
      const [value, setValue] = useState("0");
      return (
        <form>
          <label htmlFor="budget">Budget</label>
          <RangeFieldRenderer
            {...props(value, {
              value,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                setValue(event.target.value),
            })}
          />
        </form>
      );
    }
    const view = render(<Fixture />);
    const input = view.getByRole("slider", {
      name: "Budget",
    }) as HTMLInputElement;
    expect(input.min).toBe("-5");
    expect(input.max).toBe("5");
    expect(input.step).toBe("0.5");
    expect(input.classList.contains("theme-input")).toBe(true);
    fireEvent.input(input, { target: { value: "2.5" } });
    expect(view.container.querySelector("output")?.textContent).toBe("2.5");
    expect(new FormData(input.form!).get("budget")).toBe("2.5");
    view.unmount();
  });
  it("reflects external updates, disabled state and accessible errors", () => {
    const blur = vi.fn();
    const view = render(
      <RangeFieldRenderer
        {...props(0, {
          disabled: true,
          "aria-invalid": true,
          "aria-describedby": "error",
          onBlur: blur,
        })}
      />,
    );
    const input = view.getByRole("slider") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe("error");
    expect(view.container.querySelector("output")?.textContent).toBe("0");
    view.rerender(<RangeFieldRenderer {...props(-2.5, { onBlur: blur })} />);
    expect(input.value).toBe("-2.5");
    expect(view.container.querySelector("output")?.textContent).toBe("-2.5");
    fireEvent.blur(input);
    expect(blur).toHaveBeenCalledOnce();
    view.unmount();
  });
});
