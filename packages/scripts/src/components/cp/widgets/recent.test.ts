import { afterEach, describe, expect, it, vi } from "vitest";
import { initRecent } from "./recent";

function fixture(showFilters = true, showPagination = true, pageSize = 2) {
  const root = document.createElement("div");
  root.dataset.pageSize = String(pageSize);
  root.dataset.widgetId = "8";
  root.dataset.oldestLabel = "Show oldest first";
  root.dataset.newestLabel = "Show newest first";
  root.innerHTML = `<div data-recent-tools hidden><input data-recent-search>
    <select data-recent-form><option value="">All forms</option></select>
    <select data-recent-status><option value="">All statuses</option></select>
    <button data-recent-sort></button></div><ol data-recent-list>
    ${["Alice", "Bob", "Carol", "David", "Eve"].map((name, i) => `<li data-recent-row data-form-id="${i % 2}" data-form-name="${i % 2 ? "Orders" : "Contact"}" data-status-id="${i % 2}" data-status-name="${i % 2 ? "Read" : "Unread"}">${name}</li>`).join("")}</ol>
    <div data-recent-empty hidden><button data-recent-clear>Clear</button></div>
    <div data-recent-pagination hidden><span data-recent-summary></span><div data-recent-paging-buttons hidden><button data-recent-previous></button><button data-recent-next></button></div></div><button data-recent-refresh>Refresh</button><p data-widget-feedback hidden></p>`;
  if (!showFilters) {
    root.querySelector("[data-recent-tools]")!.remove();
    root.querySelector("[data-recent-empty]")!.remove();
  }
  if (!showPagination) root.querySelector("[data-recent-pagination]")!.remove();
  document.body.append(root);
  initRecent(root);
  return root;
}
const visible = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>("[data-recent-row]")]
    .filter((row) => !row.hidden)
    .map((row) => row.textContent);
