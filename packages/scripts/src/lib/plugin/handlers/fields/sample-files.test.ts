import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SampleFilesHandler, { clearSampleFile } from "./sample-files";

const descriptor = {
  key: "upload-uid",
  token: "signed-value",
  kind: "text",
  name: "Freeform-Sample.txt",
  mime: "text/plain",
  data: btoa("Sample"),
  size: 6,
  label: "Sample file",
  removeLabel: "Remove sample file",
};
beforeEach(() => {
  document.body.innerHTML = "";
});
afterEach(() => vi.unstubAllGlobals());
function setup(
  dnd = false,
  count = 1,
  maximum = 10,
  additionalFiles?: Array<typeof descriptor>,
) {
  document.body.innerHTML = dnd
    ? '<form><div data-freeform-file-upload="upload"><input type="file"><div data-preview-zone></div></div></form>'
    : '<form><input type="file" id="upload" name="upload[]" required><label for="upload">Upload</label></form>';
  const form = document.querySelector("form")!;
  const input = form.querySelector("input")!;
  const element = dnd ? form.querySelector("div")! : input;
  element.dataset.maxFiles = String(maximum);
  element.setAttribute(
    "data-freeform-sample-file",
    JSON.stringify({ ...descriptor, count, additionalFiles }),
  );
  const freeform = {
    form,
    _dispatchEvent: vi.fn((name: string, detail: object, target = form) => {
      const event = Object.assign(new Event(name), detail);
      target.dispatchEvent(event);
      return event;
    }),
  } as unknown as Freeform;
  const handler = new SampleFilesHandler(freeform);
  return { form, input, element, handler, freeform };
}
function dataEvent(form: HTMLFormElement, data: FormData) {
  form.dispatchEvent(Object.assign(new Event("formdata"), { formData: data }));
}
it("uses a signed marker fallback, preserves floating labels, and restores required checks when removed", () => {
  vi.stubGlobal("DataTransfer", undefined);
  const { form, input, handler } = setup();
  expect(input.nextElementSibling?.tagName).toBe("LABEL");
  expect(input.required).toBe(false);
  expect(new FormData(form).get("__freeform_sample_files[upload-uid]")).toBe(
    "signed-value",
  );
  handler.reload();
  expect(form.querySelectorAll("[data-freeform-sample-preview]")).toHaveLength(
    1,
  );
  form.querySelector<HTMLButtonElement>("button")!.click();
  expect(input.required).toBe(true);
  expect(new FormData(form).has("__freeform_sample_files[upload-uid]")).toBe(
    false,
  );
});
it("omits generated file bytes from submission and preserves unrelated real files", () => {
  const generated: File[] = [];
  vi.stubGlobal(
    "DataTransfer",
    class {
      items = { add: (file: File) => generated.push(file) };
      get files() {
        return generated;
      }
    },
  );
  document.body.innerHTML =
    '<form><input type="file" name="upload[]" required></form>';
  const form = document.querySelector("form")!;
  const input = form.querySelector("input")!;
  Object.defineProperty(input, "files", {
    configurable: true,
    writable: true,
    value: [],
  });
  input.dataset.freeformSampleFile = JSON.stringify(descriptor);
  new SampleFilesHandler({ form } as Freeform);
  expect(generated[0].name).toBe(descriptor.name);
  expect(input.required).toBe(true);
  const data = new FormData();
  data.append(input.name, generated[0]);
  data.append(input.name, new File(["Real"], "customer.txt"));
  dataEvent(form, data);
  expect(data.getAll(input.name).map((file: File) => file.name)).toEqual([
    "customer.txt",
  ]);
  input.dispatchEvent(new Event("change"));
  expect(form.querySelector("[data-freeform-sample-preview]")).toBeNull();
  const replacement = new FormData();
  replacement.append(input.name, new File(["Real"], descriptor.name));
  dataEvent(form, replacement);
  expect(replacement.getAll(input.name)).toHaveLength(1);
});
it("removes disabled markers and restores defaults on reset but respects canceled resets", async () => {
  const { form, input, element } = setup();
  input.disabled = true;
  const data = new FormData(form);
  dataEvent(form, data);
  expect(data.has("__freeform_sample_files[upload-uid]")).toBe(false);
  input.disabled = false;
  clearSampleFile(element, true);
  form.reset();
  await Promise.resolve();
  expect(form.querySelector("[data-freeform-sample-preview]")).not.toBeNull();
  clearSampleFile(element, true);
  form.addEventListener("reset", (event) => event.preventDefault());
  form.reset();
  await Promise.resolve();
  expect(form.querySelector("[data-freeform-sample-preview]")).toBeNull();
});
it("shows a local drag-and-drop preview with no asset value or network request", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { form, element, freeform } = setup(true);
  expect(
    form.querySelector("[data-completed][data-freeform-sample-preview]"),
  ).not.toBeNull();
  expect(form.querySelector('input[name="upload[]"]')).toBeNull();
  expect(new FormData(form).get("__freeform_sample_files[upload-uid]")).toBe(
    "signed-value",
  );
  expect(fetch).not.toHaveBeenCalled();
  form.querySelector<HTMLButtonElement>("[data-remove-button]")!.click();
  expect(form.querySelector("[data-file-preview]")).toBeNull();
  expect(freeform._dispatchEvent).toHaveBeenCalledWith(
    events.dragAndDrop.onChange,
    { container: element },
    element,
  );
});

