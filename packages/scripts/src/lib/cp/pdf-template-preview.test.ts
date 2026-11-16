import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const template = readFileSync(
  "../plugin/src/templates/pdf-templates/_preview.twig",
  "utf8",
);
const script = template.split("{% js %}")[1].split("{% endjs %}")[0];

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const list = (value = "101", hasMore = false) => ({
  data: { submissions: [{ value, label: `Submission ${value}` }], hasMore },
});
const pdf = { data: { fileName: "unsaved-101.pdf", pdf: "JVBERi0xLjc=" } };
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

function fixture() {
  document.body.innerHTML = `
    <form id="save"><button type="button" id="pdf-preview-open">Preview PDF</button>
      <craft-combobox id="fileName"><input name="fileName" value="unsaved-{{ submission.id }}.pdf"></craft-combobox>
      <dialog id="pdf-preview-dialog">
        <button type="button" id="pdf-preview-close">Close</button>
        <select id="pdf-preview-form"><option value=""></option><option value="12">One</option><option value="34">Two</option></select>
        <input id="pdf-preview-search" disabled>
        <select id="pdf-preview-submission" disabled></select>
        <button type="button" id="pdf-preview-generate" disabled>Generate Preview</button>
        <button type="button" id="pdf-preview-more" hidden>Load more</button>
        <span id="pdf-preview-status"></span><p id="pdf-preview-error" hidden></p>
        <iframe id="pdf-preview-frame" hidden></iframe><div id="pdf-preview-empty"></div>
        <div id="pdf-preview-result" hidden><span id="pdf-preview-filename"></span><a id="pdf-preview-download"></a></div>
      </dialog>
    </form>`;
  const element = <T extends HTMLElement>(id: string) =>
    document.getElementById(`pdf-preview-${id}`) as T;
  const dialog = element<HTMLDialogElement>("dialog");
  dialog.showModal = () => dialog.setAttribute("open", "");
  dialog.close = () => {
    dialog.removeAttribute("open");
    dialog.dispatchEvent(new Event("close"));
  };
  const request = vi.fn().mockResolvedValue(list());
  let draft = "<h1>Unsaved body</h1>";
  const createObjectURL = vi.fn().mockReturnValue("blob:pdf-preview");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  const craft = {
    t: (_category: string, message: string) => message,
    sendActionRequest: request,
  };
  const ace = { edit: () => ({ getValue: () => draft }) };
  new Function("Craft", "ace", script)(craft, ace);
  const choose = (id: string, value: string) => {
    const input = element<HTMLSelectElement>(id);
    input.value = value;
    input.dispatchEvent(new Event("change"));
  };
  element<HTMLButtonElement>("open").click();
  return {
    element,
    dialog,
    request,
    choose,
    createObjectURL,
    revokeObjectURL,
    setDraft: (value: string) => {
      draft = value;
    },
    generate: () => element<HTMLButtonElement>("generate").click(),
    ready: async () => {
      choose("form", "12");
      await settle();
      choose("submission", "101");
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("PDF template preview", () => {
  it("renders the latest unsaved body and filename without submitting or saving the editor", async () => {
    const f = fixture();
    const save = vi.fn();
    document.getElementById("save")!.addEventListener("submit", save);
    await f.ready();
    f.setDraft("<h1>Changed again without saving</h1>");
    f.request.mockResolvedValueOnce(pdf);
    f.generate();
    await settle();
    expect(f.request).toHaveBeenLastCalledWith(
      "POST",
      "freeform/pdf/pdf-templates/preview",
      {
        data: {
          formId: "12",
          submissionId: "101",
          fileName: "unsaved-{{ submission.id }}.pdf",
          body: "<h1>Changed again without saving</h1>",
        },
      },
    );
    expect(save).not.toHaveBeenCalled();
    expect(f.element<HTMLIFrameElement>("frame").getAttribute("src")).toBe(
      "blob:pdf-preview",
    );
    expect(f.element<HTMLAnchorElement>("download").download).toBe(
      "unsaved-101.pdf",
    );
    expect(f.element("filename").textContent).toBe("unsaved-101.pdf");
    expect(document.getElementById("save")!.contains(f.dialog)).toBe(false);
  });

  it("ignores a delayed submission list after switching to another form", async () => {
    const f = fixture();
    const old = deferred();
    f.request
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(list("202"));
    f.choose("form", "12");
    f.choose("form", "34");
    await settle();
    old.resolve(list("101"));
    await settle();
    expect(f.element("submission").textContent).toContain("Submission 202");
    expect(f.element("submission").textContent).not.toContain("Submission 101");
    expect(f.element<HTMLButtonElement>("generate").disabled).toBe(true);
  });

  it("shows a Twig error as text and allows a corrected draft to be previewed", async () => {
    const f = fixture();
    await f.ready();
    f.request.mockRejectedValueOnce({
      response: { data: { message: "Unexpected <tag> on line 2" } },
    });
    f.generate();
    await settle();
    expect(f.element("error").textContent).toBe("Unexpected <tag> on line 2");
    expect(f.element("error").children).toHaveLength(0);
    expect(f.element<HTMLButtonElement>("generate").disabled).toBe(false);
    f.request.mockResolvedValueOnce(pdf);
    f.generate();
    await settle();
    expect(f.element("error").hidden).toBe(true);
    expect(f.element("frame").hidden).toBe(false);
  });

  it("discards an interrupted PDF response after the dialog closes", async () => {
    const f = fixture();
    await f.ready();
    const pending = deferred();
    f.request.mockReturnValueOnce(pending.promise);
    f.generate();
    f.dialog.close();
    pending.resolve(pdf);
    await settle();
    expect(f.createObjectURL).not.toHaveBeenCalled();
    expect(f.element("frame").hidden).toBe(true);
  });

  it("clears a previous PDF when choosing another submission and releases its URL", async () => {
    const f = fixture();
    await f.ready();
    f.request.mockResolvedValueOnce(pdf);
    f.generate();
    await settle();
    f.choose("submission", "");
    expect(f.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-preview");
    expect(f.element("frame").hidden).toBe(true);
    expect(f.element<HTMLButtonElement>("generate").disabled).toBe(true);
  });

  it("retries a failed submission request without closing the dialog", async () => {
    const f = fixture();
    f.request.mockRejectedValueOnce(new Error("Offline"));
    f.choose("form", "12");
    await settle();
    expect(f.element("more").hidden).toBe(false);
    expect(f.element("more").textContent).toBe("Try again");
    f.request.mockResolvedValueOnce(list());
    f.element<HTMLButtonElement>("more").click();
    await settle();
    expect(f.element<HTMLSelectElement>("submission").disabled).toBe(false);
    expect(f.element("error").hidden).toBe(true);
  });

  it("loads more submissions while retaining the selected submission", async () => {
    const f = fixture();
    f.request.mockResolvedValueOnce(list("101", true));
    await f.ready();
    f.request.mockResolvedValueOnce(list("102"));
    f.element<HTMLButtonElement>("more").click();
    await settle();
    expect(f.element<HTMLSelectElement>("submission").value).toBe("101");
    expect(f.element("submission").textContent).toContain("Submission 102");
    expect(f.request.mock.calls[1][2].data.offset).toBe(1);
  });

  it("invalidates the current selection as soon as search changes", async () => {
    vi.useFakeTimers();
    const f = fixture();
    await f.ready();
    const search = f.element<HTMLInputElement>("search");
    search.value = "202";
    search.dispatchEvent(new Event("input"));
    expect(f.element<HTMLButtonElement>("generate").disabled).toBe(true);
    f.request.mockResolvedValueOnce(list("202"));
    await vi.advanceTimersByTimeAsync(300);
    expect(f.request).toHaveBeenLastCalledWith(
      "POST",
      "freeform/pdf/pdf-templates/preview-submissions",
      {
        data: { formId: "12", search: "202", offset: 0 },
      },
    );
    expect(f.element("submission").textContent).not.toContain("Submission 101");
  });
});
