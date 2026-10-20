import { afterEach, expect, it, vi } from "vitest";
import { mountSignatureBitmap } from "./signature.bitmap";

function context() {
  const ctx = {
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255]),
    })),
    fillStyle: "",
    strokeStyle: "",
    globalCompositeOperation: "source-over",
    getTransform: () => ({ a: 2, b: 0, c: 0, d: 2, e: -2, f: -2 }),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(() => ctx.fillStyle),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  };
  return ctx;
}
afterEach(() => vi.restoreAllMocks());

function fixture() {
  const display = context(),
    ink = context(),
    layer = context();
  let calls = 0;
  const contexts: HTMLCanvasElement[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      contexts.push(this);
      return (calls++ === 0
        ? ink
        : layer) as unknown as CanvasRenderingContext2D;
    },
  );
  const encode = vi
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue("data:image/png;base64,canonical");
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 200;
  const pad = { _ctx: display as unknown as CanvasRenderingContext2D };
  const bitmap = mountSignatureBitmap(canvas, pad, "#ffffff")!;
  return { display, ink, layer, contexts, encode, canvas, pad, bitmap };
}

it("mirrors geometry in bitmap coordinates while keeping all display colors out of saved ink", () => {
  const { pad, ink, display, bitmap, encode, contexts } = fixture();
  pad._ctx.fillStyle = "#ff0000";
  pad._ctx.fillRect(0, 0, 300, 200);
  pad._ctx.fillStyle = "#ffffff";
  pad._ctx.beginPath();
  pad._ctx.moveTo(10, 20);
  pad._ctx.arc(10, 20, 2, 0, Math.PI * 2);
  pad._ctx.closePath();
  pad._ctx.fill();
  expect(display.fillRect).toHaveBeenCalledOnce();
  expect(ink.fillRect).not.toHaveBeenCalled();
  expect(ink.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, -2, -2);
  expect(ink.moveTo).toHaveBeenCalledWith(10, 20);
  expect(ink.arc).toHaveBeenCalledWith(10, 20, 2, 0, Math.PI * 2);
  expect(display.fill.mock.results[0].value).toBe("#ffffff");
  expect(ink.fill.mock.results[0].value).toBe("#000000");
  expect(bitmap.toDataURL()).toBe("data:image/png;base64,canonical");
  expect(encode.mock.instances[0]).toBe(contexts[0]);
  expect(contexts[0].width).toBe(300);
  expect(contexts[0].height).toBe(200);
});

it("clears both bitmaps and restores canonical images with separate display coloring", () => {
  const { pad, bitmap, ink, layer, display, contexts } = fixture();
  pad._ctx.clearRect(0, 0, 300, 200);
  expect(ink.clearRect).toHaveBeenCalledWith(0, 0, 300, 200);
  const image = new Image();
  bitmap.restore(image);
  expect(ink.drawImage).toHaveBeenCalledWith(image, 0, 0, 300, 200);
  expect(layer.globalCompositeOperation).toBe("source-in");
  expect(layer.fillStyle).toBe("#ffffff");
  expect(display.drawImage).toHaveBeenCalledWith(contexts[1], 0, 0);
  bitmap.destroy();
  expect(pad._ctx).toBe(display);
});

it.each([
  [255, 255, 255, 255, 0, 0, 0, 255],
  [0, 0, 0, 0, 255, 0, 0, 255],
])(
  "restores legacy opaque or colored signatures without recoloring their pixels",
  (...pixels) => {
    const { bitmap, layer, display, ink } = fixture();
    layer.getImageData.mockReturnValue({ data: new Uint8ClampedArray(pixels) });
    const image = new Image();
    bitmap.restore(image);
    expect(display.drawImage).toHaveBeenCalledWith(image, 0, 0, 300, 200);
    expect(ink.drawImage).toHaveBeenCalledWith(image, 0, 0, 300, 200);
    expect(layer.fillRect).not.toHaveBeenCalled();
    expect(layer.globalCompositeOperation).toBe("source-over");
  },
);
