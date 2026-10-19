import { afterEach, expect, it, vi } from "vitest";
import {
  blackSignatureInk,
  hasOpaqueSignatureBackground,
  mountSignaturePreviews,
  signatureDownload,
} from "./signature-preview";

function pixels(values: number[], width = 2) {
  return {
    data: new Uint8ClampedArray(values),
    width,
    height: values.length / 4 / width,
  } as ImageData;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it("displays colored transparent ink as black without changing its opacity", () => {
  const image = pixels([
    0, 0, 0, 0, 10, 80, 220, 128, 250, 250, 250, 255, 0, 0, 0, 0,
  ]);
  expect(hasOpaqueSignatureBackground(image)).toBe(false);
  blackSignatureInk(image);
  expect(Array.from(image.data)).toEqual([
    0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 255, 0, 0, 0, 0,
  ]);
});

it("leaves opaque legacy backgrounds and ink colors intact", () => {
  const image = pixels([
    255, 255, 255, 255, 20, 30, 200, 255, 250, 248, 240, 255, 255, 255, 255,
    255,
  ]);
  const original = Array.from(image.data);
  expect(hasOpaqueSignatureBackground(image)).toBe(true);
  blackSignatureInk(image);
  expect(Array.from(image.data)).toEqual(original);
});

it("exports JPEG with a white background and the correct MIME type at original dimensions", () => {
  const calls: string[] = [];
  const context = {
    fillStyle: "",
    fillRect: vi.fn(() => calls.push("background")),
    drawImage: vi.fn(() => calls.push("image")),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const encode = vi
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockImplementation(function (this: HTMLCanvasElement, mime) {
      expect(this.width).toBe(300);
      expect(this.height).toBe(200);
      return `data:${mime};base64,saved`;
    });
  const image = { naturalWidth: 300, naturalHeight: 200 } as HTMLImageElement;
  signatureDownload(image, "jpg");
  expect(context.fillStyle).toBe("#fff");
  expect(calls).toEqual(["background", "image"]);
  expect(encode).toHaveBeenLastCalledWith("image/jpeg");
  calls.length = 0;
  signatureDownload(image, "png");
  expect(calls).toEqual(["image"]);
  expect(encode).toHaveBeenLastCalledWith("image/png");
});

it("processes small thumbnails once, including rows added by AJAX, without changing saved inputs", async () => {
  const data = pixels([0, 0, 0, 0, 20, 50, 200, 255, 0, 0, 0, 0, 0, 0, 0, 0]);
  const context = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => data),
    putImageData: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,preview",
  );
  const source = "data:image/png;base64,original";
  const root = document.createElement("div");
  document.body.append(root);
  root.innerHTML = `<input type="hidden" value="${source}"><img src="${source}" data-freeform-signature-preview="thumbnail">`;
  const first = root.querySelector("img")!;
  for (const [key, value] of Object.entries({
    complete: false,
    naturalWidth: 800,
    naturalHeight: 200,
  }))
    Object.defineProperty(first, key, { value });
  const stop = mountSignaturePreviews(root);
  first.dispatchEvent(new Event("load"));
  const canvas = context.drawImage.mock
    .calls[0][0] as unknown as HTMLImageElement;
  expect(canvas).toBe(first);
  expect(context.drawImage).toHaveBeenCalledWith(first, 0, 0, 160, 40);
  expect(first.src).toBe("data:image/png;base64,preview");
  expect(root.querySelector("input")!.value).toBe(source);
  first.dispatchEvent(new Event("load"));
  expect(context.drawImage).toHaveBeenCalledTimes(1);
  const next = first.cloneNode() as HTMLImageElement;
  next.src = source;
  for (const [key, value] of Object.entries({
    complete: false,
    naturalWidth: 800,
    naturalHeight: 200,
  }))
    Object.defineProperty(next, key, { value });
  root.append(next);
  await Promise.resolve();
  next.dispatchEvent(new Event("load"));
  expect(context.drawImage).toHaveBeenCalledTimes(2);
  root.append(first);
  await Promise.resolve();
  first.dispatchEvent(new Event("load"));
  expect(context.drawImage).toHaveBeenCalledTimes(2);
  stop();
});

it("does not load paths, URLs or unsupported images from custom CP markup", () => {
  const root = document.createElement("div");
  document.body.append(root);
  root.innerHTML =
    '<img data-freeform-signature-preview src="file:///tmp/signature.png">';
  const stop = mountSignaturePreviews(root);
  expect(root.querySelector("img")!.hidden).toBe(true);
  expect(root.querySelector("img")!.hasAttribute("src")).toBe(false);
  stop();
});

it.each([
  ["png", "field", "signature-12-16319.png"],
  ["jpg", "field", "signature-12-16319.jpg"],
  ["png", "form", "signature-12-16319.png"],
  ["png", "missing", "signature.png"],
])(
  "downloads %s with %s metadata as %s without changing the original PNG",
  (type, metadata, filename) => {
    const source = "data:image/png;base64,original";
    const root = document.createElement("div");
    if (metadata === "form")
      root.dataset.signatureFilename = "signature-12-16319";
    root.innerHTML = `<div class="signature-wrapper" ${metadata === "field" ? 'data-signature-filename="signature-12-16319"' : ""}>
    <input type="hidden" value="${source}">
    <img src="${source}" data-freeform-signature-preview="detail">
    <button type="button" data-signature-download="${type}">Download</button>
  </div>`;
    document.body.append(root);
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 300;
        naturalHeight = 200;
        onload: (() => void) | null = null;
        set src(value: string) {
          expect(value).toBe(source);
          this.onload?.();
        }
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,converted",
    );
    const download = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe(filename);
        expect(this.href).toBe(
          type === "png" ? source : "data:image/jpeg;base64,converted",
        );
      });
    const stop = mountSignaturePreviews(root);
    const button = root.querySelector("button")!;
    button.click();
    expect(download).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(false);
    expect(root.querySelector("input")!.value).toBe(source);
    stop();
  },
);
