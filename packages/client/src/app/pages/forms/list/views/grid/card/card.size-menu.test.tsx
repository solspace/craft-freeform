import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getExtraWidgetSizes } from "../grid.widgets";
import { CardSizeMenu } from "./card.size-menu";

vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params?: { name: string }) =>
    text.replace("{name}", params?.name ?? ""),
}));
let host: HTMLDivElement, root: Root;
const change = vi.fn();
const actions = { onDuplicate: vi.fn(), onArchive: vi.fn(), onDelete: vi.fn() };
const render = async (
  disabled = false,
  withActions = false,
  widgetType?: string,
) => {
  await act(async () =>
    root.render(
      <QueryClientProvider client={new QueryClient()}>
        <EscapeStackProvider>
          <CardSizeMenu
            name="Contact"
            size="1x1"
            disabled={disabled}
            onChange={change}
            extraSizes={
              widgetType
                ? getExtraWidgetSizes(widgetType).map((choice) => ({
                    ...choice,
                    onSelect: () => change(choice.size),
                  }))
                : []
            }
            {...(withActions ? actions : {})}
          />
        </EscapeStackProvider>
      </QueryClientProvider>,
    ),
  );
};
const trigger = () => host.querySelector<HTMLButtonElement>("button");
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  change.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
it("offers all four sizes and restores keyboard focus after selection", async () => {
  await render();
  await act(async () => {
    trigger().focus();
    trigger().click();
  });
  const menu = document.querySelector('[role="dialog"]');
  const choices = [...menu.querySelectorAll<HTMLButtonElement>("button")];
  expect(choices.map((button) => button.textContent)).toEqual([
    "Standard1×1",
    "Wide2×1",
    "Tall1×2",
    "Large2×2",
  ]);
  expect(choices[0].getAttribute("aria-pressed")).toBe("true");
  await act(async () => {
    choices[3].focus();
    choices[3].click();
  });
  expect(change).toHaveBeenCalledExactlyOnceWith("2x2");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger());
  await render(true);
  expect(document.activeElement).toBe(trigger());
  await act(async () => trigger().click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
it("closes on Escape without changing the size", async () => {
  await render();
  await act(async () => {
    trigger().focus();
    trigger().click();
  });
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(change).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(trigger());
});

it("keeps Duplicate, Archive and Delete below card sizes and closes before acting", async () => {
  await render(false, true);
  await act(async () => trigger().click());
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
  ];
  expect(buttons.slice(4).map((button) => button.textContent)).toEqual([
    "Duplicate",
    "Archive",
    "Delete",
  ]);
  await act(async () => buttons[5].click());
  expect(actions.onArchive).toHaveBeenCalledOnce();
  expect(actions.onDelete).not.toHaveBeenCalled();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it.each([
  ["recent", ["Extra wide3×2", "Extra tall2×3", "Extra large3×3"]],
  ["linear", ["Extra wide3×2", "Extra large3×3"]],
  ["radial", ["Extra tall2×3", "Extra large3×3"]],
  ["quick-form", ["Extra tall2×3", "Extra large3×3"]],
])(
  "offers the supported extra sizes for %s and closes after selecting",
  async (type, expected) => {
    await render(false, false, type);
    await act(async () => {
      trigger().focus();
      trigger().click();
    });
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
    ];
    expect(buttons.slice(4).map((button) => button.textContent)).toEqual(
      expected,
    );
    const choice = buttons.at(-1)!;
    await act(async () => {
      choice.focus();
      choice.click();
    });
    expect(change).toHaveBeenCalledExactlyOnceWith("3x3");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  },
);
