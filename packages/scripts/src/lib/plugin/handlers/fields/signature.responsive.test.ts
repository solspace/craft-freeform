import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountResponsiveSignatureCanvas } from "./signature.responsive";

let canvas: HTMLCanvasElement;
let context: {
  setTransform: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
};
let width: number;
let height: number;
let resize: () => void;
const disconnect = vi.fn();

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 100;
  canvas.style.border = "1px solid black";
  canvas.style.padding = "0px";
  width = 202;
  height = 52;
  context = { setTransform: vi.fn(), save: vi.fn(), restore: vi.fn() };
  vi.spyOn(canvas, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(canvas, "getBoundingClientRect").mockImplementation(
    () => ({ width, height }) as DOMRect,
  );
  disconnect.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("maps content coordinates at half size, accounting for the canvas border", () => {
  const controller = mountResponsiveSignatureCanvas(canvas);
  expect(context.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, -2, -2);
  // The library's screen point (101, 26) lands at bitmap point (200, 50).
  expect(101 * 2 - 2).toBe(200);
  expect(26 * 2 - 2).toBe(50);
  controller.destroy();
});

it("updates scale after layout changes without resetting the bitmap dimensions", () => {
  const controller = mountResponsiveSignatureCanvas(canvas);
  const setWidth = vi.spyOn(canvas, "width", "set");
  const setHeight = vi.spyOn(canvas, "height", "set");
  width = 802;
  height = 202;
  resize();
  expect(context.setTransform).toHaveBeenLastCalledWith(
    0.5,
    0,
    0,
    0.5,
    -0.5,
    -0.5,
  );
  expect(setWidth).not.toHaveBeenCalled();
  expect(setHeight).not.toHaveBeenCalled();
  expect(canvas.width).toBe(400);
  expect(canvas.height).toBe(100);
  controller.destroy();
});

it("clears and restores saved images in bitmap coordinates, then resumes scaled drawing", () => {
  const controller = mountResponsiveSignatureCanvas(canvas);
  context.setTransform.mockClear();
  const drawOrClear = vi.fn(() => {
    expect(context.save).toHaveBeenCalledOnce();
    expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, 0, 0);
  });
  controller.withBitmapCoordinates(drawOrClear);
  expect(drawOrClear).toHaveBeenCalledOnce();
  expect(context.restore).toHaveBeenCalledOnce();
  expect(context.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, -2, -2);
  controller.destroy();
});

it("restores scaled drawing even when a bitmap operation throws", () => {
  const controller = mountResponsiveSignatureCanvas(canvas);
  expect(() =>
    controller.withBitmapCoordinates(() => {
      throw new Error("draw failed");
    }),
  ).toThrow("draw failed");
  expect(context.restore).toHaveBeenCalledOnce();
  expect(context.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, -2, -2);
  controller.destroy();
});

it("waits for hidden pages to gain a usable size", () => {
  width = height = 0;
  const controller = mountResponsiveSignatureCanvas(canvas);
  expect(context.setTransform).not.toHaveBeenCalled();
  width = 402;
  height = 102;
  controller.sync();
  expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, -1, -1);
  controller.destroy();
});

it("falls back to window resize and removes observers and listeners on destroy", () => {
  vi.stubGlobal("ResizeObserver", undefined);
  const controller = mountResponsiveSignatureCanvas(canvas);
  width = 402;
  height = 102;
  window.dispatchEvent(new Event("resize"));
  expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, -1, -1);
  controller.destroy();
  context.setTransform.mockClear();
  window.dispatchEvent(new Event("resize"));
  expect(context.setTransform).not.toHaveBeenCalled();
});

it("disconnects the layout observer when removed", () => {
  const controller = mountResponsiveSignatureCanvas(canvas);
  controller.destroy();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, 0, 0);
});

function wrapInForm(scale?: string) {
  const form = document.createElement("form");
  if (scale !== undefined) form.dataset.freeformSignatureMaxScale = scale;
  const wrapper = document.createElement("div");
  wrapper.className = "freeform-signature-wrapper";
  wrapper.append(canvas);
  form.append(wrapper);
  canvas.width = 300;
  canvas.height = 200;
  return { form, wrapper };
}

it("limits a 300 by 200 pad to 375px by default without changing saved dimensions", () => {
  const { wrapper } = wrapInForm();
  const controller = mountResponsiveSignatureCanvas(canvas);
  expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe(
    "375px",
  );
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(200);
  controller.destroy();
  expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe("");
});

it.each([
  ["1", "300px"],
  ["2", "600px"],
  ["1.5", "450px"],
])("allows templates to set a growth limit of %s", (scale, expected) => {
  const { wrapper } = wrapInForm(scale);
  const controller = mountResponsiveSignatureCanvas(canvas);
  expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe(
    expected,
  );
  controller.destroy();
});

it.each(["", "0", "-1", "invalid", "Infinity", "1e308"])(
  "uses the safe default for an invalid growth limit (%s)",
  (scale) => {
    const { wrapper } = wrapInForm(scale);
    const controller = mountResponsiveSignatureCanvas(canvas);
    expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe(
      "375px",
    );
    controller.destroy();
  },
);

it("applies updated template limits on refresh and restores previous inline styling", () => {
  const { form, wrapper } = wrapInForm("1");
  wrapper.style.setProperty("--ff-signature-max-width", "200px", "important");
  const controller = mountResponsiveSignatureCanvas(canvas);
  form.dataset.freeformSignatureMaxScale = "1.5";
  controller.sync();
  expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe(
    "450px",
  );
  controller.destroy();
  expect(wrapper.style.getPropertyValue("--ff-signature-max-width")).toBe(
    "200px",
  );
  expect(wrapper.style.getPropertyPriority("--ff-signature-max-width")).toBe(
    "important",
  );
});
