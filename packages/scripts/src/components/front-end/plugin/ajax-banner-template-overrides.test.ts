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
});
