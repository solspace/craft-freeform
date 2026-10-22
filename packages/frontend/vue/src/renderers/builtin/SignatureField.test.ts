import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createApp, h, nextTick, reactive } from "vue";
import {
  SignatureTestImage,
  signatureCanvasStub,
  signaturePointer,
} from "../../../../test/signature-canvas.js";
import {
  signatureJpeg,
  signaturePng,
} from "../../../../test/signature-images.js";
import { signatureManifest } from "../../../../test/signature-manifest.js";
import { useFreeform } from "../../composables/useFreeform.js";
import type { UseFreeformResult } from "../../types.js";
import { SignatureFieldRenderer } from "./SignatureField.js";

let stub: ReturnType<typeof signatureCanvasStub>;
let unmount: (() => void) | undefined;

it("marks every useFreeform reset, including resets with unchanged initial values", async () => {
  let form: UseFreeformResult;
  const host = document.createElement("div");
  const app = createApp({
    setup() {
      form = useFreeform({
        baseUrl: "https://example.test",
        manifest: signatureManifest,
        initialValues: { signature: signatureJpeg },
      });
      return () => null;
    },
  });
  app.mount(host);
  unmount = () => app.unmount();
  await nextTick();
  expect(form!.resetVersion).toBe(0);
  for (let version = 1; version <= 2; version++) {
    form!.reset();
    await nextTick();
    expect(form!.resetVersion).toBe(version);
    expect(form!.values.signature).toBe(signatureJpeg);
  }
});
beforeEach(() => {
  stub = signatureCanvasStub();
  SignatureTestImage.instances = [];
  vi.stubGlobal("Image", SignatureTestImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      return this.isConnected ? stub.context : signatureCanvasStub().context;
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
  unmount?.();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(
  initial = "",
  showClearButton = true,
  appearance: Record<string, unknown> = {},
) {
  const state = reactive({
    value: initial,
    enabled: true,
    width: 400,
    resetVersion: 0,
  });
  const setValue = vi.fn((_handle: string, value: string) => {
    state.value = value;
  });
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    render: () =>
      h(SignatureFieldRenderer, {
        field: {
          handle: "signature",
          type: "signature",
          label: "Signature",
          frontend: {
            config: { width: state.width, showClearButton, ...appearance },
          },
        },
        value: state.value,
        classNames: { input: "legacy-signature" },
        form: {
          isFieldEnabled: () => state.enabled,
          setValue,
          resetVersion: state.resetVersion,
        },
      }),
  });
  app.mount(host);
  unmount = () => {
    app.unmount();
    host.remove();
  };
  return {
    state,
    setValue,
    host,
    canvas: host.querySelector("canvas")!,
    clear: () => host.querySelector("button")!,
  };
}

async function draw(canvas: HTMLCanvasElement) {
  signaturePointer(canvas, "pointerdown");
  signaturePointer(canvas, "pointermove", { clientX: 30 });
  signaturePointer(canvas, "pointerup", { clientX: 30 });
  await nextTick();
}

it("leaves taps empty, commits a stroke, and clears both the canvas and controlled value", async () => {
  const view = fixture();
  signaturePointer(view.canvas, "pointerdown");
  signaturePointer(view.canvas, "pointerup");
  await nextTick();
  expect(view.setValue).not.toHaveBeenCalled();
  expect(view.clear().disabled).toBe(true);
  await draw(view.canvas);
  expect(view.state.value).toBe(signaturePng);
  expect(view.clear().disabled).toBe(false);
  expect(stub.state.pixels).toBe("ink");
  view.clear().click();
  await nextTick();
  expect(view.state.value).toBe("");
  expect(stub.state.pixels).toBe("");
  expect(view.clear().disabled).toBe(true);
});

it("follows an external empty reset without repainting from an old image load", async () => {
  const view = fixture(signatureJpeg);
  const delayed = SignatureTestImage.instances[0].onload!;
  view.state.value = "";
  await nextTick();
  delayed();
  expect(stub.state.pixels).toBe("");
  expect(stub.state.draws).toBe(0);
  expect(view.clear().disabled).toBe(true);
  expect(view.setValue).not.toHaveBeenCalled();
});

it("resets a stroke before it commits even when the controlled value is still empty", async () => {
  const view = fixture();
  signaturePointer(view.canvas, "pointerdown");
  signaturePointer(view.canvas, "pointermove", { clientX: 30 });
  await nextTick();
  expect(stub.state.pixels).toBe("ink");
  view.state.resetVersion++;
  await nextTick();
  signaturePointer(view.canvas, "pointerup");
  expect(stub.state.pixels).toBe("");
  expect(view.setValue).not.toHaveBeenCalled();
});

it.each([signaturePng, signatureJpeg])(
  "restores saved images on reset without rewriting their values",
  async (value) => {
    const view = fixture(value);
    SignatureTestImage.instances[0].onload!();
    expect(stub.state.pixels).toBe(value);
    expect(view.setValue).not.toHaveBeenCalled();
    view.clear().click();
    await nextTick();
    view.state.value = value;
    await nextTick();
    SignatureTestImage.instances.at(-1)!.onload!();
    expect(view.state.value).toBe(value);
    expect(stub.state.pixels).toBe(value);
    expect(
      view.host.querySelector("[data-freeform-signature]")!.className,
    ).toBe("legacy-signature");
  },
);

it("tracks conditional enabled state without clearing or accepting disabled strokes", async () => {
  const view = fixture();
  await draw(view.canvas);
  view.state.enabled = false;
  await nextTick();
  expect(view.clear().disabled).toBe(true);
  await draw(view.canvas);
  expect(view.setValue).toHaveBeenCalledTimes(1);
  view.state.enabled = true;
  await nextTick();
  expect(view.clear().disabled).toBe(false);
});

it("keeps optional clear controls and resizes using the latest saved value", async () => {
  const view = fixture(signatureJpeg, false);
  expect(view.host.querySelector("button")).toBeNull();
  view.state.width = 300;
  await nextTick();
  expect(view.canvas.width).toBe(300);
  expect(SignatureTestImage.instances.at(-1)!.src).toBe(signatureJpeg);
  SignatureTestImage.instances.at(-1)!.onload!();
  expect(stub.state.pixels).toBe(signatureJpeg);
  expect(view.setValue).not.toHaveBeenCalled();
});

it("keeps malformed presets clearable while respecting disabled fields", async () => {
  const view = fixture("data:image/png;base64,broken");
  await nextTick();
  expect(view.setValue).not.toHaveBeenCalled();
  expect(view.clear().disabled).toBe(false);
  view.state.enabled = false;
  await nextTick();
  expect(view.clear().disabled).toBe(true);
  view.clear().click();
  expect(view.setValue).not.toHaveBeenCalled();
  view.state.enabled = true;
  await nextTick();
  view.clear().click();
  await nextTick();
  expect(view.setValue).toHaveBeenCalledExactlyOnceWith("signature", "");
  expect(view.state.value).toBe("");
  expect(view.clear().disabled).toBe(true);
});

it("can clear a preset after the browser fails to decode it", async () => {
  const view = fixture(signaturePng);
  SignatureTestImage.instances[0].onerror!();
  await nextTick();
  expect(view.clear().disabled).toBe(false);
  expect(view.setValue).not.toHaveBeenCalled();
  view.clear().click();
  await nextTick();
  expect(view.state.value).toBe("");
  expect(view.setValue).toHaveBeenCalledExactlyOnceWith("signature", "");
});

it.each([true, false])(
  "follows explicit custom appearance and cursor settings: %s",
  async (customizeAppearance) => {
    const view = fixture("", true, {
      customizeAppearance,
      showPenCursor: false,
      penColor: "#2468ac",
      backgroundColor: "#000000",
      borderColor: "#123456",
    });
    await nextTick();
    expect(view.canvas.style.backgroundColor).toBe(
      customizeAppearance ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
    );
    expect(view.canvas.style.borderColor).toBe(
      customizeAppearance ? "rgb(18, 52, 86)" : "rgb(153, 153, 153)",
    );
    if (customizeAppearance) expect(view.canvas.style.cursor).toBe("crosshair");
    else expect(view.canvas.style.cursor).toContain("data:image/svg+xml");
    await draw(view.canvas);
    expect(stub.context.strokeStyle).toBe(
      customizeAppearance ? "#2468ac" : "#000000",
    );
  },
);

it("exports the separate ink bitmap for legacy fields without export flags and with custom display colors", async () => {
  const view = fixture("", true, {
    customizeAppearance: true,
    penColor: "#ffffff",
    backgroundColor: "#000000",
  });
  await draw(view.canvas);
  const encode = vi.mocked(HTMLCanvasElement.prototype.toDataURL);
  expect(encode).toHaveBeenCalledWith("image/png");
  expect(encode.mock.instances.at(-1)).not.toBe(view.canvas);
  expect(view.state.value).toBe(signaturePng);
});