const click = (root: HTMLElement, key: string) =>
  root.querySelector<HTMLButtonElement>(`[data-recent-${key}]`)!.click();
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("recent submissions browser", () => {
  it("hides navigation when all results fit on one page and keeps the count visible", () => {
    const root = fixture(true, true, 5);
    expect(
      root.querySelector<HTMLElement>("[data-recent-paging-buttons]")!.hidden,
    ).toBe(true);
    expect(
      root.querySelector<HTMLElement>("[data-recent-pagination]")!.hidden,
    ).toBe(false);
    expect(root.querySelector("[data-recent-summary]")!.textContent).toBe(
      "1–5 of 5",
    );
  });

  it("updates navigation visibility as filters narrow, empty, and restore results", () => {
    const root = fixture();
    const buttons = root.querySelector<HTMLElement>(
      "[data-recent-paging-buttons]",
    )!;
    expect(buttons.hidden).toBe(false);
    click(root, "next");
    const form = root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
    form.value = "1";
    form.dispatchEvent(new Event("change"));
    expect(visible(root)).toEqual(["Bob", "David"]);
    expect(buttons.hidden).toBe(true);
    const search = root.querySelector<HTMLInputElement>(
      "[data-recent-search]",
    )!;
    search.value = "no match";
    search.dispatchEvent(new Event("input"));
    expect(visible(root)).toEqual([]);
    expect(buttons.hidden).toBe(true);
    click(root, "clear");
    expect(buttons.hidden).toBe(false);
    expect(visible(root)).toEqual(["Alice", "Bob"]);
    click(root, "next");
    expect(visible(root)).toEqual(["Carol", "David"]);
  });

  it("paginates and keeps chronological order after switching pages and sorting", () => {
    const root = fixture();
    expect(visible(root)).toEqual(["Alice", "Bob"]);
    click(root, "next");
    expect(visible(root)).toEqual(["Carol", "David"]);
    click(root, "previous");
    expect(visible(root)).toEqual(["Alice", "Bob"]);
    click(root, "sort");
    expect(visible(root)).toEqual(["Eve", "David"]);
    expect(
      root.querySelector("[data-recent-sort]")!.getAttribute("aria-label"),
    ).toBe("Show newest first");
    click(root, "next");
    click(root, "next");
    expect(visible(root)).toEqual(["Alice"]);
    expect(
      root.querySelector<HTMLButtonElement>("[data-recent-next]")!.disabled,
    ).toBe(true);
  });

  it("combines search, form and status filters, resets pagination, and clears empty results", () => {
    const root = fixture();
    click(root, "next");
    const form = root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
    form.value = "1";
    form.dispatchEvent(new Event("change"));
    expect(visible(root)).toEqual(["Bob", "David"]);
    const status = root.querySelector<HTMLSelectElement>(
      "[data-recent-status]",
    )!;
    status.value = "0";
    status.dispatchEvent(new Event("change"));
    expect(visible(root)).toEqual([]);
    expect(root.querySelector<HTMLElement>("[data-recent-empty]")!.hidden).toBe(
      false,
    );
    click(root, "clear");
    const search = root.querySelector<HTMLInputElement>(
      "[data-recent-search]",
    )!;
    search.value = "  CAROL  ";
    search.dispatchEvent(new Event("input"));
    expect(visible(root)).toEqual(["Carol"]);
    expect(root.querySelector("[data-recent-summary]")!.textContent).toBe(
      "1–1 of 1",
    );
  });

  it.each([
    [false, true],
    [true, false],
    [false, false],
  ])(
    "supports search/filters=%s and pagination=%s independently",
    (showFilters, showPagination) => {
      const root = fixture(showFilters, showPagination);
      expect(visible(root)).toEqual(["Alice", "Bob"]);
      if (showPagination) {
        click(root, "next");
        expect(visible(root)).toEqual(["Carol", "David"]);
      }
      if (showFilters) {
        const form =
          root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
        form.value = "0";
        form.dispatchEvent(new Event("change"));
        // Pagination disabled still limits the number of matching rows shown.
        expect(visible(root)).toEqual(["Alice", "Carol"]);
        const search = root.querySelector<HTMLInputElement>(
          "[data-recent-search]",
        )!;
        search.value = "Eve";
        search.dispatchEvent(new Event("input"));
        expect(visible(root)).toEqual(["Eve"]);
      }
    },
  );

  it("refreshes data while preserving search, filters, sorting and page", async () => {
    const root = fixture();
    const fresh = fixture();
    fresh.dataset.initialized = "";
    fresh
      .querySelectorAll("select option:not([value=''])")
      .forEach((option) => {
        option.remove();
      });
    const originalRows = [...fresh.querySelectorAll("[data-recent-row]")].sort(
      (a, b) => a.textContent!.localeCompare(b.textContent!),
    );
    fresh.querySelector("[data-recent-list]")!.append(...originalRows);
    const html = fresh.outerHTML;
    fresh.remove();
    vi.stubGlobal("Craft", {
      sendActionRequest: vi
        .fn()
        .mockResolvedValue({ data: { html, headHtml: "", bodyHtml: "" } }),
      appendHeadHtml: vi.fn().mockResolvedValue(undefined),
      appendBodyHtml: vi.fn().mockResolvedValue(undefined),
    });
    const search = root.querySelector<HTMLInputElement>(
      "[data-recent-search]",
    )!;
    search.value = "a";
    search.dispatchEvent(new Event("input"));
    click(root, "sort");
    click(root, "next");
    click(root, "refresh");
    await vi.waitFor(() => expect(root.isConnected).toBe(false));
    const next = document.querySelector<HTMLElement>("[data-widget-id='8']")!;
    expect(
      next.querySelector<HTMLInputElement>("[data-recent-search]")!.value,
    ).toBe("a");
    expect(
      next.querySelector("[data-recent-sort]")!.getAttribute("aria-pressed"),
    ).toBe("true");
    expect(visible(next)).toEqual(["Alice"]);
    expect(next.querySelector("[data-widget-feedback]")!.textContent).toBe(
      "Submissions refreshed.",
    );
  });

  it("allows refresh on an empty widget and keeps data usable on failure", async () => {
    const root = fixture();
    const request = vi.fn().mockRejectedValue(new Error("Offline"));
    vi.stubGlobal("Craft", { sendActionRequest: request });
    click(root, "refresh");
    await vi.waitFor(() =>
      expect(
        root.querySelector("[data-widget-feedback]")!.textContent,
      ).toContain("Could not refresh"),
    );
    expect(root.isConnected).toBe(true);
    expect(visible(root)).toEqual(["Alice", "Bob"]);
    expect(
      root.querySelector<HTMLButtonElement>("[data-recent-refresh]")!.disabled,
    ).toBe(false);
    const empty = document.createElement("div");
    empty.dataset.widgetId = "8";
    empty.innerHTML =
      "<button data-recent-refresh></button><p data-widget-feedback hidden></p>";
    document.body.append(empty);
    initRecent(empty);
    click(empty, "refresh");
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("isolates widgets and initializes only once", () => {
    const root = fixture();
    const other = fixture();
    initRecent(root);
    expect(root.querySelectorAll("[data-recent-form] option")).toHaveLength(3);
    click(root, "next");
    expect(visible(other)).toEqual(["Alice", "Bob"]);
  });
});

function serverMarkup(form = "", names: string[] = ["Loaded submission"]) {
  const options = Array.from(
    { length: 200 },
    (_, i) =>
      `<option value="${i + 1}" ${form === String(i + 1) ? "selected" : ""}>Form ${String(i + 1).padStart(3, "0")}</option>`,
  ).join("");
  return `<div data-widget-id="8" data-form-filter="${form}" data-page-size="2"><div data-recent-tools><input data-recent-search><select data-recent-form aria-label="Filter by form"><option value="">All forms</option>${options}</select><select data-recent-status><option value="">All statuses</option></select></div><ol data-recent-list>${names.map((name) => `<li data-recent-row data-form-id="${form || "1"}" data-status-id="1" data-status-name="Unread">${name}</li>`).join("")}</ol><div data-recent-empty hidden><button data-recent-clear>Clear</button></div><span data-recent-summary></span><button data-recent-refresh>Refresh</button><p data-widget-feedback hidden></p></div>`;
}
function serverFixture() {
  document.body.innerHTML = serverMarkup();
  const root = document.body.firstElementChild as HTMLElement;
  initRecent(root);
  return root;
}
function response(html: string) {
  return { data: { html, headHtml: "", bodyHtml: "" } };
}
function api(sendActionRequest = vi.fn()) {
  window.Craft = {
    sendActionRequest,
    appendHeadHtml: vi.fn().mockResolvedValue(undefined),
    appendBodyHtml: vi.fn().mockResolvedValue(undefined),
  };
  return sendActionRequest;
}

it("searches 200 forms with the keyboard and loads a form outside the initial results", async () => {
  const send = api(
    vi
      .fn()
      .mockResolvedValue(
        response(serverMarkup("200", ["Older form submission"])),
      ),
  );
  const root = serverFixture();
  const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
  input.focus();
  input.value = "Form 200";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  expect(root.querySelectorAll('[role="option"]')).toHaveLength(1);
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  await vi.waitFor(() => expect(root.isConnected).toBe(false));
  expect(send).toHaveBeenCalledWith("POST", "freeform/widgets/refresh", {
    data: { widgetId: 8, formId: "200" },
  });
  const next = document.body.firstElementChild as HTMLElement;
  expect(visible(next)).toEqual(["Older form submission"]);
  expect(next.querySelector(".freeform-recent-form-label")!.textContent).toBe(
    "Form 200",
  );
  expect(
    next.querySelector<HTMLSelectElement>("[data-recent-form]")!.value,
  ).toBe("200");
  click(next, "refresh");
  await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
  expect(send.mock.calls[1][2].data.formId).toBe("200");
});

it("restores the selected form and existing rows after a failed request, allowing retry", async () => {
  const send = api(vi.fn().mockRejectedValue(new Error("offline")));
  const root = serverFixture();
  const select = root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
  select.value = "200";
  select.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect(select.disabled).toBe(false));
  expect(select.value).toBe("");
  expect(root.querySelector(".freeform-recent-form-label")!.textContent).toBe(
    "All forms",
  );
  expect(visible(root)).toEqual(["Loaded submission"]);
  expect(
    root.querySelector<HTMLElement>("[data-widget-feedback]")!.hidden,
  ).toBe(false);
  send.mockResolvedValue(response(serverMarkup("200")));
  select.value = "200";
  select.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect(root.isConnected).toBe(false));
});

