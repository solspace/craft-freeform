import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChartPeriodMenu } from "./grid.period-menu";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: { days?: number } = {}) =>
    text.replace("{days}", String(params.days)),
}));

let host: HTMLDivElement;
let root: Root;
const change = vi.fn();
const render = async (disabled = false) => {
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <ChartPeriodMenu
          days={30}
          disabled={disabled}
          busy={false}
          onChange={change}
        />
      </EscapeStackProvider>,
    ),
  );
};
const trigger = () => host.querySelector("button")!;
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  change.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await render();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("marks the saved period and returns focus after choosing a new one", async () => {
  expect(trigger().textContent).toBe("30 days");
  await act(async () => {
    trigger().focus();
    trigger().click();
  });
  const options = [
    ...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
  ];
  expect(options.map((option) => option.textContent)).toEqual([
    "7 days",
    "30 days",
    "90 days",
  ]);
  expect(options.map((option) => option.getAttribute("aria-checked"))).toEqual([
    "false",
    "true",
    "false",
  ]);
  await act(async () => options[0].click());
  expect(change).toHaveBeenCalledExactlyOnceWith(7);
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.activeElement).toBe(trigger());
});

it("supports arrow navigation and dismisses with Escape without a change", async () => {
  await act(async () => {
    trigger().focus();
    trigger().click();
  });
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(
      document.querySelector('[role="menuitemradio"][aria-checked="true"]'),
    ),
  );
  await act(async () =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    ),
  );
  expect(document.activeElement?.textContent).toBe("90 days");
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(change).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(trigger());
});

it("cannot open while saving or dragging", async () => {
  await render(true);
  await act(async () => trigger().click());
  expect(trigger().disabled).toBe(true);
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(change).not.toHaveBeenCalled();
});
