import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type SignatureHandler from "./signature";

const scriptUrl =
  "https://cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js";
const saved = "data:image/png;base64,c2F2ZWQ=";
const fresh = "data:image/png;base64,ZnJlc2g=";

type PadOptions = {
  onBegin: () => void;
  onEnd: () => void;
};

let Signature: typeof SignatureHandler;
let pads: PadStub[];
let images: ImageStub[];
let painted: Map<HTMLCanvasElement, string>;
let drawImage: ReturnType<typeof vi.fn>;

class PadStub {
  value = "";
  clear = vi.fn(() => {
    this.value = "";
    painted.set(this.canvas, "");
  });
  off = vi.fn();
  _strokeMoveUpdate = vi.fn((_event: MouseEvent | Touch) => {
    painted.set(this.canvas, "moving");
  });
  toDataURL = vi.fn(() => this.value);

  constructor(
    public canvas: HTMLCanvasElement,
    public options: PadOptions,
  ) {
    pads.push(this);
    this.clear();
  }

  sign(value = fresh) {
    this.options.onBegin();
    this.value = value;
    painted.set(this.canvas, value);
    this.options.onEnd();
  }
}

class ImageStub {
  onload: (() => void) | null = null;
  src = "";

  constructor() {
    images.push(this);
  }
}

function markup(value = "", clear = true) {
  return `<div class="freeform-signature-wrapper"><input type="hidden" name="signature" value="${value}">
    <canvas width="400" height="100" data-signature-field data-pen-color="#123456" data-dot-size="2.5" data-border-color="#999999" data-background-color="rgba(0,0,0,0)"></canvas>
    ${clear ? '<button type="button" data-signature-clear>Clear</button>' : ""}</div>`;
}

function setup(value = "", clear = true, responsive = false) {
  const form = document.createElement("form");
  form.setAttribute("data-scripts-signature", "");
  if (responsive) form.setAttribute("data-freeform-signature-responsive", "");
  form.innerHTML = markup(value, clear);
  document.body.append(form);
  const handler = new Signature({
    form,
    has: (attribute: string) => form.hasAttribute(attribute),
  } as Freeform);
  return {
    form,
    handler,
    input: form.querySelector("input")!,
    canvas: form.querySelector("canvas")!,
    clearButton: form.querySelector("button"),
  };
}

async function finishLoading() {
  vi.stubGlobal("SignaturePad", PadStub);
  document.querySelector("script")!.dispatchEvent(new Event("load"));
  await Promise.resolve();
}

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  document.body.replaceChildren();
  pads = [];
  images = [];
  painted = new Map();
  drawImage = vi.fn(function (this: HTMLCanvasElement, image: ImageStub) {
    painted.set(this, image.src);
  });
  vi.stubGlobal("SignaturePad", undefined);
  vi.stubGlobal("Image", ImageStub);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      return {
        drawImage: drawImage.bind(this),
      } as unknown as CanvasRenderingContext2D;
    },
  );
  Signature = (await import("./signature")).default;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it("initializes every form waiting for the same script", async () => {
  const first = setup();
  const second = setup();
  first.handler.reload();
  second.handler.reload();
  expect(pads).toHaveLength(0);
  expect(document.querySelectorAll("script")).toHaveLength(1);
  expect(document.querySelector("script")!.src).toBe(scriptUrl);

  await finishLoading();

  expect(pads.map((pad) => pad.canvas)).toEqual([first.canvas, second.canvas]);
  pads[0].sign();
  expect(new FormData(first.form).get("signature")).toBe(fresh);
  expect(new FormData(second.form).get("signature")).toBe("");
});

it("initializes forms added after loading without requesting the script again", async () => {
  setup();
  await finishLoading();
  const next = setup();
  expect(pads).toHaveLength(2);
  expect(pads[1].canvas).toBe(next.canvas);
  expect(document.querySelectorAll("script")).toHaveLength(1);
});

it("uses an already loaded drawing library and preserves legacy options", () => {
  vi.stubGlobal("SignaturePad", PadStub);
  const { canvas, input } = setup();
  expect(document.querySelector("script")).toBeNull();
  expect(pads).toHaveLength(1);
  expect(pads[0].options).toMatchObject({
    penColor: "#123456",
    backgroundColor: "rgba(0,0,0,0)",
    dotSize: "2.5",
    maxWidth: "2.5",
    throttle: 0,
  });
  expect(canvas.style.borderColor).toBe("rgb(153, 153, 153)");
  expect(input.name).toBe("signature");
  expect(canvas.hasAttribute("data-signature-field")).toBe(true);
});

it("opts into scaled drawing while clearing and restoring the complete saved bitmap", () => {
  vi.stubGlobal("SignaturePad", PadStub);
  const context = {
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
  };
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(
    HTMLCanvasElement.prototype,
    "getBoundingClientRect",
  ).mockReturnValue({ width: 202, height: 52 } as DOMRect);
  const { form, canvas, clearButton, handler, input } = setup(
    saved,
    true,
    true,
  );
  expect(context.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, -2, -2);
  images[0].onload!();
  expect(context.drawImage).toHaveBeenCalledWith(images[0], 0, 0, 400, 100);
  expect(context.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
  expect(context.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, -2, -2);
  clearButton!.click();
  expect(input.value).toBe("");
  expect(pads[0].clear).toHaveBeenCalledTimes(3);
  form.reset();
  vi.runAllTimers();
  expect(input.value).toBe(saved);
  expect(images.at(-1)!.src).toBe(saved);
  canvas.remove();
  handler.reload();
  expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, 0, 0);
});

