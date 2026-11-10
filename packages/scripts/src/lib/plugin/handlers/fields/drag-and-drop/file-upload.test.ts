import type Freeform from "@components/front-end/plugin/freeform";
import { ajax } from "@lib/plugin/helpers/ajax";
import { afterEach, expect, it, vi } from "vitest";
import { handleFileUpload } from "./file-upload";

vi.mock("@lib/plugin/helpers/ajax", () => ({ ajax: { post: vi.fn() } }));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("shows the saved JPEG metadata and private thumbnail after HEIC conversion", async () => {
  document.body.innerHTML =
    '<form><button type="button" data-freeform-file-upload="photos" data-base-url="/freeform"><div data-preview-zone></div></button></form>';
  const form = document.querySelector("form")!;
  const container = document.querySelector<HTMLElement>(
    "[data-freeform-file-upload]",
  )!;
  const zone = container.querySelector("[data-preview-zone]")!;
  const freeform = {
    form,
    _dispatchEvent: vi.fn((name, detail) =>
      Object.assign(new Event(name), detail),
    ),
  } as unknown as Freeform;
  const preview = "data:image/jpeg;base64,/9j/AA==";
  vi.mocked(ajax.post).mockResolvedValue({
    data: {
      id: "saved-photo-id",
      name: "phone.jpg",
      extension: "jpg",
      size: "1.4 MB",
      preview,
    },
  });
  await handleFileUpload(
    new File(["heic"], "phone.heic", { type: "image/heic" }),
    "photos",
    container,
    zone,
    freeform,
  );
  const item = zone.querySelector("[data-file-preview]")!;
  expect(item.hasAttribute("data-completed")).toBe(true);
  expect(item.querySelector("[data-filename]")?.textContent).toBe("phone.jpg");
  expect(item.querySelector("[data-filesize]")?.textContent).toBe("1.4 MB");
  expect(
    item.querySelector("[data-thumbnail]")?.hasAttribute("data-has-preview"),
  ).toBe(true);
  expect(
    item.querySelector<HTMLInputElement>("input[type=hidden]")?.value,
  ).toBe("saved-photo-id");
});

it("keeps the optimized thumbnail when the original preview finishes reading later", async () => {
  let reader: { result: string; onloadend: () => void };
  vi.stubGlobal(
    "FileReader",
    class {
      result = "data:image/jpeg;base64,b3JpZ2luYWw=";
      onloadend = () => {};
      constructor() {
        reader = this;
      }
      readAsDataURL() {}
    },
  );
  document.body.innerHTML = "<form><div data-preview-zone></div></form>";
  const form = document.querySelector("form")!;
  const zone = form.querySelector<HTMLElement>("[data-preview-zone]")!;
  const freeform = {
    form,
    _dispatchEvent: vi.fn((name, detail) =>
      Object.assign(new Event(name), detail),
    ),
  } as unknown as Freeform;
  const preview = "data:image/jpeg;base64,/9j/AA==";
  vi.mocked(ajax.post).mockResolvedValue({ data: { id: "saved", preview } });
  await handleFileUpload(
    new File(["jpeg"], "photo.jpg"),
    "photos",
    form,
    zone,
    freeform,
  );
  const thumbnail = zone.querySelector<HTMLElement>("[data-thumbnail]")!;
  const savedBackground = thumbnail.style.backgroundImage;
  reader!.onloadend();
  expect(savedBackground).toContain(preview);
  expect(thumbnail.style.backgroundImage).toBe(savedBackground);
});

it("keeps a rejected conversion removable and does not add a saved asset reference", async () => {
  document.body.innerHTML =
    '<form><button type="button" data-freeform-file-upload="photos"><div data-preview-zone></div></button></form>';
  const form = document.querySelector("form")!;
  const container = form.querySelector<HTMLElement>(
    "[data-freeform-file-upload]",
  )!;
  const zone = container.querySelector("[data-preview-zone]")!;
  const freeform = {
    form,
    _dispatchEvent: vi.fn((name, detail) =>
      Object.assign(new Event(name), detail),
    ),
  } as unknown as Freeform;
  vi.mocked(ajax.post).mockRejectedValue({
    response: {
      data: {
        type: "field-error",
        messages: ["Please choose a smaller photo."],
      },
    },
  });
  await handleFileUpload(
    new File(["heic"], "phone.heic"),
    "photos",
    container,
    zone,
    freeform,
  );
  expect(
    zone.querySelector("[data-file-preview]")?.hasAttribute("data-has-errors"),
  ).toBe(true);
  expect(zone.querySelector("input[type=hidden]")).toBeNull();
  zone.querySelector<HTMLButtonElement>("[data-remove-button]")!.click();
  expect(zone.children).toHaveLength(0);
});
