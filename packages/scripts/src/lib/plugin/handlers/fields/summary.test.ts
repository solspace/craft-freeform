// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import type Freeform from "../../../../components/front-end/plugin/freeform";
import events from "../../constants/event-types";
import SummaryHandler from "./summary";

type Source = {
  handle: string;
  type: string;
  label: string;
  visible: boolean;
  text: string;
  options?: Array<{ value: string; label: string }>;
  columns?: Array<{ type: string; label: string }>;
  fileCounts?: Record<number, Record<number, number>>;
};
const source = (handle: string, type = "text"): Source => ({
  handle,
  type,
  label: handle,
  visible: true,
  text: "Stored answer",
});

function setup(html: string, sources: Source[]) {
  const form = document.createElement("form");
  form.innerHTML = html;
  const summary = document.createElement("dl");
  summary.dataset.freeformSummary = "";
  summary.dataset.summaryConfig = JSON.stringify({
    hideEmpty: true,
    emptyValue: "Not answered",
  });
  summary.dataset.summarySources = JSON.stringify(sources);
  form.append(summary);
  document.body.append(form);
  const handler = new SummaryHandler({ form } as Freeform);
  return { form, summary, handler };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("SummaryHandler", () => {
  it("includes a range slider and updates as it moves", async () => {
    const { form, summary } = setup(
      '<div data-field-container="rating"><input type="range" name="rating" min="0" max="10" step="0.5" value="0"></div>',
      [source("rating", "range")],
    );
    expect(summary.querySelector("dd")?.textContent).toBe("0");
    const slider = form.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = "2.5";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(summary.querySelector("dd")?.textContent).toBe("2.5");
  });

  it("updates live values safely and retains previous-page answers", async () => {
    const { form, summary } = setup(
      '<div data-field-container="name"><input name="name" value="Initial"></div>',
      [source("prior"), source("name")],
    );
    expect(summary.textContent).toContain("Stored answer");
    const input = form.querySelector("input")!;
    input.value = '<img src=x onerror="alert(1)"> {{ 7 * 7 }}';
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(summary.textContent).toContain(input.value);
    expect(summary.querySelector("img")).toBeNull();
    expect(summary.querySelectorAll("dd")).toHaveLength(2);
  });

  it("captures non-bubbling calculated value changes", async () => {
    const { form, summary } = setup('<input name="total" value="0">', [
      source("total", "calculation"),
    ]);
    const input = form.querySelector("input")!;
    input.value = "42";
    input.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(summary.querySelector("dd")?.textContent).toBe("42");
  });

  it("uses readable choice labels and preserves numeric zero", () => {
    const choice = {
      ...source("choice", "dropdown"),
      options: [{ value: "internal", label: "Readable" }],
    };
    const { summary } = setup(
      '<select name="choice"><option value="internal" selected>Readable</option></select><input name="count" value="0">',
      [choice, source("count", "number")],
    );
    expect(
      Array.from(summary.querySelectorAll("dd"), (el) => el.textContent),
    ).toEqual(["Readable", "0"]);
  });

  it("responds to non-bubbling rules and hidden parent groups", async () => {
    const { form, summary } = setup(
      '<div data-field-container="group"><div data-field-container="name"><input name="name" value="Visible"></div></div>',
      [source("name")],
    );
    const group = form.querySelector<HTMLElement>(
      '[data-field-container="group"]',
    )!;
    group.dataset.hidden = "";
    group.dispatchEvent(new Event(events.rules.applied));
    await Promise.resolve();
    expect(summary.children).toHaveLength(0);
    delete group.dataset.hidden;
    group.dispatchEvent(new Event(events.rules.applied));
    await Promise.resolve();
    expect(summary.textContent).toContain("Visible");
  });

  it("isolates multiple forms and refreshes AJAX replacement content", () => {
    setup('<input name="name" value="Other form">', [source("name")]);
    const { form, summary, handler } = setup(
      '<input name="name" value="This form">',
      [source("name")],
    );
    expect(summary.textContent).not.toContain("Other form");
    form.querySelector("input")!.remove();
    form.insertAdjacentHTML(
      "afterbegin",
      '<input name="name" value="New page">',
    );
    handler.reload();
    expect(summary.textContent).toContain("New page");
  });

  it("refreshes drag-and-drop file counts without exposing upload IDs", async () => {
    const { form, summary } = setup(
      '<div data-field-container="files"><input type="hidden" name="files[]" value="secret-id"></div>',
      [source("files", "file-dnd")],
    );
    expect(summary.textContent).toContain("Files: 1");
    expect(summary.textContent).not.toContain("secret-id");
    const container = form.querySelector('[data-field-container="files"]')!;
    container.insertAdjacentHTML(
      "beforeend",
      '<input type="hidden" name="files[]" value="second-id">',
    );
    container.dispatchEvent(new Event(events.dragAndDrop.onChange));
    await Promise.resolve();
    expect(summary.textContent).toContain("Files: 2");
  });

  it("clears a persisted upload count when the final drag-and-drop file is removed", async () => {
    const persisted = { ...source("files", "file-dnd"), text: "Files: 1" };
    const { form, summary } = setup(
      '<div data-field-container="files"><input type="hidden" name="files[]" value="id"></div>',
      [persisted],
    );
    form.querySelector("input")!.remove();
    form
      .querySelector("div")!
      .dispatchEvent(new Event(events.dragAndDrop.onChange));
    await Promise.resolve();
    expect(summary.querySelector("dd")).toBeNull();
  });

  it("retains persisted native uploads and table cell uploads until replaced", () => {
    const files = { ...source("files", "file"), text: "Files: 2" };
    const table = {
      ...source("items", "table"),
      columns: [{ type: "file", label: "Attachments" }],
      fileCounts: { 0: { 0: 3 } },
    };
    const { summary } = setup(
      '<input type="file" name="files[]"><input type="file" name="items[0][0][]">',
      [files, table],
    );
    expect(
      Array.from(
        summary.querySelectorAll("dd"),
        (element) => element.textContent,
      ),
    ).toEqual(["Files: 2", "Attachments: Files: 3"]);
  });

  it("formats table cells and updates when rows are removed", async () => {
    const table = {
      ...source("items", "table"),
      columns: [
        { type: "string", label: "Name" },
        { type: "number", label: "Count" },
      ],
    };
    const { form, summary } = setup(
      '<input name="items[0][0]" value="A"><input name="items[0][1]" value="0"><input name="items[3][0]" value="B">',
      [table],
    );
    expect(summary.textContent).toContain("Name: A; Count: 0\nName: B");
    form.querySelector('[name="items[3][0]"]')!.remove();
    form.dispatchEvent(new Event(events.table.afterRemoveRow));
    await Promise.resolve();
    expect(summary.textContent).not.toContain("Name: B");
  });

  it("refreshes after native reset without duplicating entries", async () => {
    const { form, summary, handler } = setup(
      '<input name="name" value="Original">',
      [source("name")],
    );
    form.querySelector("input")!.value = "Changed";
    handler.reload();
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(summary.textContent).toContain("Original");
    expect(summary.querySelectorAll("dd")).toHaveLength(1);
  });
});
