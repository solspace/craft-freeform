import { PortalProvider } from "@editor/builder/contexts/portal.context";
import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StartingPointPicker } from "./modal.form.starting-point";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

let host: HTMLDivElement;
let root: Root;
const originalScroll = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  if (originalScroll)
    Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

it("opens the actual popup with Blank and sample choices, omitting Other", async () => {
  const onChange = vi.fn();
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <PortalProvider>
          <StartingPointPicker
            value=""
            presets={[
              {
                id: "contact",
                label: "Contact",
                description: "Contact form",
                fields: [],
              },
              {
                id: "other",
                label: "Other",
                description: "Other form",
                fields: [],
              },
            ]}
            loading={false}
            disabled={false}
            onChange={onChange}
          />
        </PortalProvider>
      </EscapeStackProvider>,
    ),
  );
  const trigger = host.querySelector<HTMLElement>('[role="button"]')!;
  await act(async () =>
    trigger.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    ),
  );
  const popup = document.querySelector(".dropdown-rollout");
  expect(popup).not.toBeNull();
  expect(popup!.textContent).toContain("Blank form");
  expect(popup!.textContent).toContain("Contact");
  expect(popup!.textContent).not.toContain("Other");
  const contact = Array.from(popup!.querySelectorAll<HTMLElement>("*")).find(
    (element) => element.textContent === "Contact" && !element.children.length,
  )!;
  await act(async () => contact.click());
  expect(onChange).toHaveBeenCalledWith("contact");
  expect(document.querySelector(".dropdown-rollout")).toBeNull();
});
