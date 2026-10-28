import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { WebsiteFieldRenderer } from "./WebsiteField.js";

afterEach(cleanup);

it("updates controlled values on blur, preserves explicit URLs, follows resets and normalizes before Enter submission", () => {
  const blur = vi.fn();
  const submitted = vi.fn();
  function Fixture() {
    const [value, setValue] = useState("");
    const props = {
      field: { handle: "website", type: "website" },
      input: {
        name: "website",
        value,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          setValue(event.target.value),
        onBlur: blur,
      },
      classNames: { input: "website-input" },
      form: { setValue: (_handle: string, next: string) => setValue(next) },
    } as unknown as ReactFieldRendererProps;
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted(value);
        }}
      >
        <WebsiteFieldRenderer {...props} />
        <output>{value}</output>
        <button type="button" onClick={() => setValue("")}>
          Clear
        </button>
        <button type="submit">Submit</button>
      </form>
    );
  }
  const view = render(<Fixture />);
  const input = view.container.querySelector("input")!;
  fireEvent.change(input, {
    target: { value: "example.com/Contact?ref=AbC#Team" },
  });
  // Change events represent a committed edit; ordinary input is kept as typed.
  fireEvent.blur(input);
  expect(input.value).toBe("https://example.com/Contact?ref=AbC#Team");
  expect(view.container.querySelector("output")!.textContent).toBe(input.value);
  expect(blur).toHaveBeenCalledOnce();
  fireEvent.change(input, { target: { value: "http://example.com/Other" } });
  fireEvent.blur(input);
  expect(input.value).toBe("http://example.com/Other");
  fireEvent.input(input, { target: { value: "bad address" } });
  expect(input.checkValidity()).toBe(false);
  expect(input.validity.customError).toBe(true);
  fireEvent.click(view.getByText("Clear"));
  expect(input.value).toBe("");
  expect(input.validity.customError).toBe(false);
  fireEvent.input(input, { target: { value: "example.org" } });
  expect(input.value).toBe("example.org");
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.submit(view.container.querySelector("form")!);
  expect(submitted).toHaveBeenLastCalledWith("https://example.org");
  const removed = input;
  view.unmount();
  removed.value = "example.net";
  fireEvent.blur(removed);
  expect(removed.value).toBe("example.net");
});
