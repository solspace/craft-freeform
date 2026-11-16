import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const template = readFileSync(
  "../plugin/src/templates/pdf-templates/index.twig",
  "utf8",
);
const script = template.split("{% js %}")[1].split("{% endjs %}")[0];

function fixture(count = 1, filename = "") {
  document.body.innerHTML = `<div id="pdf-template-list"><table><tbody>${Array.from({ length: count }, (_, index) => `<tr data-id="${index + 1}" data-name="Template ${index + 1}"><td><button type="button" class="ff-pdf-actions">Actions</button></td></tr>`).join("")}</tbody></table></div>
    <div id="notemplates" hidden><a href="/new">Create PDF template</a></div>`;
  const code = document.createElement("code");
  code.className = "ff-pdf-filename";
  code.textContent = filename;
  const tooltip = document.createElement("span");
  tooltip.className = "ff-pdf-filename-tooltip";
  tooltip.textContent = filename;
  document.querySelector("td")!.append(code, tooltip);
  const options: Array<(option: HTMLElement) => Promise<void>> = [];
  const request = vi.fn().mockResolvedValue({ data: { success: true } });
  const confirm = vi.fn().mockReturnValue(true);
  const notice = vi.fn();
  const error = vi.fn();
  const reload = vi.fn();
  const garn = {
    MenuBtn: class {
      constructor(
        _button: unknown,
        config: { onOptionSelect: (option: HTMLElement) => Promise<void> },
      ) {
        options.push(config.onOptionSelect);
      }
    },
  };
  const craft = {
    t: (_category: string, message: string) => message,
    sendActionRequest: request,
    cp: { displayNotice: notice, displayError: error },
  };
  new Function("Garnish", "$", "Craft", "confirm", "window", script)(
    garn,
    (element: unknown) => element,
    craft,
    confirm,
    { location: { reload } },
  );
  const choose = (action: string, index = 0) => {
    const option = document.createElement("a");
    option.dataset.pdfAction = action;
    return options[index](option);
  };
  return { request, confirm, notice, error, reload, choose, code, tooltip };
}

describe("PDF filename Twig highlighting", () => {
  it("colors expressions and quoted fallbacks while preserving the exact filename", () => {
    const filename = 'receipt-{{ submission.id|default("preview") }}.pdf';
    const f = fixture(1, filename);
    expect(f.code.textContent).toBe(filename);
    expect(f.code.querySelector(".ff-pdf-twig-expression")!.textContent).toBe(
      '{{ submission.id|default("preview") }}',
    );
    expect(f.code.querySelector(".ff-pdf-twig-string")!.textContent).toBe(
      '"preview"',
    );
    expect(f.tooltip.innerHTML).toBe(f.code.innerHTML);
    expect(f.code.firstChild!.textContent).toBe("receipt-");
    expect(f.code.lastChild!.textContent).toBe(".pdf");
  });

  it("does not treat closing delimiters inside quoted values as the expression end", () => {
    const filename = `{{ label|default('a }} b') }}-{{ "escaped \\" quote" }}.pdf`;
    const f = fixture(1, filename);
    expect(f.code.textContent).toBe(filename);
    expect(f.code.querySelectorAll(".ff-pdf-twig-expression")).toHaveLength(2);
    expect(f.code.querySelector(".ff-pdf-twig-string")!.textContent).toBe(
      "'a }} b'",
    );
  });

  it("handles Twig tags, comments, whitespace control, and Unicode literally", () => {
    const filename = `Résumé-{% if enabled %}{{- name -}}{% endif %}{# a "comment #}.pdf`;
    const f = fixture(1, filename);
    expect(f.code.textContent).toBe(filename);
    expect(f.code.querySelectorAll(".ff-pdf-twig-expression")).toHaveLength(3);
    expect(f.code.querySelector(".ff-pdf-twig-comment")!.textContent).toBe(
      '{# a "comment #}',
    );
  });

  it.each([
    "invoice.pdf",
    "unfinished-{{ name",
    'unfinished-{{ "a }}',
    "single-{brace}.pdf",
  ])("keeps static or incomplete filenames readable: %s", (filename) => {
    const f = fixture(1, filename);
    expect(f.code.textContent).toBe(filename);
    expect(f.code.querySelectorAll("span")).toHaveLength(0);
  });

  it("keeps HTML and Twig code inert", () => {
    const filename =
      '<img src=x onerror=alert(1)>-{{ "<svg onload=alert(2)>" }}.pdf';
    const f = fixture(1, filename);
    expect(f.code.textContent).toBe(filename);
    expect(f.tooltip.textContent).toBe(filename);
    expect(f.code.querySelectorAll("img, svg, script")).toHaveLength(0);
    expect(f.tooltip.querySelectorAll("img, svg, script")).toHaveLength(0);
    expect(f.code.querySelector(".ff-pdf-twig-string")!.textContent).toBe(
      '"<svg onload=alert(2)>"',
    );
  });
});

describe("PDF template list actions", () => {
  it("reveals the guided empty state after deleting the last template", async () => {
    const f = fixture();
    await f.choose("delete");
    expect(f.request).toHaveBeenCalledWith(
      "POST",
      "freeform/pdf/pdf-templates/delete",
      { data: { id: "1" } },
    );
    expect(document.querySelectorAll("tbody tr")).toHaveLength(0);
    expect(document.getElementById("pdf-template-list")!.hidden).toBe(true);
    expect(document.getElementById("notemplates")!.hidden).toBe(false);
    expect(document.activeElement).toBe(
      document.querySelector("#notemplates a"),
    );
  });

  it("retains the list and moves focus to an available action after deletion", async () => {
    const f = fixture(2);
    await f.choose("delete");
    expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(document.getElementById("notemplates")!.hidden).toBe(true);
    expect(document.activeElement).toBe(
      document.querySelector(".ff-pdf-actions"),
    );
  });

  it("leaves templates intact when deletion is cancelled", async () => {
    const f = fixture();
    f.confirm.mockReturnValueOnce(false);
    await f.choose("delete");
    expect(f.request).not.toHaveBeenCalled();
    expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it("keeps the row and permits retry after a failed delete request", async () => {
    const f = fixture();
    f.request.mockRejectedValueOnce({
      response: { data: { message: "Permission denied" } },
    });
    await f.choose("delete");
    expect(f.error).toHaveBeenCalledWith("Permission denied");
    expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(
      document.querySelector<HTMLButtonElement>(".ff-pdf-actions")!.disabled,
    ).toBe(false);
    await f.choose("delete");
    expect(document.querySelectorAll("tbody tr")).toHaveLength(0);
  });

  it("does not remove a row when the server reports a failed operation", async () => {
    const f = fixture();
    f.request.mockResolvedValueOnce({
      data: { success: false, message: "Unable to delete" },
    });
    await f.choose("delete");
    expect(f.error).toHaveBeenCalledWith("Unable to delete");
    expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it("duplicates through the PDF endpoint and refreshes the list on success", async () => {
    const f = fixture();
    await f.choose("duplicate");
    expect(f.request).toHaveBeenCalledWith(
      "POST",
      "freeform/pdf/pdf-templates/duplicate",
      { data: { id: "1" } },
    );
    expect(f.reload).toHaveBeenCalledOnce();
    expect(f.confirm).not.toHaveBeenCalled();
  });

  it("prevents repeated actions while an operation is pending", async () => {
    const f = fixture();
    let resolve!: (value: unknown) => void;
    f.request.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const pending = f.choose("duplicate");
    await f.choose("duplicate");
    expect(f.request).toHaveBeenCalledOnce();
    resolve({ data: { success: true } });
    await pending;
  });
});
