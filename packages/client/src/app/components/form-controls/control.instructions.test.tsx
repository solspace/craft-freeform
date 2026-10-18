import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RenderContextProvider } from "./context/render.context";
import { ControlBlock } from "./control.block";

vi.mock("@config/freeform/freeform.config", () => ({
  Edition: { Express: "express" },
  default: { editions: { isAtLeast: () => true } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, values: Record<string, string> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? key),
}));

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("lets users expand routine help without hiding validation or changing the input label", () => {
  act(() =>
    root.render(
      <RenderContextProvider size="small" collapsibleInstructions={["label"]}>
        <ControlBlock
          label="Label"
          handle="label"
          instructions="Describe this field."
          errors={["Enter a label."]}
        >
          <input id="label" />
        </ControlBlock>
      </RenderContextProvider>,
    ),
  );
  const button = host.querySelector<HTMLButtonElement>(
    "button[aria-controls]",
  )!;
  const help = document.getElementById(button.getAttribute("aria-controls")!)!;
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(help.getAttribute("aria-hidden")).toBe("true");
  expect(help.hasAttribute("inert")).toBe(true);
  expect(button.getAttribute("aria-label")).toBe("Help for Label");
  expect(button.parentElement?.querySelector("label")).not.toBeNull();
  expect(host.querySelector("label")?.htmlFor).toBe("label");
  expect(host.querySelector("li")?.textContent).toBe("Enter a label.");
  expect(help.contains(host.querySelector("li"))).toBe(false);
  act(() => button.click());
  expect(button.getAttribute("aria-expanded")).toBe("true");
  expect(help.getAttribute("aria-hidden")).toBe("false");
  expect(help.hasAttribute("inert")).toBe(false);
  expect(help.textContent).toContain("Describe this field.");
  act(() => button.click());
  expect(button.getAttribute("aria-expanded")).toBe("false");
  expect(help.getAttribute("aria-hidden")).toBe("true");
  expect(help.hasAttribute("inert")).toBe(true);
});

it("keeps specialized field guidance visible", () => {
  act(() =>
    root.render(
      <RenderContextProvider
        size="small"
        collapsibleInstructions={["label", "handle"]}
      >
        <ControlBlock
          label="Allowed file types"
          handle="fileKinds"
          instructions="Choose which files visitors can upload."
        >
          <input id="fileKinds" />
        </ControlBlock>
      </RenderContextProvider>,
    ),
  );
  expect(host.querySelector("button[aria-controls]")).toBeNull();
  expect(host.textContent).toContain("Choose which files visitors can upload.");
});

it("keeps instructions visible outside the field property sidebar", () => {
  act(() =>
    root.render(
      <ControlBlock
        label="Label"
        handle="label"
        instructions="Describe this field."
      >
        <input id="label" />
      </ControlBlock>,
    ),
  );
  expect(host.querySelector("button[aria-controls]")).toBeNull();
  expect(host.textContent).toContain("Describe this field.");
});