it("initializes only the current fields if AJAX replaces markup while loading", async () => {
  const { form, canvas, handler } = setup();
  form.innerHTML = markup(saved);
  handler.reload();
  await finishLoading();
  expect(pads).toHaveLength(1);
  expect(pads[0].canvas).not.toBe(canvas);
  expect(pads[0].canvas).toBe(form.querySelector("canvas"));
  expect(images[0].src).toBe(saved);
});

it("does not load or initialize pads when the form-level flag is absent", () => {
  const form = document.createElement("form");
  form.innerHTML = markup();
  document.body.append(form);
  new Signature({ form, has: () => false } as unknown as Freeform);
  form.reset();
  vi.runAllTimers();
  expect(document.querySelector("script")).toBeNull();
  expect(pads).toHaveLength(0);
});

it("keeps reload idempotent without rebasing the reset value to new ink", async () => {
  const { handler, form, input, clearButton } = setup();
  await finishLoading();
  pads[0].sign();
  handler.reload();
  handler.reload();
  expect(pads).toHaveLength(1);
  expect(input.value).toBe(fresh);
  expect(painted.get(pads[0].canvas)).toBe(fresh);
  const clears = pads[0].clear.mock.calls.length;
  clearButton!.click();
  expect(pads[0].clear).toHaveBeenCalledTimes(clears + 1);
  pads[0].sign();
  form.reset();
  vi.runAllTimers();
  expect(input.value).toBe("");
  expect(painted.get(pads[0].canvas)).toBe("");
});

it("still redraws externally changed values on reload without losing the reset baseline", async () => {
  const { handler, form, input, canvas } = setup(saved);
  await finishLoading();
  images[0].onload!();
  input.value = fresh;
  handler.reload();
  expect(images.at(-1)!.src).toBe(fresh);
  images.at(-1)!.onload!();
  expect(painted.get(canvas)).toBe(fresh);
  expect(pads).toHaveLength(1);
  input.value = "";
  handler.reload();
  expect(painted.get(canvas)).toBe("");
  form.reset();
  vi.runAllTimers();
  expect(input.value).toBe(saved);
  images.at(-1)!.onload!();
  expect(painted.get(canvas)).toBe(saved);
});

it("clears the canvas and submitted value on a native reset without replacing HTML", async () => {
  const { form, input, canvas } = setup();
  await finishLoading();
  pads[0].sign();
  // Hidden inputs reflect .value into .defaultValue, unlike text inputs.
  expect(input.defaultValue).toBe(fresh);
  form.reset();
  vi.runAllTimers();
  expect(new FormData(form).get("signature")).toBe("");
  expect(painted.get(canvas)).toBe("");
  expect(form.querySelector("canvas")).toBe(canvas);
  expect(pads).toHaveLength(1);
});

it.each([saved, "data:image/jpeg;base64,c2F2ZWQ="])(
  "restores a prefilled signature after clear and repeated reset: %s",
  async (value) => {
    const { form, input, canvas, clearButton } = setup(value);
    await finishLoading();
    expect(images[0].src).toBe(value);
    images[0].onload!();
    expect(drawImage).toHaveBeenLastCalledWith(images[0], 0, 0, 400, 100);
    expect(input.value).toBe(value);
    clearButton!.click();
    expect(input.value).toBe("");
    expect(painted.get(canvas)).toBe("");
    for (let reset = 0; reset < 2; reset++) {
      pads[0].sign();
      form.reset();
      vi.runAllTimers();
      expect(input.value).toBe(value);
      images.at(-1)!.onload!();
      expect(painted.get(canvas)).toBe(value);
    }
  },
);

it("respects canceled resets and leaves other forms untouched", async () => {
  const first = setup();
  const second = setup();
  await finishLoading();
  pads[0].sign();
  pads[1].sign(saved);
  first.form.addEventListener("reset", (event) => event.preventDefault(), {
    once: true,
  });
  first.form.reset();
  vi.runAllTimers();
  expect(first.input.value).toBe(fresh);
  expect(painted.get(first.canvas)).toBe(fresh);
  first.form.reset();
  vi.runAllTimers();
  expect(first.input.value).toBe("");
  expect(second.input.value).toBe(saved);
  expect(painted.get(second.canvas)).toBe(saved);
});

it("supports multiple signature fields and optional clear buttons", async () => {
  const { form, input, handler } = setup(saved, false);
  form.insertAdjacentHTML(
    "beforeend",
    markup().replace('name="signature"', 'name="second"'),
  );
  handler.reload();
  await finishLoading();
  expect(pads).toHaveLength(2);
  pads[0].sign();
  pads[1].sign();
  form.querySelector("button")!.click();
  expect(input.value).toBe(fresh);
  expect(new FormData(form).get("second")).toBe("");
  form.reset();
  vi.runAllTimers();
  expect(input.value).toBe(saved);
  expect(new FormData(form).get("second")).toBe("");
});

