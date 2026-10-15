import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const base = "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/";

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  document.head.replaceChildren();
  document.body.replaceChildren();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function setup(
  locale = "default",
  fields = `<input data-datepicker data-datepicker-enabled data-datepicker-locale="${locale}" data-datepicker-format="Y-m-d" data-datepicker-enabledate>
    <input data-datepicker data-datepicker-enabled="false">`,
) {
  const instance = { set: vi.fn() };
  const flatpickr = vi.fn((input: Element) => {
    Object.assign(input, { _flatpickr: instance });
    return instance;
  });
  // Preview has an opaque about:srcdoc URL, without an HTTP(S) base.
  const previewWindow = {
    location: { href: "about:srcdoc" },
    flatpickr: undefined as typeof flatpickr | undefined,
  };
  vi.stubGlobal("window", previewWindow);
  document.body.innerHTML = `<form data-scripts-datepicker>${fields}</form>`;
  const form = document.querySelector("form")!;
  const { default: DatePicker } = await import("./datepicker");
  const handler = new DatePicker({
    form,
    has: (attribute: string) => form.hasAttribute(attribute),
    _dispatchEvent: (_event: string, data: unknown) => data,
  } as Freeform);
  return { handler, form, previewWindow, flatpickr, instance };
}

it.each(["default", "en"])(
  "loads date-picker assets and initializes in Preview without a %s locale request",
  async (locale) => {
    const { handler, form, previewWindow, flatpickr } = await setup(locale);
    expect(document.querySelector("link")?.href).toBe(
      `${base}flatpickr.min.css`,
    );
    const script = document.querySelector("script")!;
    expect(script.src).toBe(`${base}flatpickr.min.js`);
    previewWindow.flatpickr = flatpickr;
    script.dispatchEvent(new Event("load"));
    expect(flatpickr).toHaveBeenCalledExactlyOnceWith(
      form.querySelector("input"),
      expect.objectContaining({ dateFormat: "Y-m-d", noCalendar: false }),
    );
    expect(document.querySelectorAll("script")).toHaveLength(1);
    handler.reload();
    expect(flatpickr).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("link")).toHaveLength(1);
  },
);

it("loads a translated calendar locale over HTTPS in Preview", async () => {
  const { previewWindow, flatpickr, instance } = await setup("fr");
  previewWindow.flatpickr = flatpickr;
  document.querySelector("script")!.dispatchEvent(new Event("load"));
  const locale = document.querySelectorAll("script")[1];
  expect(locale.src).toBe(`${base}l10n/fr.js`);
  locale.dispatchEvent(new Event("load"));
  expect(instance.set).toHaveBeenCalledWith("locale", "fr");
});

it.each([
  '<input name="coverage">',
  '<input data-datepicker data-datepicker-enabled="false">',
  '<input data-datepicker data-datepicker-enabled="0">',
  '<input type="date">',
])(
  "does not request assets on a page without enabled pickers: %s",
  async (fields) => {
    const { handler, flatpickr } = await setup("default", fields);
    handler.reload();
    expect(document.querySelector("script, link")).toBeNull();
    expect(flatpickr).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  },
);

it("loads and initializes pickers that first appear after an AJAX page change", async () => {
  const { handler, form, previewWindow, flatpickr } = await setup(
    "default",
    '<input name="coverage">',
  );
  expect(document.querySelector("script, link")).toBeNull();
  form.innerHTML =
    '<input data-datepicker data-datepicker-enabled data-datepicker-locale="default">';
  handler.reload();
  handler.reload();
  expect(document.querySelectorAll("script")).toHaveLength(1);
  expect(document.querySelectorAll("link")).toHaveLength(1);
  previewWindow.flatpickr = flatpickr;
  document.querySelector("script")!.dispatchEvent(new Event("load"));
  expect(flatpickr).toHaveBeenCalledExactlyOnceWith(
    form.querySelector("input"),
    expect.anything(),
  );
  handler.reload();
  expect(flatpickr).toHaveBeenCalledTimes(1);
});
