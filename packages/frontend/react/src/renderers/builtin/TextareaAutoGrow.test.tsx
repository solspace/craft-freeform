import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactFieldRendererProps } from "../../types.js";
import { TextareaFieldRenderer } from "./TextareaField.js";

afterEach(cleanup);

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const field = (
  config: ManifestFieldDefinition["frontend"] = {
    config: { autoGrow: true, rows: 3 },
  },
): ManifestFieldDefinition => ({
  id: 1,
  uid: "message",
  handle: "message",
  type: "textarea",
  label: "Message",
  required: false,
  frontend: config,
});

describe("React textarea auto grow", () => {
  it("uses configured rows and leaves values unchanged", () => {
    function Fixture() {
      const [value, setValue] = useState("Hello");
      const props = {
        field: field(),
        value,
        classNames: { input: "input" },
        input: {
          id: "message",
          name: "message",
          value,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setValue(e.target.value),
        },
      } as unknown as ReactFieldRendererProps;
      return (
        <form>
          <TextareaFieldRenderer {...props} />
        </form>
      );
    }

    const view = render(<Fixture />);
    const textarea = view.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.rows).toBe(3);
    fireEvent.input(textarea, { target: { value: "Updated answer" } });
    expect(
      new FormData(view.container.querySelector("form")!).get("message"),
    ).toBe("Updated answer");
  });

  it("works together with character counts", () => {
    const props = {
      field: field({
        config: {
          autoGrow: true,
          autoGrowMaxHeight: 240,
          rows: 2,
          showCharacterCount: true,
        },
      }),
      classNames: { characterCount: "muted" },
      input: { id: "message", value: "Hi" },
    } as unknown as ReactFieldRendererProps;

    const view = render(<TextareaFieldRenderer {...props} />);
    expect(view.getByRole("textbox").getAttribute("rows")).toBe("2");
    expect(view.getByText("2 characters")).toBeTruthy();
  });
});
