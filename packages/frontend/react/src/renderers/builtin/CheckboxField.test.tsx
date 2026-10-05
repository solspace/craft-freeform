import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { CheckboxFieldRenderer } from "./CheckboxField.js";

afterEach(cleanup);

function baseProps(
  overrides: Partial<ReactFieldRendererProps> = {},
): ReactFieldRendererProps {
  return {
    field: {
      uid: "agree",
      handle: "agree",
      type: "checkbox",
      label: 'I agree to the <a href="#">terms</a>',
    },
    value: "",
    errors: [],
    input: {
      id: "agree",
      name: "agree",
      value: "",
      disabled: false,
      "aria-invalid": false,
      onBlur: () => {},
    },
    classNames: {},
    form: {
      setValue: () => {},
      isFieldEnabled: () => true,
    },
    renderLabel: () => null,
    renderInstructions: () => null,
    renderErrors: () => null,
    ...overrides,
  } as unknown as ReactFieldRendererProps;
}

it("escapes checkbox label HTML by default", () => {
  const view = render(<CheckboxFieldRenderer {...baseProps()} />);
  const span = view.container.querySelector("span")!;

  expect(span.textContent).toBe('I agree to the <a href="#">terms</a>');
  expect(span.querySelector("a")).toBeNull();
});

it("renders checkbox label HTML when allowRawHtml is enabled", () => {
  const view = render(
    <CheckboxFieldRenderer {...baseProps({ allowRawHtml: true })} />,
  );
  const link = view.container.querySelector("span a")!;

  expect(link).toBeTruthy();
  expect(link.getAttribute("href")).toBe("#");
  expect(link.textContent).toBe("terms");
});
