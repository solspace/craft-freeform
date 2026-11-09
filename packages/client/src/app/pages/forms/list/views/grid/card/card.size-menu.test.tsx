import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import type { FormCardContent } from "@ff-client/types/forms";
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
vi.mock("./card.queries", () => ({
  useCardFields: () => ({
    data: [
      { id: 5, label: "Priority" },
      { id: 9, label: "Score" },
    ],
  }),
}));
let host: HTMLDivElement, root: Root;
const change = vi.fn();
const actions = { onDuplicate: vi.fn(), onArchive: vi.fn(), onDelete: vi.fn() };
const render = async (
  disabled = false,
  withActions = false,
  widgetType?: string,
  canCustomize = true,
) => {
  await act(async () =>
    root.render(
      <QueryClientProvider client={new QueryClient()}>
        <EscapeStackProvider>
          <CardSizeMenu
            name="Contact"
            canCustomize={canCustomize}
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
  expect(choices[0].querySelector(".size-check path")).not.toBeNull();
  expect(choices[1].querySelector(".size-check path")).toBeNull();
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

it("keeps form actions available without offering Pro customization", async () => {
  await render(false, true, undefined, false);
  await act(async () => trigger().click());
  const dialog = document.querySelector('[role="dialog"]')!;
  expect(dialog.textContent).not.toContain("Card size");
  expect(
    [...dialog.querySelectorAll("button")].map((button) => button.textContent),
  ).toEqual(["Duplicate", "Archive", "Delete"]);
  await act(async () =>
    dialog.querySelector<HTMLButtonElement>("button")!.click(),
  );
  expect(actions.onDuplicate).toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
});

it("keeps Field summary open through saving, dismisses only the nested picker, and selects a summary field", async () => {
  let content: FormCardContent = "overview";
  let fieldId: number | null = null;
  let saving = false;
  const client = new QueryClient();
  const onContentChange = vi.fn(
    (next: FormCardContent, nextField?: number | null) => {
      content = next;
      fieldId = nextField ?? null;
      saving = true;
      draw();
    },
  );
  const draw = () =>
    root.render(
      <QueryClientProvider client={client}>
        <EscapeStackProvider>
          <CardSizeMenu
            name="Contact"
            size="2x2"
            formId={1}
            disabled={saving}
            content={content}
            fieldId={fieldId}
            canReadSubmissions
            onChange={change}
            onContentChange={onContentChange}
          />
        </EscapeStackProvider>
      </QueryClientProvider>,
    );
  await act(async () => draw());
  await act(async () => trigger().click());
  const picker = (label: string) =>
    document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
  await act(async () => picker("Card content").click());
  const fieldOption = [
    ...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
  ].find((option) => option.textContent === "Field summary")!;
  expect(fieldOption.querySelector("svg")).not.toBeNull();
  await act(async () => fieldOption.click());
  expect(onContentChange).toHaveBeenLastCalledWith("field", 5);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(picker("Summary field").matches(":disabled")).toBe(true);
  saving = false;
  await act(async () => draw());
  await act(async () => picker("Summary field").click());
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="menu"]')).toBeNull();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () => picker("Summary field").click());
  const score = [
    ...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
  ].find((option) => option.textContent === "Score")!;
  await act(async () => score.click());
  expect(onContentChange).toHaveBeenLastCalledWith("field", 9);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
