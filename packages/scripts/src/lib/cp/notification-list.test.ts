import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";

const script = readFileSync("src/components/cp/notifications/index.js", "utf8");
function fixture(type = "files", count = 1) {
  document.body.innerHTML = `<div class="tablepane"><table><tbody></tbody></table></div><div data-notification-empty hidden><a href="/new">Create</a></div>`;
  const tbody = document.querySelector("tbody")!;
  for (let index = 0; index < count; ++index) {
    const row = document.createElement("tr");
    row.dataset.id =
      type === "files" ? `folder/template-${index}.twig` : String(index + 1);
    row.dataset.name = `Template ${index + 1}`;
    row.innerHTML = `<td><button data-notification-menu data-notification-type="${type}">Actions</button></td>`;
    tbody.append(row);
  }
  const callbacks: Array<(option: HTMLElement) => Promise<void>> = [];
  const request = vi.fn().mockResolvedValue({ data: { success: true } });
  const error = vi.fn();
  const confirm = vi.fn().mockReturnValue(true);
  const reload = vi.fn();
  new Function("Garnish", "$", "Craft", "confirm", "window", script)(
    {
      MenuBtn: class {
        constructor(
          _button: unknown,
          config: { onOptionSelect: (option: HTMLElement) => Promise<void> },
        ) {
          callbacks.push(config.onOptionSelect);
        }
      },
    },
    (value: unknown) => (typeof value === "function" ? value() : value),
    {
      sendActionRequest: request,
      t: (_category: string, message: string) => message,
      cp: { displayError: error },
    },
    confirm,
    { location: { reload } },
  );
  function choose(action: string, index = 0) {
    const option = document.createElement("a");
    option.dataset.notificationAction = action;
    return callbacks[index](option);
  }
  return { choose, request, error, confirm, reload };
}

it.each(["files", "database", "wrappers"])(
  "duplicates %s templates with the correct identity and reloads",
  async (type) => {
    const f = fixture(type);
    await f.choose("duplicate");
    expect(f.request).toHaveBeenCalledWith(
      "POST",
      `freeform/notifications/${type}/duplicate`,
      { data: { id: type === "files" ? "folder/template-0.twig" : "1" } },
    );
    expect(f.reload).toHaveBeenCalledOnce();
  },
);

it("cancels deletion without sending a request", async () => {
  const f = fixture();
  f.confirm.mockReturnValue(false);
  await f.choose("delete");
  expect(f.request).not.toHaveBeenCalled();
  expect(document.querySelector("tbody tr")).not.toBeNull();
});

it("reveals the empty state only after the last successful deletion", async () => {
  const f = fixture("wrappers", 2);
  await f.choose("delete", 0);
  expect(
    document.querySelector<HTMLDivElement>("[data-notification-empty]")!.hidden,
  ).toBe(true);
  await f.choose("delete", 1);
  expect(document.querySelector("tbody tr")).toBeNull();
  expect(document.querySelector<HTMLDivElement>(".tablepane")!.hidden).toBe(
    true,
  );
  expect(
    document.querySelector<HTMLDivElement>("[data-notification-empty]")!.hidden,
  ).toBe(false);
});

it("keeps failed deletions visible and restores the action button", async () => {
  const f = fixture();
  f.request.mockRejectedValue(new Error("Network error"));
  await f.choose("delete");
  expect(document.querySelector("tbody tr")).not.toBeNull();
  expect(document.querySelector<HTMLButtonElement>("button")!.disabled).toBe(
    false,
  );
  expect(f.error).toHaveBeenCalledOnce();
});

it("ignores another action while a request is pending", async () => {
  const f = fixture();
  let complete!: (value: { data: { success: boolean } }) => void;
  f.request.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const first = f.choose("duplicate");
  await f.choose("delete");
  expect(f.request).toHaveBeenCalledOnce();
  complete({ data: { success: true } });
  await first;
});