it("disposes replaced pads and binds new AJAX fields with their own defaults", async () => {
  const { form, input, canvas, handler, clearButton } = setup(saved);
  await finishLoading();
  const oldImageLoad = images[0].onload!;
  form.innerHTML = markup();
  handler.reload();
  handler.reload();
  expect(pads).toHaveLength(2);
  expect(pads[0].off).toHaveBeenCalledOnce();
  const oldClears = pads[0].clear.mock.calls.length;
  clearButton!.click();
  oldImageLoad();
  expect(pads[0].clear).toHaveBeenCalledTimes(oldClears);
  expect(drawImage).not.toHaveBeenCalled();
  expect(input.value).toBe(saved);
  expect(pads[1].canvas).not.toBe(canvas);
  pads[1].sign();
  form.reset();
  vi.runAllTimers();
  expect(new FormData(form).get("signature")).toBe("");
  expect(painted.get(pads[1].canvas)).toBe("");
});

it.each(["clear", "reset", "draw"])(
  "prevents a delayed saved image from repainting after %s",
  async (action) => {
    const { form, canvas, clearButton, input } = setup(saved);
    await finishLoading();
    const delayedLoad = images[0].onload!;
    if (action === "clear") clearButton!.click();
    if (action === "reset") {
      form.reset();
      vi.runAllTimers();
    }
    if (action === "draw") pads[0].sign();
    delayedLoad();
    expect(drawImage).not.toHaveBeenCalled();
    expect(painted.get(canvas)).toBe(action === "draw" ? fresh : "");
    expect(input.value).toBe(
      action === "draw" ? fresh : action === "clear" ? "" : saved,
    );
    if (action === "reset") {
      images.at(-1)!.onload!();
      expect(painted.get(canvas)).toBe(saved);
    }
  },
);

it("does not repaint a saved image over a stroke that has just begun", async () => {
  setup(saved);
  await finishLoading();
  const delayedLoad = images[0].onload!;
  pads[0].options.onBegin();
  delayedLoad();
  expect(drawImage).not.toHaveBeenCalled();
});

it("ignores an incomplete custom template instead of breaking other fields", async () => {
  const { form, handler } = setup();
  form.insertAdjacentHTML(
    "afterbegin",
    "<div><canvas data-signature-field></canvas></div>",
  );
  await finishLoading();
  expect(pads).toHaveLength(1);
  expect(() => handler.reload()).not.toThrow();
});

it.each(["clear", "reset", "replace", "remove"])(
  "cancels an active stroke and trailing move after %s",
  async (action) => {
    const { form, canvas, input, clearButton, handler } = setup();
    await finishLoading();
    const pad = pads[0];
    pad.options.onBegin();
    pad._strokeMoveUpdate(new MouseEvent("mousemove"));
    pad._strokeMoveUpdate(new MouseEvent("mousemove"));
    if (action === "clear") clearButton!.click();
    if (action === "reset") {
      form.reset();
      vi.advanceTimersByTime(0);
    }
    if (action === "replace") {
      input.value = saved;
      handler.reload();
      images.at(-1)!.onload!();
    }
    if (action === "remove") {
      canvas.remove();
      handler.reload();
    }
    const pixels = painted.get(canvas);
    vi.runAllTimers();
    pad.value = "data:image/png;base64,Ymxhbms=";
    pad.options.onEnd();
    pad._strokeMoveUpdate(new MouseEvent("mousemove"));
    vi.runAllTimers();
    expect(input.value).toBe(action === "replace" ? saved : "");
    expect(painted.get(canvas)).toBe(pixels);
    expect(pad.toDataURL).not.toHaveBeenCalled();
    if (action !== "remove") {
      pad.sign();
      expect(input.value).toBe(fresh);
    }
  },
);

it.each([undefined, "false"])(
  "saves fresh ink through the black transparent bitmap even with legacy export metadata: %s",
  async (mode) => {
    const bitmap = {
      toDataURL: vi.fn(() => fresh),
      restore: vi.fn(),
      destroy: vi.fn(),
    };
    const mount = vi
      .spyOn(await import("./signature.bitmap"), "mountSignatureBitmap")
      .mockReturnValue(bitmap);
    const view = setup(saved);
    if (mode !== undefined) view.canvas.dataset.signatureNormalize = mode;
    await finishLoading();
    expect(mount).toHaveBeenCalledWith(view.canvas, pads[0], "#123456");
    expect(view.input.value).toBe(saved);
    images[0].onload!();
    expect(bitmap.restore).toHaveBeenCalledWith(images[0]);
    expect(view.input.value).toBe(saved);
    pads[0].sign();
    expect(bitmap.toDataURL).toHaveBeenCalledOnce();
    expect(pads[0].toDataURL).not.toHaveBeenCalled();
    expect(view.input.value).toBe(fresh);
    view.form.reset();
    await vi.runAllTimersAsync();
    expect(view.input.value).toBe(saved);
  },
);
