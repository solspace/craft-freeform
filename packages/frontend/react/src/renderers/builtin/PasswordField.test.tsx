import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { PasswordFieldRenderer } from "./PasswordField.js";

afterEach(cleanup);
const props = {
  field: {
    uid: "pw",
    type: "password",
    frontend: { config: { showPasswordToggle: true } },
  },
  input: { id: "pw", name: "password", value: "secret", onChange: () => {} },
  classNames: {},
} as unknown as ReactFieldRendererProps;
it("toggles without changing the submitted password, and remasks on reset", async () => {
  const view = render(
    <form>
      <PasswordFieldRenderer {...props} />
    </form>,
  );
  const input = view.container.querySelector("input")!;
  fireEvent.click(view.getByRole("button", { name: "Show password" }));
  expect(input.type).toBe("text");
  expect(input.value).toBe("secret");
  expect(
    view
      .getByRole("button", { name: "Hide password" })
      .getAttribute("aria-controls"),
  ).toBe("pw");
  await act(async () => {
    view.container.querySelector("form")!.reset();
  });
  expect(input.type).toBe("password");
});
it("is opt-in and respects disabled and cleared values", () => {
  const view = render(<PasswordFieldRenderer {...props} />);
  fireEvent.click(view.getByRole("button"));
  view.rerender(
    <PasswordFieldRenderer
      {...props}
      input={{ ...props.input, value: "", disabled: true }}
    />,
  );
  expect(view.container.querySelector("input")!.type).toBe("password");
  expect((view.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  view.rerender(
    <PasswordFieldRenderer
      {...props}
      field={{ ...props.field, frontend: undefined }}
    />,
  );
  expect(view.queryByRole("button")).toBeNull();
});
