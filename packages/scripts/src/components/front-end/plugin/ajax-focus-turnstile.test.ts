import { ajax } from "@lib/plugin/helpers/ajax";
import { afterEach, expect, it, vi } from "vitest";

import { loadCaptcha } from "../captchas/turnstile/utils/script-loader";
import Freeform from "./freeform";

vi.mock("@lib/plugin/helpers/ajax", () => ({ ajax: vi.fn() }));
vi.mock("../captchas/turnstile/utils/script-loader", () => ({
  getContainer: (form: HTMLFormElement) =>
    form.querySelector('[data-captcha="turnstile"]'),
  loadCaptcha: vi.fn().mockResolvedValue(undefined),
  readConfig: () => ({ sitekey: "test" }),
}));

// The widget registers its AJAX reset listener on the document.
import "../captchas/turnstile/v0";

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(loadCaptcha).mockReset().mockResolvedValue(undefined);
  vi.mocked(ajax).mockReset();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("focuses the invalid field after an asynchronous Turnstile reset", async () => {
  vi.useFakeTimers();
  document.body.innerHTML = `
    <form data-freeform data-ajax data-focus-first-error data-auto-scroll>
      <div data-field-container="email"><input name="email"></div>
      <div data-captcha="turnstile"></div>
      <button type="submit">Submit</button>
    </form>`;
  const form = document.querySelector<HTMLFormElement>("form")!;
  const button = form.querySelector("button")!;
  const reset = vi.fn(() => button.focus());
  vi.stubGlobal("turnstile", { render: () => "widget", reset });

  const freeform = new Freeform(form);
  freeform._handlers = [];
  vi.advanceTimersByTime(60);
  await Promise.resolve(); // Let the widget render on freeform-ready.

  let finishReset: () => void = () => {};
  vi.mocked(loadCaptcha).mockImplementation(
    () => new Promise<void>((resolve) => (finishReset = resolve)),
  );
  vi.mocked(ajax).mockResolvedValueOnce({
    status: 200,
    data: {
      success: false,
      errors: { email: ["Required"] },
      formErrors: [],
      actions: [],
      html: null,
    },
    request: new XMLHttpRequest(),
  } as never);

  const scroll = vi.spyOn(freeform, "_scrollToForm");
  freeform._onSubmitAjax(new SubmitEvent("submit"));
  await Promise.resolve();
  await Promise.resolve();

  expect(reset).not.toHaveBeenCalled();
  expect(document.activeElement).not.toBe(form.querySelector('[name="email"]'));

  finishReset();
  for (let count = 0; count < 6; count++) await Promise.resolve();

  expect(reset).toHaveBeenCalled();
  expect(document.activeElement).toBe(form.querySelector('[name="email"]'));
  expect(scroll).not.toHaveBeenCalled();
});
