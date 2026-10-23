import { afterEach, describe, expect, it, vi } from "vitest";

import Freeform from "./freeform";

const setup = (html: string) => {
  vi.useFakeTimers();
  document.body.innerHTML = html;
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

describe("AJAX field error template overrides", () => {
  it("keeps search-only address fields hidden and puts errors on the visible lookup until the required components are filled", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="location" data-field-error-id="location-error"><div data-freeform-location="{}"><input name="location[search]" data-freeform-location-search><div data-freeform-location-components hidden><input name="location[line1]" data-location-required><input name="location[city]" data-location-required></div></div></div></form>',
    );
    const search = form.querySelector<HTMLInputElement>(
      '[name="location[search]"]',
    )!;
    const group = form.querySelector<HTMLElement>(
      "[data-freeform-location-components]",
    )!;
    freeform._renderFieldErrors(
      { location: ["Please enter an address"] },
      '<form><div data-field-container="location"><div data-freeform-location="{}"><input name="location[search]" data-freeform-location-search class="input-error"><div data-freeform-location-components hidden><input name="location[line1]" data-location-required><input name="location[city]" data-location-required></div></div><ul id="location-error" class="text-danger"><li>Please enter an address</li></ul></div></form>',
    );
    expect(group.hidden).toBe(true);
    expect(form.querySelectorAll("[aria-invalid=true]")).toHaveLength(1);
    expect(search.getAttribute("aria-invalid")).toBe("true");
    expect(search.classList.contains("freeform-has-errors")).toBe(true);
    expect(search.classList.contains("input-error")).toBe(true);
    expect(form.querySelector("[data-field-errors]")?.className).toBe(
      "text-danger",
    );
    expect(search.getAttribute("aria-describedby")).toBe("location-error");
    search.value = "123 Main";
    search.dispatchEvent(new Event("change"));
    expect(search.getAttribute("aria-invalid")).toBe("true");
    for (const input of group.querySelectorAll<HTMLInputElement>("input"))
      input.value = "Filled by selection";
    search.dispatchEvent(new Event("change"));
    expect(search.hasAttribute("aria-invalid")).toBe(false);
    expect(search.classList.contains("freeform-has-errors")).toBe(false);
    expect(search.classList.contains("input-error")).toBe(false);
    expect(form.querySelector("[data-field-errors]")).toBeNull();
    expect(group.hidden).toBe(true);
  });
  it("keeps errors on remaining missing components and clears them all before another submit", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="location" data-field-error-id="location-error"><div data-freeform-location="{}"><input name="location[line1]" data-location-required><input name="location[city]" data-location-required></div></div></form>',
    );
    freeform._renderFieldErrors({ location: ["Complete the address"] });
    const street = form.querySelector<HTMLInputElement>(
      '[name="location[line1]"]',
    )!;
    const city = form.querySelector<HTMLInputElement>(
      '[name="location[city]"]',
    )!;
    street.value = "123 Main";
    street.dispatchEvent(new Event("change"));
    expect(street.hasAttribute("aria-invalid")).toBe(false);
    expect(city.getAttribute("aria-invalid")).toBe("true");
    expect(form.querySelector("[data-field-errors]")).not.toBeNull();
    freeform._removeMessages();
    expect(form.querySelectorAll("[aria-invalid]")).toHaveLength(0);
    expect(form.querySelectorAll(".freeform-has-errors")).toHaveLength(0);
    expect(form.querySelector("[data-field-errors]")).toBeNull();
  });
  it("highlights the visible inputs of an empty Location and clears their errors together", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="location" data-field-error-id="location-error"><div data-freeform-location="{}"><input name="location[search]"><div><input name="location[line1]"></div><div><input name="location[city]"></div><input type="hidden" name="location[state]"></div></div><div data-field-container="other"><input name="other"></div></form>',
    );
    freeform._renderFieldErrors({
      location: ["Required"],
      other: ["Required"],
    });
    expect(
      form.querySelectorAll("[data-freeform-location] [aria-invalid=true]"),
    ).toHaveLength(3);
    expect(
      form.querySelector("[type=hidden]")?.hasAttribute("aria-invalid"),
    ).toBe(false);
    const city = form.querySelector<HTMLInputElement>(
      '[name="location[city]"]',
    )!;
    city.value = "Winnipeg";
    city.dispatchEvent(new Event("change"));
    expect(
      form.querySelectorAll("[data-freeform-location] [aria-invalid]"),
    ).toHaveLength(0);
    expect(
      form.querySelector("[data-field-container=location] [data-field-errors]"),
    ).toBeNull();
    expect(
      form.querySelector("[name=other]")?.getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("uses template error styles only on missing selected Location components", () => {
    const html = (error: boolean) =>
      `<form data-freeform><div data-field-container="location" data-field-error-id="location-error"><div data-freeform-location="{}"><input name="location[search]" class="input"><input name="location[line1]" data-location-required value="123 Main" class="input"><div><input name="location[city]" data-location-required class="input${error ? " input-error" : ""}"></div><input name="location[line2]" class="input"></div>${error ? '<ul id="location-error" class="errors"><li>City required</li></ul>' : ""}</div></form>`;
    const { form, freeform } = setup(html(false));
    freeform._renderFieldErrors({ location: ["City required"] }, html(true));
    const city = form.querySelector<HTMLInputElement>(
      '[name="location[city]"]',
    )!;
    expect(city.classList.contains("input-error")).toBe(true);
    expect(city.getAttribute("aria-describedby")).toBe("location-error");
    expect(form.querySelectorAll("[aria-invalid=true]")).toHaveLength(1);
    expect(
      form
        .querySelector('[name="location[line1]"]')
        ?.hasAttribute("aria-invalid"),
    ).toBe(false);
    city.value = "Winnipeg";
    city.dispatchEvent(new Event("change"));
    expect(city.classList.contains("input-error")).toBe(false);
    expect(form.querySelectorAll("[aria-invalid]")).toHaveLength(0);
  });

  it("uses the server-rendered field error styling without replacing the input", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="email" data-field-error-id="email-error" class="base"><label class="base-label"><input name="email" value="typed@example.com" class="base-input rounded" aria-describedby="email-instructions"></label><span id="email-instructions">Instructions</span></div></form>',
    );
    const input = form.querySelector("input")!;
    input.classList.add("client-added");
    input.value = "changed@example.com";

    const responseHtml =
      '<form><div data-field-container="email" class="base invalid-container"><label class="base-label invalid-label"><input name="email" class="rounded border-red-500 md:text-red-600"></label><ul id="email-error" class="mt-1 text-sm text-red-600" role="alert" data-design="custom"><li>Required</li></ul></div></form>';
    freeform._renderFieldErrors({ email: ["Required"] }, responseHtml);

    const error = form.querySelector<HTMLElement>("[data-field-errors]")!;
    expect(error.className).toBe("mt-1 text-sm text-red-600");
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.getAttribute("data-design")).toBe("custom");
    expect(error.id).toBe("email-error");
    expect(error.textContent).toBe("Required");
    expect(
      form
        .querySelector('[data-field-container="email"]')
        ?.classList.contains("invalid-container"),
    ).toBe(true);
    expect(
      form.querySelector("label")?.classList.contains("invalid-label"),
    ).toBe(true);
    expect(input.classList.contains("base-input")).toBe(false);
    expect(input.classList.contains("border-red-500")).toBe(true);
    expect(input.classList.contains("md:text-red-600")).toBe(true);
    expect(input.classList.contains("client-added")).toBe(true);
    expect(input.value).toBe("changed@example.com");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(
      "email-instructions email-error",
    );

    input.dispatchEvent(new Event("change"));
    expect(form.querySelector("[data-field-errors]")).toBeNull();
    expect(
      form
        .querySelector('[data-field-container="email"]')
        ?.classList.contains("invalid-container"),
    ).toBe(false);
    expect(
      form.querySelector("label")?.classList.contains("invalid-label"),
    ).toBe(false);
    expect(input.classList.contains("base-input")).toBe(true);
    expect(input.classList.contains("border-red-500")).toBe(false);
    expect(input.classList.contains("client-added")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe("email-instructions");
  });

  it("keeps existing JS class overrides and the fallback when server markup is unavailable", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="name" data-field-error-id="name-error"><input name="name"></div></form>',
    );
    freeform.options.errorClassList = "js-error-class";
    freeform._renderFieldErrors(
      { name: ["Required"] },
      '<form><div data-field-container="name"><input name="name"><ul id="name-error" class="server-error-class"><li>Required</li></ul></div></form>',
    );
    expect(form.querySelector("[data-field-errors]")?.className).toBe(
      "js-error-class",
    );
    freeform._removeMessages();

    freeform._renderFieldErrors({ name: ["Still required"] });
    expect(form.querySelector("[data-field-errors]")?.className).toBe(
      "js-error-class",
    );
    expect(form.querySelector("input")?.getAttribute("aria-invalid")).toBe(
      "true",
    );
    freeform._removeMessages();
    expect(
      form.querySelector("input")?.getAttribute("aria-invalid"),
    ).toBeNull();
  });

  it("keeps error lists scoped to the submitted form", () => {
    const { form, freeform } = setup(
      '<form data-freeform><div data-field-container="name" data-field-error-id="name-error"><input name="name"></div></form><form><ul data-field-errors class="freeform-errors"><li>Other form</li></ul></form>',
    );
    freeform._renderFieldErrors({ name: ["Required"] });
    freeform._removeMessages();
    expect(form.querySelector("[data-field-errors]")).toBeNull();
    expect(document.querySelectorAll("[data-field-errors]")).toHaveLength(1);
  });
});
