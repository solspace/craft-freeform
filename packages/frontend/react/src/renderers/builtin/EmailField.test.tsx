import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { EmailFieldRenderer } from "./EmailField.js";

afterEach(cleanup);

it("keeps controlled values unchanged until acceptance and clears on external updates", () => {
  function Fixture() {
    const [value, setValue] = useState("Jane+sales@gmial.com");

    const props = {
      field: {
        uid: "email",
        handle: "email",
        type: "email",
        frontend: { config: { suggestEmailCorrections: true } },
      },
      input: {
        id: "email",
        name: "email",
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value),
      },
      classNames: {},
      form: { setValue: (_handle: string, value: string) => setValue(value) },
    } as unknown as ReactFieldRendererProps;

    return (
      <form>
        <EmailFieldRenderer {...props} />
        <output>{value}</output>
        <button type="button" onClick={() => setValue("")}>
          Clear
        </button>
      </form>
    );
  }

  const view = render(<Fixture />);
  const input = view.container.querySelector("input")!;

  fireEvent.blur(input);

  expect(view.getByRole("button", { name: "Use suggestion" })).toBeTruthy();
  expect(view.container.querySelector("output")!.textContent).toBe(
    "Jane+sales@gmial.com",
  );

  fireEvent.click(view.getByRole("button", { name: "Use suggestion" }));

  expect(view.container.querySelector("output")!.textContent).toBe(
    "Jane+sales@gmail.com",
  );
  expect(input.value).toBe("Jane+sales@gmail.com");

  fireEvent.change(input, { target: { value: "a@gmial.com" } });
  fireEvent.blur(input);
  fireEvent.click(view.getByText("Clear"));

  expect(view.queryByRole("button", { name: "Use suggestion" })).toBeNull();
});

it("is opt-in and cleans up when disabled in configuration", () => {
  const props = {
    field: { uid: "email", handle: "email", type: "email" },
    input: { value: "a@gmial.com", onChange: () => {} },
    classNames: {},
    form: { setValue: () => {} },
  } as unknown as ReactFieldRendererProps;

  const view = render(<EmailFieldRenderer {...props} />);

  expect(view.container.querySelector(".freeform-email-suggestion")).toBeNull();

  view.rerender(
    <EmailFieldRenderer
      {...props}
      field={{
        ...props.field,
        frontend: { config: { suggestEmailCorrections: true } },
      }}
    />,
  );
  fireEvent.blur(view.container.querySelector("input")!);

  expect(view.getByRole("button")).toBeTruthy();

  view.rerender(<EmailFieldRenderer {...props} />);

  expect(view.container.querySelector(".freeform-email-suggestion")).toBeNull();
});
