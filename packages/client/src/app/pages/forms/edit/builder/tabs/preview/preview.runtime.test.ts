import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TextEncoder } from "node:util";
import { describe, expect, it, vi } from "vitest";

const script = readFileSync(
  resolve(process.cwd(), "../plugin/src/Resources/js/external/preview.js"),
  "utf8",
);

function preview(hasNextPage: boolean, controls: string, reduceMotion = false) {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = `
    <script id="freeform-preview-config" type="application/json">${JSON.stringify(
      {
        channel: "preview-channel",
        parentOrigin: "https://cp.test",
        handles: ["name"],
        hasNextPage,
      },
    )}</script>
    <div id="freeform-preview-status" hidden>Submissions are disabled.</div>
    <form id="form" data-freeform><input name="name" value="Test">${controls}</form>
    <button id="external" type="submit" form="form">External submit</button>`;
  const postMessage = vi.fn();
  const scrollIntoView = vi.fn();
  const focus = vi.fn();
  const status = doc.getElementById("freeform-preview-status")!;
  status.scrollIntoView = scrollIntoView;
  status.focus = focus;
  new Function(
    "document",
    "window",
    "Element",
    "FormData",
    "TextEncoder",
    script,
  )(
    doc,
    { parent: { postMessage }, matchMedia: () => ({ matches: reduceMotion }) },
    Element,
    FormData,
    TextEncoder,
  );
  doc.dispatchEvent(new Event("DOMContentLoaded"));
  postMessage.mockClear();
  return { doc, postMessage, scrollIntoView, focus };
}

describe("preview submission controls", () => {
  it.each([
    '<button id="submit">Submit</button>',
    '<button id="submit" type="submit"><span>Submit</span></button>',
    '<button id="submit" type="button" data-freeform-action="submit">Submit</button>',
    '<input id="submit" type="submit" value="Submit">',
    '<input id="submit" type="image" alt="Submit">',
  ])(
    "shows the notice and scrolls to it instead of submitting for %s",
    (markup) => {
      const { doc, postMessage, scrollIntoView, focus } = preview(
        false,
        markup,
      );
      for (const id of ["submit", "external"]) {
        const control = doc.getElementById(id) as HTMLButtonElement;
        expect(control.disabled).toBe(false);
        expect(control.getAttribute("aria-disabled")).toBeNull();
        control.click();
        expect(doc.getElementById("freeform-preview-status")!.hidden).toBe(
          false,
        );
      }
      expect(postMessage).not.toHaveBeenCalled();
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    },
  );

  it("blocks Enter/requestSubmit on the final page without another preview request", () => {
    const { doc, postMessage } = preview(false, "<button>Submit</button>");
    const form = doc.querySelector("form")!;
    const templateHandler = vi.fn();
    form.addEventListener("submit", templateHandler);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    expect(form.dispatchEvent(event)).toBe(false);
    expect(templateHandler).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
    expect(doc.getElementById("freeform-preview-status")!.hidden).toBe(false);
  });

  it("intercepts nested submit controls before a template handler can submit", () => {
    const { doc, postMessage } = preview(
      false,
      '<button id="submit" type="button" data-freeform-action="submit"><span>Submit</span></button>',
    );
    (doc.getElementById("submit") as HTMLButtonElement).disabled = false;
    const templateHandler = vi.fn();
    doc.getElementById("submit")!.addEventListener("click", templateHandler);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    expect(doc.querySelector("#submit span")!.dispatchEvent(click)).toBe(false);
    expect(templateHandler).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("keeps Next and Back usable and forwards only preview navigation", () => {
    const { doc, postMessage } = preview(
      true,
      '<button id="next" type="submit"><span>Next</span></button><button id="back" data-freeform-action="back">Back</button>',
    );
    expect((doc.getElementById("next") as HTMLButtonElement).disabled).toBe(
      false,
    );
    for (const selector of ["#next span", "#back"]) {
      doc
        .querySelector(selector)!
        .dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    }
    expect(postMessage.mock.calls.map(([message]) => message.action)).toEqual([
      "next",
      "back",
    ]);
    expect(postMessage.mock.calls[0]).toEqual([
      {
        type: "freeform-preview",
        channel: "preview-channel",
        action: "next",
        values: { name: "Test" },
      },
      "https://cp.test",
    ]);
  });

  it("preserves final-page Back and blocks Save without advancing", () => {
    const { doc, postMessage } = preview(
      false,
      '<button id="back" name="form_previous_page_button">Back</button><button id="save" data-freeform-save>Save</button>',
    );
    for (const id of ["back", "save"]) {
      const control = doc.getElementById(id) as HTMLButtonElement;
      expect(control.disabled).toBe(false);
      control.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    }
    expect(postMessage.mock.calls.map(([message]) => message.action)).toEqual([
      "back",
    ]);
    expect(doc.getElementById("freeform-preview-status")!.hidden).toBe(false);
  });
});

it("scrolls to the notice without animation when reduced motion is preferred", () => {
  const { doc, scrollIntoView } = preview(
    false,
    '<button id="submit">Submit</button>',
    true,
  );
  (doc.getElementById("submit") as HTMLButtonElement).click();
  expect(scrollIntoView).toHaveBeenCalledWith({
    behavior: "auto",
    block: "start",
    inline: "nearest",
  });
});
