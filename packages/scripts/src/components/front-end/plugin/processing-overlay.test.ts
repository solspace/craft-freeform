import { afterEach, describe, expect, it, vi } from "vitest";

import Freeform from "./freeform";

const setup = (overlay = true) => {
  document.body.innerHTML = `<form data-freeform data-ajax ${overlay ? "data-show-processing-overlay" : ""} data-processing-text="Sending…"><button type="submit" data-freeform-action="submit">Send</button><button type="submit" name="form_previous_page_button" data-freeform-action="back">Back</button></form>`;
  const form = document.querySelector("form")!;
  const freeform = new Freeform(form);
  freeform._handlers = [];
  vi.advanceTimersByTime(60);
  return { form, freeform };
};

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("processing overlay", () => {
  it("shows during submit validation and clears if submission is canceled", () => {
    vi.useFakeTimers();
    const { form } = setup();
    form.addEventListener("freeform-on-submit", (event) => {
      const overlay = form.querySelector(".freeform-processing-overlay");
      expect(overlay?.getAttribute("role")).toBe("status");
      expect(overlay?.textContent).toBe("Sending…");
      event.preventDefault();
    });

    form
      .querySelector<HTMLButtonElement>("[data-freeform-action=submit]")!
      .click();
    expect(form.querySelector(".freeform-processing-overlay")).toBeNull();
    expect(form.hasAttribute("data-freeform-overlay-active")).toBe(false);
  });

  it("does not show for Back or when the option is disabled", () => {
    vi.useFakeTimers();
    const { form } = setup();
    form.addEventListener("freeform-on-submit", (event) => {
      expect(form.querySelector(".freeform-processing-overlay")).toBeNull();
      event.preventDefault();
    });
    form
      .querySelector<HTMLButtonElement>("[data-freeform-action=back]")!
      .click();

    const disabled = setup(false);
    disabled.form.addEventListener("freeform-ajax-before-submit", (event) => {
      expect(
        disabled.form.querySelector(".freeform-processing-overlay"),
      ).toBeNull();
      event.preventDefault();
    });
    disabled.form
      .querySelector<HTMLButtonElement>("[data-freeform-action=submit]")!
      .click();
  });

  it("clears the overlay when an AJAX submission is canceled", () => {
    vi.useFakeTimers();
    const { form, freeform } = setup();
    let beforeAjax = false;
    form.addEventListener("freeform-ajax-before-submit", (event) => {
      beforeAjax = true;
      expect(form.querySelector(".freeform-processing-overlay")).not.toBeNull();
      event.preventDefault();
    });

    freeform.lockSubmit();
    freeform._showProcessingOverlay();
    const button = form.querySelector<HTMLButtonElement>(
      "[data-freeform-action=submit]",
    )!;
    freeform._onSubmitAjax(new SubmitEvent("submit", { submitter: button }));
    expect(beforeAjax).toBe(true);
    expect(form.querySelector(".freeform-processing-overlay")).toBeNull();
  });
});
