import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WidgetTypeMenu } from "./card.widget-menu";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
let host: HTMLDivElement, root: Root;
const select = vi.fn();
beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  select.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <WidgetTypeMenu onSelect={select} />
      </EscapeStackProvider>,
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it.each([
  ["Linear Chart", "linear"],
  ["Radial Chart", "radial"],
  ["Recent Submissions", "recent"],
  ["Quick Form", "quick-form"],
])("selects %s and closes the menu", async (label, type) => {
  const trigger = host.querySelector("button");
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  const menu = document.querySelector('[role="dialog"]');
  const buttons = [...menu.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual([
    "Linear Chart",
    "Radial Chart",
    "Recent Submissions",
    "Quick Form",
  ]);
  await act(async () =>
    buttons.find((button) => button.textContent === label).click(),
  );
  expect(select).toHaveBeenCalledExactlyOnceWith(type);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(trigger.textContent).toBe("Insert widget…");
});

it("dismisses with Escape without selecting a widget", async () => {
  await act(async () => {
    host.querySelector("button").focus();
    host.querySelector("button").click();
  });
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(select).not.toHaveBeenCalled();
});
