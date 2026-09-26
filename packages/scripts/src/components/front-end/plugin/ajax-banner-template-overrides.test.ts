import { afterEach, describe, expect, it, vi } from "vitest";

import Freeform from "./freeform";

const setup = (form: HTMLFormElement) => {
  const freeform = new Freeform(form);
  freeform._handlers = [];
  vi.advanceTimersByTime(60);
  return freeform;
};

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("AJAX banner template overrides", () => {
  it("uses resolved success and error attributes with each form's translated messages", () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<form data-freeform data-success-message="Merci !" data-error-message="Réessayez."></form>';
    const form = document.querySelector("form")!;
    form.setAttribute(
      "data-success-banner-attributes",
      JSON.stringify({
        class: "rounded-md bg-green-50 md:text-green-700",
        id: "success-message",
        role: "status",
        "aria-live": "polite",
        "data-theme": "custom",
        style: "border: 1px solid green",
        hidden: false,
        tag: "aside",
      }),
    );
    form.setAttribute(
      "data-error-banner-attributes",
      JSON.stringify({
        class: "rounded-md bg-red-50",
        role: "alert",
        "data-important": true,
      }),
    );

    const freeform = setup(form);
    freeform._renderSuccessBanner();
    const success = form.querySelector<HTMLElement>(
      '[data-freeform-ajax-banner="success"]',
    )!;
    expect(success.tagName).toBe("DIV");
    expect(success.className).toBe("rounded-md bg-green-50 md:text-green-700");
    expect(success.id).toBe("success-message");
    expect(success.getAttribute("role")).toBe("status");
    expect(success.getAttribute("aria-live")).toBe("polite");
    expect(success.getAttribute("data-theme")).toBe("custom");
    expect(success.getAttribute("style")).toBe("border: 1px solid green");
    expect(success.hasAttribute("hidden")).toBe(false);
    expect(success.textContent).toBe("Merci !");

    freeform._removeMessages();
    freeform._renderFormErrors(["Required field"]);
    const error = form.querySelector<HTMLElement>(
      '[data-freeform-ajax-banner="error"]',
    )!;
    expect(error.className).toBe("rounded-md bg-red-50");
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.hasAttribute("data-important")).toBe(true);
    expect(error.textContent).toBe("Réessayez.Required field");
    freeform._removeMessages();
    expect(form.querySelector("[data-freeform-ajax-banner]")).toBeNull();
  });

  it("honors existing freeform-ready class overrides and custom render callbacks", () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<form data-freeform data-success-message="Done"></form>';
    const form = document.querySelector("form")!;
    form.setAttribute(
      "data-success-banner-attributes",
      JSON.stringify({ class: "template-class", role: "status" }),
    );
    form.addEventListener("freeform-ready", (event) => {
      Object.assign(
        (event as Event & { options: Record<string, unknown> }).options,
        {
          successClassBanner: "js-class",
        },
      );
    });
    const freeform = setup(form);
    freeform._renderSuccessBanner();
    const banner = form.querySelector<HTMLElement>(
      '[data-freeform-ajax-banner="success"]',
    )!;
    expect(banner.className).toBe("js-class");
    expect(banner.getAttribute("role")).toBe("status");
    freeform._removeMessages();
    expect(banner.isConnected).toBe(false);

    freeform.options.renderSuccess = () => {
      form.appendChild(document.createElement("aside"));
    };
    freeform._renderSuccessBanner();
    expect(form.querySelector("aside")).not.toBeNull();
    expect(form.querySelector("[data-freeform-ajax-banner]")).toBeNull();
  });

  it("keeps one form's banners when another form clears its messages", () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<form data-freeform data-success-message="First"></form><form data-freeform data-error-message="Second"></form>';
    const [first, second] = Array.from(document.querySelectorAll("form"));
    const firstFreeform = setup(first);
    const secondFreeform = setup(second);
    firstFreeform._renderSuccessBanner();
    secondFreeform._renderFormErrors([]);

    firstFreeform._removeMessages();
    expect(first.querySelector("[data-freeform-ajax-banner]")).toBeNull();
    expect(
      second.querySelector('[data-freeform-ajax-banner="error"]')?.textContent,
    ).toBe("Second");
  });

  it("does not remove unrelated elements that share a template banner class", () => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<form data-freeform><div class="alert" id="instructions">Instructions</div></form>';
    const form = document.querySelector("form")!;
    form.setAttribute(
      "data-success-banner-attributes",
      JSON.stringify({ class: "alert" }),
    );
    form.setAttribute(
      "data-error-banner-attributes",
      JSON.stringify({ class: "alert" }),
    );

    const freeform = setup(form);
    freeform._renderSuccessBanner();
    freeform._removeMessages();
    expect(form.querySelector("#instructions")?.textContent).toBe(
      "Instructions",
    );
    expect(form.querySelector("[data-freeform-ajax-banner]")).toBeNull();

    freeform._renderFormErrors([]);
    freeform._removeMessages();
    expect(form.querySelector("#instructions")?.textContent).toBe(
      "Instructions",
    );
    expect(form.querySelector("[data-freeform-ajax-banner]")).toBeNull();
  });

  it("still cleans up banners created by legacy render callbacks", () => {
    vi.useFakeTimers();
    document.body.innerHTML = "<form data-freeform></form>";
    const form = document.querySelector("form")!;
    form.setAttribute(
      "data-success-banner-attributes",
      JSON.stringify({ class: "custom-success" }),
    );
    form.setAttribute(
      "data-error-banner-attributes",
      JSON.stringify({ class: "custom-error" }),
    );

    const freeform = setup(form);
    freeform.options.renderSuccess = () => {
      form.insertAdjacentHTML(
        "afterbegin",
        '<div class="custom-success"></div>',
      );
    };
    freeform.options.renderFormErrors = () => {
      form.insertAdjacentHTML("afterbegin", '<div class="custom-error"></div>');
    };
    freeform._renderSuccessBanner();
    freeform._renderFormErrors([]);
    freeform._removeMessages();

    expect(form.querySelector(".custom-success, .custom-error")).toBeNull();
  });

  it("still cleans up an unmarked banner from a custom render event", () => {
    vi.useFakeTimers();
    document.body.innerHTML = "<form data-freeform></form>";
    const form = document.querySelector("form")!;
    form.setAttribute(
      "data-success-banner-attributes",
      JSON.stringify({ class: "notice" }),
    );
    form.addEventListener("freeform-render-success", (event) => {
      event.preventDefault();
      form.insertAdjacentHTML("afterbegin", '<div class="notice"></div>');
    });

    const freeform = setup(form);
    freeform._renderSuccessBanner();
    expect(form.querySelector(".notice")).not.toBeNull();
    freeform._removeMessages();
    expect(form.querySelector(".notice")).toBeNull();
  });
});
