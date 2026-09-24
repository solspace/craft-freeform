import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { PhoneFieldRenderer } from "./PhoneField.js";

afterEach(cleanup);
it("writes canonical values to the form while preserving editable text and follows reset", () => {
  function Fixture() {
    const [value, setValue] = useState("");
    const props = {
      field: {
        uid: "phone",
        handle: "phone",
        type: "phone",
        frontend: {
          config: {
            international: true,
            defaultCountry: "GB",
            allowedCountries: ["GB", "US"],
          },
        },
      },
      input: { id: "phone", name: "phone", value },
      classNames: {},
      form: { setValue: (_handle: string, next: string) => setValue(next) },
    } as unknown as ReactFieldRendererProps;
    return (
      <>
        <PhoneFieldRenderer {...props} />
        <output>{value}</output>
        <button type="button" onClick={() => setValue("")}>
          Reset
        </button>
      </>
    );
  }
  const view = render(<Fixture />);
  const input = view.container.querySelector("input")!;
  fireEvent.input(input, { target: { value: "020 7946 0018" } });
  expect(view.container.querySelector("output")!.textContent).toBe(
    "+442079460018",
  );
  expect(input.value).toBe("020 7946 0018");
  fireEvent.blur(input);
  expect(input.value).toBe("+44 20 7946 0018");
  fireEvent.click(view.getByText("Reset"));
  expect(input.value).toBe("");
  view.unmount();
  expect(view.container.querySelector(".freeform-phone-country")).toBeNull();
});
it("keeps the existing renderer when opted out and supports switching on", () => {
  const props = {
    field: { uid: "phone", handle: "phone", type: "phone" },
    input: { value: "555", onChange: () => {} },
    classNames: {},
    form: { setValue: () => {} },
  } as unknown as ReactFieldRendererProps;
  const view = render(<PhoneFieldRenderer {...props} />);
  expect(view.container.querySelector("button")).toBeNull();
  view.rerender(
    <PhoneFieldRenderer
      {...props}
      field={{
        ...props.field,
        frontend: {
          config: {
            international: true,
            defaultCountry: "US",
            allowedCountries: ["US"],
          },
        },
      }}
    />,
  );
  expect(view.container.querySelector("button")).toBeTruthy();
});
