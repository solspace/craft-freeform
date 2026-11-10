import { afterEach, expect, it, vi } from "vitest";
import {
  colorPresets,
  initColorPickers,
  mountColorPicker,
} from "./color-picker";

let picker: ReturnType<typeof mountColorPicker>;
afterEach(() => {
  picker?.destroy();
  document.body.replaceChildren();
});
function setup(value = "#123456", extra = {}) {
  const root = document.createElement("div");
  document.body.append(root);
  const changed = vi.fn();
  picker = mountColorPicker(root, { value, onChange: changed, ...extra });
  return {
    root,
    changed,
    text: root.querySelector<HTMLInputElement>("[type=text]")!,
    custom: root.querySelector<HTMLButtonElement>(".ff-color-preview")!,
  };
}
it("does not rewrite an existing custom or CSS color on mount", () => {
  const { text, changed } = setup("rgba(30, 90, 140, .5)");
  expect(text.value).toBe("rgba(30, 90, 140, .5)");
  expect(changed).not.toHaveBeenCalled();
});
it("previews legacy hex values without rewriting their stored value", () => {
  const { root, text, changed } = setup("3a85ee");
  expect(text.value).toBe("#3a85ee");
  expect(
    root.querySelector<HTMLButtonElement>(".ff-color-preview")!.style
      .backgroundColor,
  ).toBe("rgb(58, 133, 238)");
  expect(changed).not.toHaveBeenCalled();
});
it("chooses Craft's named palette colors and keeps the text field in sync", () => {
  const { root, text, changed } = setup();
  root
    .querySelector<HTMLButtonElement>(".ff-color-preview")!
    .dispatchEvent(new Event("pointerenter"));
  const blue = document.querySelector<HTMLButtonElement>("[aria-label=Blue]")!;
  blue.click();
  expect(changed).toHaveBeenLastCalledWith("#2563eb");
  expect(text.value).toBe("#2563eb");
  expect(blue.getAttribute("aria-pressed")).toBe("true");
  expect(colorPresets).toHaveLength(20);
});
it("accepts custom shorthand hex and restores invalid drafts without saving them", () => {
  const { text, changed } = setup();
  text.value = "abc";
  text.dispatchEvent(new Event("input"));
  expect(changed).toHaveBeenLastCalledWith("#aabbcc");
  text.value = "#invalid";
  text.dispatchEvent(new Event("input"));
  expect(changed).toHaveBeenCalledTimes(1);
  text.dispatchEvent(new Event("blur"));
  expect(text.value).toBe("#aabbcc");
});
it("supports keyboard hue, saturation and brightness controls without the browser color dialog", () => {
  const { custom, changed } = setup("#ff0000");
  custom.click();
  const hue = document.querySelector<HTMLInputElement>("[aria-label=Hue]")!;
  hue.value = "120";
  hue.dispatchEvent(new Event("input"));
  expect(changed).toHaveBeenLastCalledWith("#00ff00");
  expect(document.querySelector("[type=color]")).toBeNull();
});
it("lets a hex value be typed past shorthand length and applies external changes", () => {
  const { text, changed } = setup();
  text.focus();
  text.value = "";
  for (const character of "#abcdef") {
    text.value += character;
    text.dispatchEvent(new Event("input"));
    if (changed.mock.calls.length)
      picker.update({ value: changed.mock.lastCall?.[0] });
  }
  expect(text.value).toBe("#abcdef");
  expect(changed).toHaveBeenLastCalledWith("#abcdef");
  picker.update({ value: "#2563eb" });
  expect(text.value).toBe("#2563eb");
});
it("closes on Escape, restores focus, and does not pass Escape to the containing editor", () => {
  const { custom } = setup();
  const escaped = vi.fn();
  document.addEventListener("keydown", escaped);
  custom.click();
  const hue = document.querySelector<HTMLInputElement>("[aria-label=Hue]")!;
  hue.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  expect(document.querySelector(".ff-color-popover")).toBeNull();
  expect(document.activeElement).toBe(custom);
  expect(escaped).not.toHaveBeenCalled();
  document.removeEventListener("keydown", escaped);
});
it("closes when disabled or destroyed and never leaves a portal behind", () => {
  const { custom, root, changed } = setup();
  custom.click();
  picker.update({ disabled: true });
  expect(document.querySelector(".ff-color-popover")).toBeNull();
  expect(
    Array.from(root.querySelectorAll("button,input")).every(
      (e) => (e as HTMLInputElement).disabled,
    ),
  ).toBe(true);
  custom.click();
  expect(document.querySelector(".ff-color-popover")).toBeNull();
  expect(changed).not.toHaveBeenCalled();
});

