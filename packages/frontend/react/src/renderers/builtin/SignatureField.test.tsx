import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
import { useFreeform } from "../../hooks/useFreeform.js";
import type { ReactFieldRendererProps } from "../../types.js";
import { SignatureFieldRenderer } from "./SignatureField.js";

let stub: ReturnType<typeof signatureCanvasStub>;

it("marks every useFreeform reset, including resets with unchanged initial values", () => {
  const initialValues = { signature: signatureJpeg };
  const { result } = renderHook(() =>
    useFreeform({
      baseUrl: "https://example.test",
      manifest: signatureManifest,
      initialValues,
    }),
  );
  expect(result.current.resetVersion).toBe(0);
  for (let version = 1; version <= 2; version++) {
    act(() => result.current.reset());
    expect(result.current.resetVersion).toBe(version);
    expect(result.current.values.signature).toBe(signatureJpeg);
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
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(
  initial = "",
  showClearButton = true,
  appearance: Record<string, unknown> = {},
) {
  const setValue = vi.fn();
  function Fixture() {
    const [value, update] = useState(initial);
    const [enabled, enable] = useState(true);
    const [width, resize] = useState(400);
    const [resetVersion, reset] = useState(0);
    const props = {
      field: {
        handle: "signature",
        type: "signature",
        label: "Signature",
        frontend: { config: { width, showClearButton, ...appearance } },
      },
      value,
      classNames: { input: "legacy-signature" },
      form: {
        resetVersion,
        isFieldEnabled: () => enabled,
        setValue: (handle: string, next: string) => {
          setValue(handle, next);
          update(next);
        },
      },
    } as unknown as ReactFieldRendererProps;
    return (
      <>
        <SignatureFieldRenderer {...props} />
        <output>{value}</output>
        <button
          type="button"
          onClick={() => {
            update("");
            reset(resetVersion + 1);
          }}
        >
          Reset empty
        </button>
        <button
          type="button"
          onClick={() => {
            update(initial);
            reset(resetVersion + 1);
          }}
        >
          Reset initial
        </button>
        <button type="button" onClick={() => enable(!enabled)}>
          Toggle enabled
        </button>
        <button type="button" onClick={() => resize(300)}>
          Resize
        </button>
      </>
    );
  }
  const view = render(<Fixture />);
  return {
    ...view,
    setValue,
    canvas: view.container.querySelector("canvas")!,
    value: () => view.container.querySelector("output")!.textContent,
  };
}

function draw(canvas: HTMLCanvasElement) {
  act(() => {
    signaturePointer(canvas, "pointerdown");
    signaturePointer(canvas, "pointermove", { clientX: 30 });
    signaturePointer(canvas, "pointerup", { clientX: 30 });
  });
}

it("leaves taps empty, commits a stroke, and clears both the canvas and controlled value", () => {
  const view = fixture();
  const clear = view.getByRole<HTMLButtonElement>("button", { name: "Clear" });
  act(() => {
    signaturePointer(view.canvas, "pointerdown");
    signaturePointer(view.canvas, "pointerup");
  });
  expect(view.setValue).not.toHaveBeenCalled();
  expect(clear.disabled).toBe(true);
  draw(view.canvas);
  expect(view.value()).toBe(signaturePng);
  expect(clear.disabled).toBe(false);
  expect(stub.state.pixels).toBe("ink");
  fireEvent.click(clear);
  expect(view.value()).toBe("");
  expect(stub.state.pixels).toBe("");
  expect(clear.disabled).toBe(true);
});

it("follows an external empty reset without repainting from an old image load", () => {
  const view = fixture(signatureJpeg);
  const delayed = SignatureTestImage.instances[0].onload!;
  fireEvent.click(view.getByText("Reset empty"));
  act(delayed);
  expect(view.value()).toBe("");
  expect(stub.state.pixels).toBe("");
  expect(stub.state.draws).toBe(0);
  expect(
    view.getByRole<HTMLButtonElement>("button", { name: "Clear" }).disabled,
  ).toBe(true);
  expect(view.setValue).not.toHaveBeenCalled();
});

it("resets a stroke before it commits even when the controlled value is still empty", () => {
  const view = fixture();
  act(() => {
    signaturePointer(view.canvas, "pointerdown");
    signaturePointer(view.canvas, "pointermove", { clientX: 30 });
  });
  expect(stub.state.pixels).toBe("ink");
  fireEvent.click(view.getByText("Reset empty"));
  act(() => signaturePointer(view.canvas, "pointerup"));
  expect(stub.state.pixels).toBe("");
  expect(view.setValue).not.toHaveBeenCalled();
});

it.each([signaturePng, signatureJpeg])(
  "restores saved images on reset without rewriting their values",
  (value) => {
    const view = fixture(value);
    act(() => SignatureTestImage.instances[0].onload!());
    expect(stub.state.pixels).toBe(value);
    expect(view.setValue).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole("button", { name: "Clear" }));
    fireEvent.click(view.getByText("Reset initial"));
    act(() => SignatureTestImage.instances.at(-1)!.onload!());
    expect(view.value()).toBe(value);
    expect(stub.state.pixels).toBe(value);
    expect(
      view.container.querySelector("[data-freeform-signature]")!.className,
    ).toBe("legacy-signature");
  },
);

it("tracks conditional enabled state without clearing or accepting disabled strokes", () => {
  const view = fixture();
  draw(view.canvas);
  fireEvent.click(view.getByText("Toggle enabled"));
  expect(
    view.getByRole<HTMLButtonElement>("button", { name: "Clear" }).disabled,
  ).toBe(true);
  draw(view.canvas);
  expect(view.setValue).toHaveBeenCalledTimes(1);
  fireEvent.click(view.getByText("Toggle enabled"));
  expect(
    view.getByRole<HTMLButtonElement>("button", { name: "Clear" }).disabled,
  ).toBe(false);
});

it("keeps optional clear controls and resizes using the latest saved value", () => {
  const view = fixture(signatureJpeg, false);
  expect(view.queryByRole("button", { name: "Clear" })).toBeNull();
  fireEvent.click(view.getByText("Resize"));
  expect(view.canvas.width).toBe(300);
  expect(SignatureTestImage.instances.at(-1)!.src).toBe(signatureJpeg);
  act(() => SignatureTestImage.instances.at(-1)!.onload!());
  expect(stub.state.pixels).toBe(signatureJpeg);
  expect(view.setValue).not.toHaveBeenCalled();
});

it("keeps malformed presets clearable while respecting disabled fields", () => {
  const view = fixture("data:image/png;base64,broken");
  const clear = view.getByRole<HTMLButtonElement>("button", { name: "Clear" });
  expect(view.setValue).not.toHaveBeenCalled();
  expect(clear.disabled).toBe(false);
  fireEvent.click(view.getByText("Toggle enabled"));
  expect(clear.disabled).toBe(true);
  fireEvent.click(clear);
  expect(view.setValue).not.toHaveBeenCalled();
  fireEvent.click(view.getByText("Toggle enabled"));
  fireEvent.click(clear);
  expect(view.setValue).toHaveBeenCalledExactlyOnceWith("signature", "");
  expect(view.value()).toBe("");
  expect(clear.disabled).toBe(true);
});

it("can clear a preset after the browser fails to decode it", () => {
  const view = fixture(signaturePng);
  act(() => SignatureTestImage.instances[0].onerror!());
  const clear = view.getByRole<HTMLButtonElement>("button", { name: "Clear" });
  expect(clear.disabled).toBe(false);
  expect(view.setValue).not.toHaveBeenCalled();
  fireEvent.click(clear);
  expect(view.value()).toBe("");
  expect(view.setValue).toHaveBeenCalledExactlyOnceWith("signature", "");
});

it.each([true, false])(
  "follows explicit custom appearance and cursor settings: %s",
  (customizeAppearance) => {
    const view = fixture("", true, {
      customizeAppearance,
      showPenCursor: false,
      penColor: "#2468ac",
      backgroundColor: "#000000",
      borderColor: "#123456",
    });
    expect(view.canvas.style.backgroundColor).toBe(
      customizeAppearance ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)",
    );
    expect(view.canvas.style.borderColor).toBe(
      customizeAppearance ? "rgb(18, 52, 86)" : "rgb(153, 153, 153)",
    );
    if (customizeAppearance) expect(view.canvas.style.cursor).toBe("crosshair");
    else expect(view.canvas.style.cursor).toContain("data:image/svg+xml");
    draw(view.canvas);
    expect(stub.context.strokeStyle).toBe(
      customizeAppearance ? "#2468ac" : "#000000",
    );
  },
);

it("exports the separate ink bitmap for legacy fields without export flags and with custom display colors", () => {
  const view = fixture("", true, {
    customizeAppearance: true,
    penColor: "#ffffff",
    backgroundColor: "#000000",
  });
  draw(view.canvas);
  const encode = vi.mocked(HTMLCanvasElement.prototype.toDataURL);
  expect(encode).toHaveBeenCalledWith("image/png");
  expect(encode.mock.instances.at(-1)).not.toBe(view.canvas);
  expect(view.value()).toBe(signaturePng);
});
