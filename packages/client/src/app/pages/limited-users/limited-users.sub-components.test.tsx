import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ItemBlock } from "./limited-users.sub-components";
import type { Item, TogglesItem } from "./limited-users.types";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

let root: Root;
let container: HTMLDivElement;
const updateValue = vi.fn();
const choices: TogglesItem = {
  id: "types",
  type: "toggles",
  name: "Allowed Field Types",
  values: ["text"],
  options: [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
  ],
};

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
});

const render = async (item: Item) => {
  await act(() =>
    root.render(
      <ul>
        <ItemBlock item={item} updateValue={updateValue} />
      </ul>,
    ),
  );
};

const action = (text: string) =>
  [...container.querySelectorAll("button")].find(
    (button) => button.textContent === text,
  )!;

describe("Limited Users permission controls", () => {
  it("associates switch labels with focusable controls and updates the nested permission path", async () => {
    await render({
      id: "layout",
      type: "group",
      name: "Layout",
      children: [
        { id: "pages", type: "boolean", name: "Add Pages", enabled: true },
      ],
    });
    const control =
      container.querySelector<HTMLButtonElement>('[role="switch"]')!;
    const label = container.querySelector<HTMLLabelElement>(
      `label[for="${control.id}"]`,
    )!;
    expect(control.type).toBe("button");
    expect(control.getAttribute("aria-checked")).toBe("true");
    await act(() => label.click());
    expect(updateValue).toHaveBeenCalledExactlyOnceWith("layout.pages", {
      enabled: false,
    });
  });

  it("uses labeled checkboxes and preserves values when changing a field type", async () => {
    await render(choices);
    const inputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
    expect(inputs[1].labels?.[0].textContent).toBe("Email");
    await act(() => inputs[1].labels![0].click());
    expect(updateValue).toHaveBeenCalledExactlyOnceWith("types", {
      values: ["text", "email"],
    });
  });

  it("disables child controls under an off parent without clearing their saved values", async () => {
    await render({
      id: "fields",
      type: "boolean",
      name: "Advanced Fields",
      enabled: false,
      children: [
        {
          id: "handles",
          type: "boolean",
          name: "Field Handles",
          enabled: true,
        },
        choices,
        {
          id: "access",
          type: "select",
          name: "Access",
          value: "own",
          options: [{ value: "own", label: "Own" }],
        },
      ],
    });
    const switches =
      container.querySelectorAll<HTMLButtonElement>('[role="switch"]');
    expect(switches[0].disabled).toBe(false);
    expect(switches[1].disabled).toBe(true);
    expect(switches[1].getAttribute("aria-checked")).toBe("true");
    const inputs = container.querySelectorAll<HTMLInputElement>("input");
    expect([...inputs].every((input) => input.disabled)).toBe(true);
    expect(inputs[0].checked).toBe(true);
    expect(container.querySelector("select")?.disabled).toBe(true);
    expect(action("Enable All").disabled).toBe(true);
    await act(() => action("Enable All").click());
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("supports bulk actions and disables actions that would make no change", async () => {
    await render(choices);
    await act(() => action("Enable All").click());
    expect(updateValue).toHaveBeenCalledWith("types", {
      values: ["text", "email"],
    });
    await render({ ...choices, values: ["text", "email"] });
    expect(action("Enable All").disabled).toBe(true);
    await act(() => action("Disable All").click());
    expect(updateValue).toHaveBeenLastCalledWith("types", { values: [] });
    await render({ ...choices, values: [] });
    expect(action("Disable All").disabled).toBe(true);
  });
});
