import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { TextareaFieldRenderer } from "./TextareaField.js";
import { TextFieldRenderer } from "./TextField.js";

afterEach(cleanup);
const field = (type: string): ManifestFieldDefinition => ({
  id: 1,
  uid: "message",
  handle: "message",
  type,
  label: "Message",
  required: false,
  frontend: { config: { showCharacterCount: true } },
  validation: { maxLength: 5 },
});
describe("React character counters", () => {
  it.each(["text", "textarea"])(
    "updates %s while typing and preserves associations",
    (type) => {
      const Renderer =
        type === "text" ? TextFieldRenderer : TextareaFieldRenderer;
      function Fixture() {
        const [value, setValue] = useState("é");
        const props = {
          field: field(type),
          value,
          classNames: {
            input: "input",
            characterCount: "muted",
            characterCountError: "error",
          },
          input: {
            id: "message",
            name: "message",
            value,
            "aria-describedby": "help",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value),
          },
        } as unknown as ReactFieldRendererProps;
        return (
          <form>
            <Renderer {...props} />
          </form>
        );
      }
      const view = render(<Fixture />);
      const input = view.getByRole("textbox") as HTMLInputElement;
      expect(input.getAttribute("aria-describedby")).toBe(
        "help message-character-count",
      );
      expect(input.maxLength).toBe(5);
      expect(view.getByText("1 / 5 characters").getAttribute("aria-live")).toBe(
        "off",
      );
      fireEvent.input(input, { target: { value: "😀abc" } });
      expect(view.getByText("5 / 5 characters")).toBeTruthy();
      expect(
        new FormData(view.container.querySelector("form")!).get("message"),
      ).toBe("😀abc");
    },
  );
  it("follows controlled updates and removes counters when disabled in settings", () => {
    const props = {
      field: field("text"),
      classNames: { characterCount: "muted", characterCountError: "error" },
      input: { id: "message", value: "toolong", disabled: true },
    } as unknown as ReactFieldRendererProps;
    const view = render(<TextFieldRenderer {...props} />);
    expect(view.getByText("7 / 5 characters").className).toBe("error");
    view.rerender(
      <TextFieldRenderer {...props} input={{ ...props.input, value: "" }} />,
    );
    expect(view.getByText("0 / 5 characters")).toBeTruthy();
    view.rerender(
      <TextFieldRenderer
        {...props}
        field={{ ...props.field, frontend: undefined }}
      />,
    );
    expect(view.container.querySelector("[aria-live]")).toBeNull();
  });
});
