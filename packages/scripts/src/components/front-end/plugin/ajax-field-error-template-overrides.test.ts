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
