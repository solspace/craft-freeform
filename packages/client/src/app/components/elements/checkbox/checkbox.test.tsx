import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";

vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { is: { atLeast: () => true } } } },
}));

let root: Root;
let container: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

describe("Craft 6 checkbox change bridge", () => {
  it("updates React from native changes emitted by Craft label and keyboard activation", () => {
    const changes = vi.fn();
    function Fixture() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          id="site"
          label="Craft 6"
          checked={checked}
          onChange={(event) => {
            changes(event.target.checked);
            setChecked(event.target.checked);
          }}
        />
      );
    }
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(<Fixture />));
    const input = container.querySelector("input") as HTMLInputElement;
    const label = container.querySelector("label") as HTMLLabelElement;
    expect(input.slot).toBe("input");
    expect(label.slot).toBe("label");
    expect(label.htmlFor).toBe(input.id);

    // Craft may emit change without the input click React normally watches.
    act(() => {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(changes.mock.calls).toEqual([[true]]);
    expect(input.checked).toBe(true);
    act(() => {
      input.checked = false;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(changes.mock.calls).toEqual([[true], [false]]);
    expect(input.checked).toBe(false);
  });
});