it("removes individual samples while retaining one marker until the last is removed, and clears all when replaced", async () => {
  const { form, element, handler } = setup(true, 3);
  const previews = () =>
    form.querySelectorAll("[data-freeform-sample-preview]");
  expect(previews()).toHaveLength(3);
  expect(form.querySelectorAll('input[type="hidden"]')).toHaveLength(1);
  handler.reload();
  expect(previews()).toHaveLength(3);
  form.querySelector<HTMLButtonElement>("[data-remove-button]")!.click();
  expect(previews()).toHaveLength(2);
  expect(new FormData(form).get("__freeform_sample_files[upload-uid]")).toBe(
    "signed-value",
  );
  form.querySelector<HTMLButtonElement>("[data-remove-button]")!.click();
  form.querySelector<HTMLButtonElement>("[data-remove-button]")!.click();
  expect(previews()).toHaveLength(0);
  expect(new FormData(form).has("__freeform_sample_files[upload-uid]")).toBe(
    false,
  );
  form.reset();
  await Promise.resolve();
  expect(previews()).toHaveLength(3);
  clearSampleFile(element);
  expect(previews()).toHaveLength(0);
  expect(form.querySelector('input[type="hidden"]')).toBeNull();
});

it.each([
  [10, 3],
  [3, 3],
  [2, 2],
  [1, 1],
])(
  "caps drag-and-drop samples for a field limit of %s at %s",
  (maximum, expected) => {
    const { form } = setup(true, 100, maximum);
    expect(
      form.querySelectorAll("[data-freeform-sample-preview]"),
    ).toHaveLength(expected);
    expect(form.querySelector('input[name="upload[]"]')).toBeNull();
  },
);

it("uses each supplied image variant without uploading its bytes or creating asset inputs", () => {
  const second = {
    ...descriptor,
    name: "Freeform-Sample-Coast.png",
    kind: "image",
    mime: "image/png",
    data: btoa("second-image"),
  };
  const third = {
    ...descriptor,
    name: "Freeform-Sample-Lake.png",
    kind: "image",
    mime: "image/png",
    data: btoa("third-image"),
  };
  const { form } = setup(true, 3, 10, [second, third]);
  const thumbnails = Array.from(
    form.querySelectorAll<HTMLElement>("[data-thumbnail]"),
  );
  expect(thumbnails).toHaveLength(3);
  expect(thumbnails[1].style.backgroundImage).toContain(second.data);
  expect(thumbnails[2].style.backgroundImage).toContain(third.data);
  expect(form.querySelectorAll('input[type="hidden"]')).toHaveLength(1);
  expect(form.querySelector('input[name="upload[]"]')).toBeNull();
});