it("keeps empty forms selectable and clears back to all forms", async () => {
  const send = api(
    vi
      .fn()
      .mockResolvedValueOnce(response(serverMarkup("200", [])))
      .mockResolvedValueOnce(response(serverMarkup())),
  );
  const root = serverFixture();
  const select = root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
  select.value = "200";
  select.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect(root.isConnected).toBe(false));
  const next = document.body.firstElementChild as HTMLElement;
  expect(next.querySelector('[role="combobox"]')).not.toBeNull();
  expect(next.querySelector<HTMLElement>("[data-recent-empty]")!.hidden).toBe(
    false,
  );
  click(next, "clear");
  await vi.waitFor(() => expect(next.isConnected).toBe(false));
  expect(send.mock.calls[1][2].data.formId).toBe("");
  expect(visible(document.body.firstElementChild as HTMLElement)).toEqual([
    "Loaded submission",
  ]);
});

it("ignores a delayed response when a newer form selection has been requested", async () => {
  let finishFirst!: (value: ReturnType<typeof response>) => void;
  const send = api(
    vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(
        response(serverMarkup("200", ["Newest selection"])),
      ),
  );
  const root = serverFixture();
  const select = root.querySelector<HTMLSelectElement>("[data-recent-form]")!;
  select.value = "100";
  select.dispatchEvent(new Event("change"));
  select.value = "200";
  select.dispatchEvent(new Event("change"));
  finishFirst(response(serverMarkup("100", ["Stale selection"])));
  await vi.waitFor(() => expect(root.isConnected).toBe(false));
  expect(visible(document.body.firstElementChild as HTMLElement)).toEqual([
    "Newest selection",
  ]);
  expect(send).toHaveBeenCalledTimes(2);
});
