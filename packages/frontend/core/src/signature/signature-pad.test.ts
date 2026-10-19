// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  SignatureTestImage,
  signatureCanvasStub,
  signaturePointer,
} from "../../../test/signature-canvas.js";
import { signatureJpeg, signaturePng } from "../../../test/signature-images.js";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import { validateSignatureValue } from "./signature.js";
import {
  mountSignaturePad,
  type SignaturePadController,
} from "./signature-pad.js";

let stub: ReturnType<typeof signatureCanvasStub>;
let controller: SignaturePadController;
let visibleCanvas: HTMLCanvasElement;
beforeEach(() => {
  SignatureTestImage.instances = [];
  stub = signatureCanvasStub();
  vi.stubGlobal("Image", SignatureTestImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      return this.isConnected || this === visibleCanvas
        ? stub.context
        : signatureCanvasStub().context;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    signaturePng,
  );
  vi.spyOn(
    HTMLCanvasElement.prototype,
    "getBoundingClientRect",
  ).mockReturnValue({
    left: 0,
    top: 0,
    width: 400,
    height: 100,
  } as DOMRect);
});
afterEach(() => {
  controller?.destroy();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup(value: unknown = "") {
  const canvas = document.createElement("canvas");
  visibleCanvas = canvas;
  const onChange = vi.fn();
  const onInkChange = vi.fn();
  let enabled = true;
  controller = mountSignaturePad(
    canvas,
    {},
    {
      onChange,
      onInkChange,
      isEnabled: () => enabled,
    },
  );
  controller.update(value);
  return {
    canvas,
    onChange,
    onInkChange,
    disable: () => {
      enabled = false;
    },
  };
}

function draw(canvas: HTMLCanvasElement) {
  signaturePointer(canvas, "pointerdown");
  signaturePointer(canvas, "pointermove", { clientX: 30 });
  signaturePointer(canvas, "pointerup", { clientX: 30 });
}

it("does not serialize a blank tap, a canceled tap, or stationary pointer moves", () => {
  const { canvas, onChange, onInkChange } = setup();
  for (const end of ["pointerup", "pointercancel", "pointerleave"]) {
    signaturePointer(canvas, "pointerdown");
    signaturePointer(canvas, "pointermove");
    signaturePointer(canvas, end);
  }
  expect(onChange).not.toHaveBeenCalled();
  expect(canvas.toDataURL).not.toHaveBeenCalled();
  expect(onInkChange).toHaveBeenLastCalledWith(false);
  const field = {
    required: true,
    label: "Signature",
  } as ManifestFieldDefinition;
  expect(validateSignatureValue(field, "")).toHaveLength(1);
});

it("serializes actual ink as a PNG and keeps its own controlled update intact", () => {
  const { canvas, onChange, onInkChange } = setup();
  draw(canvas);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(signaturePng);
  expect(onInkChange).toHaveBeenLastCalledWith(true);
  const clears = stub.state.clears;
  controller.update(signaturePng);
  expect(stub.state.clears).toBe(clears);
  expect(SignatureTestImage.instances).toHaveLength(0);
});

it.each([signaturePng, signatureJpeg])(
  "loads legacy bitmap values without rewriting them",
  (value) => {
    const { onChange, onInkChange } = setup(value);
    const image = SignatureTestImage.instances[0];
    expect(image.src).toBe(value);
    image.onload!();
    expect(stub.state.pixels).toBe(value);
    expect(onChange).not.toHaveBeenCalled();
    expect(onInkChange).toHaveBeenLastCalledWith(true);
  },
);

it("clears externally reset values and cancels the pending old image", () => {
  const { onChange, onInkChange } = setup(signatureJpeg);
  const delayed = SignatureTestImage.instances[0].onload!;
  controller.update("");
  delayed();
  expect(stub.state.pixels).toBe("");
  expect(stub.state.draws).toBe(0);
  expect(onInkChange).toHaveBeenLastCalledWith(false);
  expect(onChange).not.toHaveBeenCalled();
});

it("restores an externally replaced or reset saved image and ignores stale loads", () => {
  setup(signaturePng);
  const delayed = SignatureTestImage.instances[0].onload!;
  controller.update(signatureJpeg);
  delayed();
  SignatureTestImage.instances[1].onload!();
  expect(stub.state.pixels).toBe(signatureJpeg);
  expect(stub.state.draws).toBe(1);
});

it("cancels an active stroke when an external value resets the field", () => {
  const { canvas, onChange } = setup(signatureJpeg);
  signaturePointer(canvas, "pointerdown");
  signaturePointer(canvas, "pointermove", { clientX: 30 });
  controller.update("");
  signaturePointer(canvas, "pointerup");
  expect(onChange).not.toHaveBeenCalled();
  expect(stub.state.pixels).toBe("");
});

it("never lets a delayed old image overwrite fresh ink or a cleared pad", () => {
  const { canvas, onChange } = setup(signatureJpeg);
  const delayed = SignatureTestImage.instances[0].onload!;
  draw(canvas);
  delayed();
  expect(stub.state.pixels).toBe("ink");
  controller.clear();
  delayed();
  expect(stub.state.pixels).toBe("");
  expect(onChange).toHaveBeenLastCalledWith("");
});

it("ignores secondary buttons, additional pointers and dynamically disabled fields", () => {
  const { canvas, onChange, disable } = setup();
  signaturePointer(canvas, "pointerdown", { button: 2 });
  signaturePointer(canvas, "pointermove", { clientX: 30 });
  signaturePointer(canvas, "pointerup");
  signaturePointer(canvas, "pointerdown");
  signaturePointer(canvas, "pointermove", { pointerId: 2, clientX: 30 });
  signaturePointer(canvas, "pointerup", { pointerId: 2 });
  signaturePointer(canvas, "pointerup");
  disable();
  draw(canvas);
  expect(onChange).not.toHaveBeenCalled();
});

it("preserves high-DPI sizing and cancels callbacks and listeners on destroy", () => {
  vi.stubGlobal("devicePixelRatio", 2);
  const { canvas, onChange } = setup(signaturePng);
  expect(canvas.width).toBe(800);
  expect(canvas.height).toBe(200);
  expect(canvas.style.width).toBe("400px");
  expect(stub.state.transforms).toContainEqual([2, 0, 0, 2, 0, 0]);
  const delayed = SignatureTestImage.instances[0].onload!;
  controller.destroy();
  delayed();
  draw(canvas);
  expect(stub.state.draws).toBe(0);
  expect(onChange).not.toHaveBeenCalled();
});

it.each(["not an image", "data:image/png;base64,broken"])(
  "preserves an invalid preset until explicitly cleared: %s",
  (value) => {
    const { onChange } = setup(value);
    expect(onChange).not.toHaveBeenCalled();
    expect(SignatureTestImage.instances).toHaveLength(0);
    controller.clear();
    controller.clear();
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
  },
);

it("can clear a newly supplied invalid value even when its normalized bitmap is unchanged", () => {
  const { onChange } = setup();
  controller.update("invalid preset");
  controller.clear();
  expect(onChange).toHaveBeenCalledExactlyOnceWith("");
});

it("can clear an image that fails to decode without rewriting it on failure", () => {
  const { onChange, onInkChange } = setup(signaturePng);
  SignatureTestImage.instances[0].onerror!();
  expect(onInkChange).toHaveBeenLastCalledWith(false);
  expect(onChange).not.toHaveBeenCalled();
  controller.clear();
  expect(onChange).toHaveBeenCalledExactlyOnceWith("");
});

it("cancels an uncommitted stroke when an invalid preset replaces an empty value", () => {
  const { canvas, onChange } = setup();
  signaturePointer(canvas, "pointerdown");
  signaturePointer(canvas, "pointermove", { clientX: 30 });
  controller.update("invalid replacement");
  signaturePointer(canvas, "pointerup");
  expect(stub.state.pixels).toBe("");
  expect(onChange).not.toHaveBeenCalled();
  controller.clear();
  expect(onChange).toHaveBeenCalledExactlyOnceWith("");
});

it("saves a separate black transparent bitmap for every field while displaying custom colors", () => {
  const canvas = document.createElement("canvas");
  const display = signatureCanvasStub(),
    ink = signatureCanvasStub();
  const fillInk = vi.spyOn(ink.context, "fillRect");
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
    function (this: HTMLCanvasElement) {
      return this === canvas ? display.context : ink.context;
    },
  );
  const encode = vi
    .mocked(HTMLCanvasElement.prototype.toDataURL)
    .mockImplementation(function (this: HTMLCanvasElement) {
      expect(this).not.toBe(canvas);
      return signaturePng;
    });
  const onChange = vi.fn();
  controller = mountSignaturePad(
    canvas,
    {
      penColor: "#ffffff",
      backgroundColor: "#000000",
    },
    {
      onChange,
      onInkChange: vi.fn(),
      isEnabled: () => true,
    },
  );
  controller.update("");
  draw(canvas);
  expect(display.context.strokeStyle).toBe("#ffffff");
  expect(ink.context.strokeStyle).toBe("#000000");
  expect(fillInk).not.toHaveBeenCalled();
  expect(onChange).toHaveBeenCalledExactlyOnceWith(signaturePng);
  expect(encode).toHaveBeenCalledOnce();
  controller.clear();
  expect(display.state.pixels).toBe("");
  expect(ink.state.pixels).toBe("");
  expect(onChange).toHaveBeenLastCalledWith("");
});

it("restores canonical ink in the configured display color without changing the saved value", () => {
  const canvas = document.createElement("canvas");
  const display = signatureCanvasStub(),
    ink = signatureCanvasStub(),
    layer = signatureCanvasStub();
  const drawDisplay = vi.spyOn(display.context, "drawImage");
  vi.spyOn(layer.context, "getImageData").mockReturnValue({
    data: new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255]),
  } as ImageData);
  let next = 0;
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
    function (this: HTMLCanvasElement) {
      return this === canvas
        ? display.context
        : next++ === 0
          ? ink.context
          : layer.context;
    },
  );
  const onChange = vi.fn();
  controller = mountSignaturePad(
    canvas,
    { penColor: "#ffffff", backgroundColor: "#000000" },
    { onChange, onInkChange: vi.fn(), isEnabled: () => true },
  );
  controller.update(signaturePng);
  SignatureTestImage.instances[0].onload!();
  expect(layer.context.fillStyle).toBe("#ffffff");
  expect(layer.context.globalCompositeOperation).toBe("source-in");
  expect(drawDisplay.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement);
  expect(onChange).not.toHaveBeenCalled();
});
