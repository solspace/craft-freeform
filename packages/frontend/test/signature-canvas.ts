export class SignatureTestImage {
  static instances: SignatureTestImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";

  constructor() {
    SignatureTestImage.instances.push(this);
  }
}

export function signatureCanvasStub() {
  const state = {
    pixels: "",
    clears: 0,
    draws: 0,
    transforms: [] as number[][],
  };
  const context = {
    clearRect() {
      state.clears++;
      state.pixels = "";
    },
    fillRect() {},
    setTransform(...values: number[]) {
      state.transforms.push(values);
    },
    drawImage(image: SignatureTestImage) {
      state.draws++;
      state.pixels = image.src;
    },
    getImageData() {
      return { data: new Uint8ClampedArray([255, 255, 255, 255]) };
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      state.pixels = "ink";
    },
  } as unknown as CanvasRenderingContext2D;
  return { state, context };
}

export function signaturePointer(
  canvas: HTMLCanvasElement,
  type: string,
  options: Partial<PointerEvent> = {},
) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, {
    pointerId: 1,
    clientX: 10,
    clientY: 10,
    button: 0,
    isPrimary: true,
    ...options,
  });
  canvas.dispatchEvent(event);
}
