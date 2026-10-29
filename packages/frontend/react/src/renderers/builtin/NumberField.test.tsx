import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { NumberFieldRenderer } from "./NumberField.js";

afterEach(cleanup);

it("shows precise feedback after blur, keeps entered digits, and clears feedback while editing or resetting", () => {
  function Fixture() {
    const [value, setValue] = useState("");
    const [resetVersion, reset] = useState(0);
    const props = {
      field: {
        handle: "amount",
        type: "number",
        frontend: { config: { decimalCount: 2, min: 1, max: 100 } },
      },
      input: {
        name: "amount",
        value,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          setValue(event.target.value),
        "aria-describedby": "help",
      },
      errors: [],
      classNames: { errors: "errors", error: "error" },
      form: { resetVersion },
    } as unknown as ReactFieldRendererProps;
    return (
      <form noValidate>
        <NumberFieldRenderer {...props} />
        <span data-value>{value}</span>
        <button type="button" onClick={() => reset(resetVersion + 1)}>
          Reset
        </button>
      </form>
    );
  }
  const view = render(<Fixture />);
  const input = view.container.querySelector("input")!;
  expect(input.inputMode).toBe("decimal");
  expect(input.step).toBe("0.01");
  expect(input.min).toBe("1");
  fireEvent.input(input, { target: { value: "12.345" } });
  expect(view.queryByRole("status")).toBeNull();
  fireEvent.blur(input);
  const error = view.getByRole("status");
  expect(error.textContent).toBe("Use no more than 2 decimal places.");
  expect(input.value).toBe("12.345");
  expect(view.container.querySelector("[data-value]")!.textContent).toBe(
    "12.345",
  );
  expect(input.getAttribute("aria-describedby")).toBe(`help ${error.id}`);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  fireEvent.input(input, { target: { value: "12.34" } });
  expect(view.queryByRole("status")).toBeNull();
  expect(input.getAttribute("aria-describedby")).toBe("help");
  fireEvent.blur(input);
  expect(input.validity.valid).toBe(true);
  fireEvent.input(input, { target: { value: "101" } });
  fireEvent.blur(input);
  expect(view.getByRole("status").textContent).toBe(
    "Enter a number between 1 and 100.",
  );
  fireEvent.click(view.getByText("Reset"));
  expect(view.queryByRole("status")).toBeNull();
});

it("allows minus-sign access, preserves custom increments, and lets server errors replace local feedback", () => {
  const props = {
    field: {
      handle: "quantity",
      type: "number",
      frontend: {
        config: { allowNegative: true, decimalCount: 2, step: 0.25 },
      },
    },
    input: { value: "1.234", onChange: () => {} },
    errors: [],
    classNames: {},
    form: {},
  } as unknown as ReactFieldRendererProps;
  const view = render(<NumberFieldRenderer {...props} />);
  const input = view.container.querySelector("input")!;
  expect(input.inputMode).toBe("text");
  expect(input.min).toBe("");
  expect(input.step).toBe("0.25");
  fireEvent.blur(input);
  expect(view.getByRole("status")).toBeTruthy();
  view.rerender(
    <NumberFieldRenderer
      {...props}
      errors={["Server validation"]}
      input={{ ...props.input, "aria-invalid": true }}
    />,
  );
  expect(view.queryByRole("status")).toBeNull();
  expect(input.getAttribute("aria-invalid")).toBe("true");
  view.unmount();
  input.dispatchEvent(new Event("blur"));
  expect(input.validity.customError).toBe(false);
});