it("enhances server-rendered defaults once, preserves values, and submits the selected hex", () => {
  const holder = document.createElement("div");
  holder.dataset.ffColorPicker = "";
  const input = document.createElement("input");
  input.dataset.colorValue = "";
  input.name = "settings[defaults][color][value]";
  input.value = "#123456";
  input.setAttribute("aria-label", "Default color");
  holder.append(input);
  document.body.append(holder);
  picker = initColorPickers()[0];
  initColorPickers();
  expect(holder.querySelectorAll(".ff-color-picker")).toHaveLength(1);
  expect(input.value).toBe("#123456");
  expect(
    holder
      .querySelector('.ff-color-picker input[aria-label="Default color"]')
      ?.getAttribute("type"),
  ).toBe("text");
  holder
    .querySelector<HTMLButtonElement>(".ff-color-preview")!
    .dispatchEvent(new Event("pointerenter"));
  document.querySelector<HTMLButtonElement>('[aria-label="Blue"]')!.click();
  expect(input.value).toBe("#2563eb");
  expect(input.name).toBe("settings[defaults][color][value]");
});

it("reveals floating presets on hover, keeps them reachable, and closes without changing a value", () => {
  vi.useFakeTimers();
  try {
    const { root, changed } = setup();
    const preview = root.querySelector<HTMLButtonElement>(".ff-color-preview")!;
    expect(root.querySelector(".ff-color-presets")).toBeNull();
    expect(root.querySelector(".ff-color-custom")).toBeNull();
    preview.dispatchEvent(new Event("pointerenter"));
    const strip = document.querySelector<HTMLElement>(
      ".ff-color-presets-popover",
    )!;
    expect(strip.querySelectorAll(".ff-color-swatch")).toHaveLength(20);
    preview.dispatchEvent(new Event("pointerleave"));
    strip.dispatchEvent(new Event("pointerenter"));
    vi.advanceTimersByTime(200);
    expect(strip.isConnected).toBe(true);
    strip.dispatchEvent(new Event("pointerleave"));
    vi.advanceTimersByTime(200);
    expect(strip.isConnected).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
it("supports keyboard preset selection and Escape, and opens the full picker on circle click", () => {
  const { root, changed } = setup();
  const preview = root.querySelector<HTMLButtonElement>(".ff-color-preview")!;
  preview.focus();
  preview.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Red");
  (document.activeElement as HTMLButtonElement).click();
  expect(changed).toHaveBeenLastCalledWith("#dc2626");
  expect(document.activeElement).toBe(preview);
  expect(document.querySelector(".ff-color-presets-popover")).toBeNull();
  preview.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  document.activeElement!.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  expect(document.querySelector(".ff-color-presets-popover")).toBeNull();
  preview.click();
  expect(document.querySelector(".ff-color-plane")).not.toBeNull();
  expect(document.querySelectorAll(".ff-color-swatch")).toHaveLength(0);
  picker.destroy();
  expect(document.querySelector(".ff-color-popover")).toBeNull();
});

it("animates the preset strip away before opening the full picker from the current circle", () => {
  vi.useFakeTimers();
  try {
    const { root } = setup();
    const preview = root.querySelector<HTMLButtonElement>(".ff-color-preview")!;
    preview.dispatchEvent(new Event("pointerenter"));
    preview.click();
    expect(
      document.querySelector(".ff-color-presets-popover.is-closing"),
    ).not.toBeNull();
    expect(document.querySelector(".ff-color-plane")).toBeNull();
    vi.advanceTimersByTime(180);
    expect(document.querySelector(".ff-color-presets-popover")).toBeNull();
    expect(document.querySelector(".ff-color-plane")).not.toBeNull();
  } finally {
    vi.useRealTimers();
  }
});

it("adjusts saturation and brightness with arrow keys on the color square without extra sliders", () => {
  const { custom, changed } = setup("#ff0000");
  custom.click();
  const plane = document.querySelector<HTMLElement>(".ff-color-plane")!;
  expect(document.querySelectorAll('input[type="range"]')).toHaveLength(1);
  plane.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
  );
  expect(changed).toHaveBeenLastCalledWith("#ff0303");
  plane.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(changed).toHaveBeenLastCalledWith("#fc0303");
  expect(plane.getAttribute("aria-valuetext")).toBe(
    "Saturation 99%, Brightness 99%",
  );
});
