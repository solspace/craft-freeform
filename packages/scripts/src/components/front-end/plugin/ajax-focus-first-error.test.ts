import { ajax } from "@lib/plugin/helpers/ajax";
import { afterEach, describe, expect, it, vi } from "vitest";

import Freeform from "./freeform";

vi.mock("@lib/plugin/helpers/ajax", () => ({ ajax: vi.fn() }));

const setup = (markup: string) => {
  vi.useFakeTimers();
  document.body.innerHTML = markup;
  const form = document.querySelector<HTMLFormElement>("form")!;
  const freeform = new Freeform(form);
  freeform._handlers = [];
  vi.advanceTimersByTime(60);
  return { form, freeform };
};

const submitWithErrors = async (
  freeform: Freeform,
  errors: Record<string, string[]>,
  formErrors: string[] = [],
) => {
  vi.mocked(ajax).mockResolvedValueOnce({
    status: 200,
    data: {
      success: false,
      errors,
      formErrors,
      actions: [],
      html: null,
    },
    request: new XMLHttpRequest(),
  } as never);
  freeform._onSubmitAjax(new SubmitEvent("submit"));
  await Promise.resolve();
  await Promise.resolve();
};

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(ajax).mockReset();
  document.body.innerHTML = "";
});

describe("AJAX focus first error", () => {
  it("focuses the first visible invalid field in form order and skips scrolling to the top", async () => {
    const { form, freeform } = setup(`
      <form data-freeform data-ajax data-focus-first-error data-auto-scroll>
        <div data-field-container="hidden"><input name="hidden" hidden></div>
        <div data-field-container="concealed" style="display:none"><input name="concealed"></div>
        <div data-field-container="disabled"><input name="disabled" disabled></div>
        <div data-field-container="name"><input name="name"></div>
        <div data-field-container="email"><input name="email"></div>
      </form>
    `);
    const scroll = vi.spyOn(freeform, "_scrollToForm");

    await submitWithErrors(freeform, {
      email: ["Email required"],
      name: ["Name required"],
      hidden: ["Hidden"],
      concealed: ["Concealed"],
      disabled: ["Disabled"],
    });

    expect(document.activeElement).toBe(form.querySelector('[name="name"]'));
    expect(scroll).not.toHaveBeenCalled();
    expect(
      form.querySelector('[name="name"]')?.getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("focuses an invalid field when another field is named hidden", async () => {
    const { form, freeform } = setup(`
      <form data-freeform data-ajax data-focus-first-error data-auto-scroll>
        <div data-field-container="hidden"><input id="form-input-hidden" name="hidden" type="hidden"></div>
        <div data-field-container="confirm"><input name="confirm"></div>
      </form>
    `);
    // Browsers can resolve form.hidden to an input named hidden instead of the HTML attribute.
    Object.defineProperty(form, "hidden", {
      value: form.querySelector('[name="hidden"]'),
      configurable: true,
    });
    const scroll = vi.spyOn(freeform, "_scrollToForm");

    await submitWithErrors(freeform, { confirm: ["Does not match"] });

    expect(document.activeElement).toBe(form.querySelector('[name="confirm"]'));
    expect(scroll).not.toHaveBeenCalled();
  });

  it("focuses a form-level error banner when there are no field errors", async () => {
    const { form, freeform } = setup(
      '<form data-freeform data-ajax data-focus-first-error data-error-message="Try again"><input name="email"></form>',
    );

    await submitWithErrors(freeform, {}, ["Form could not be submitted"]);

    const banner = form.querySelector<HTMLElement>(
      '[data-freeform-ajax-banner="error"]',
    )!;
    expect(document.activeElement).toBe(banner);
    expect(banner.tabIndex).toBe(-1);
    form.querySelector("input")!.focus();
    expect(banner.hasAttribute("tabindex")).toBe(false);
  });

  it("focuses the drag-and-drop upload control when it has a field error", async () => {
    const { form, freeform } = setup(
      '<form data-freeform data-ajax data-focus-first-error><div data-field-container="files"><button type="button" data-freeform-file-upload="files">Upload files</button></div></form>',
    );

    await submitWithErrors(freeform, { files: ["Upload a file"] });

    const upload = form.querySelector<HTMLButtonElement>(
      "[data-freeform-file-upload]",
    )!;
    expect(document.activeElement).toBe(upload);
    expect(upload.getAttribute("aria-invalid")).toBe("true");
  });

  it("uses rendered field errors when custom markup differs from the response keys", async () => {
    const { form, freeform } = setup(
      '<form data-freeform data-ajax data-focus-first-error data-auto-scroll><div data-field-container="confirm"><input name="confirm"></div><div data-field-container="message"><textarea name="message"></textarea></div></form>',
    );
    const scroll = vi.spyOn(freeform, "_scrollToForm");
    form.addEventListener("freeform-render-field-errors", (event) => {
      event.preventDefault();
      form
        .querySelector('[name="confirm"]')!
        .setAttribute("aria-invalid", "true");
      form
        .querySelector('[data-field-container="confirm"]')!
        .insertAdjacentHTML(
          "beforeend",
          "<ul data-field-errors><li>Does not match</li></ul>",
        );
    });

    await submitWithErrors(freeform, { other: ["Error"] });

    expect(document.activeElement).toBe(form.querySelector('[name="confirm"]'));
    expect(scroll).not.toHaveBeenCalled();
  });

  it("focuses a server-rendered field error after a full-page submission", () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<form data-freeform data-focus-first-error data-scroll-to-anchor><div data-freeform-error-banner>Try again</div><div data-field-container="name"><input name="name"></div><div data-field-container="confirm"><input name="confirm" aria-invalid="true"></div></form>';
    const form = document.querySelector<HTMLFormElement>("form")!;
    const freeform = new Freeform(form);
    freeform._handlers = [];
    const scroll = vi.spyOn(freeform, "_scrollToForm");

    vi.advanceTimersByTime(60);

    expect(document.activeElement).toBe(form.querySelector('[name="confirm"]'));
    expect(scroll).not.toHaveBeenCalled();
  });

  it("focuses the server-rendered banner when only the form has errors", () => {
    const { form } = setup(
      '<form data-freeform data-focus-first-error><div data-freeform-error-banner>Try again</div><input name="name"></form>',
    );

    expect(document.activeElement).toBe(
      form.querySelector("[data-freeform-error-banner]"),
    );
  });

  it("preserves the existing scroll behavior when the setting is off", async () => {
    const { form, freeform } = setup(
      '<form data-freeform data-ajax data-auto-scroll><div data-field-container="name"><input name="name"></div></form>',
    );
    const scroll = vi.spyOn(freeform, "_scrollToForm");

    await submitWithErrors(freeform, { name: ["Required"] });

    expect(scroll).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(form.querySelector("input"));
  });
});
