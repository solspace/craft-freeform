import { afterEach, describe, expect, it, vi } from "vitest";
import { attachDateRangePicker } from "./date-range-picker";

afterEach(() => document.body.replaceChildren());

function mount(value = "") {
  const container = document.createElement("div");
  const input = document.createElement("input");
  input.name = "rangeStart";
  input.value = value;
  container.append(input);
  document.body.append(container);
  attachDateRangePicker(input, "Choose Range Start date");
  return {
    input,
    picker: container.querySelector<HTMLInputElement>('input[type="date"]')!,
  };
}

describe("export date ranges", () => {
  it("preserves relative expressions when attaching and opening the calendar", () => {
    const { input, picker } = mount("15 days ago");
    picker.showPicker = vi.fn();
    picker.click();
    expect(input.value).toBe("15 days ago");
    expect(picker.value).toBe("");
    expect(picker.showPicker).toHaveBeenCalledOnce();
  });

  it("writes a selected ISO date to the submitted value and notifies form listeners", () => {
    const { input, picker } = mount("yesterday");
    const changed = vi.fn();
    input.parentElement!.addEventListener("change", changed);
    picker.value = "2026-11-09";
    picker.dispatchEvent(new Event("change"));
    expect(input.value).toBe("2026-11-09");
    expect(changed).toHaveBeenCalledOnce();
    const form = document.createElement("form");
    form.append(input.parentElement!);
    expect([...new FormData(form).entries()]).toEqual([
      ["rangeStart", "2026-11-09"],
    ]);
  });

  it("tracks manually entered dates without coercing relative text", () => {
    const { input, picker } = mount("2026-11-01");
    expect(picker.value).toBe("2026-11-01");
    input.value = "2026-11-09";
    input.dispatchEvent(new Event("input"));
    expect(picker.value).toBe("2026-11-09");
    input.value = "last Monday";
    input.dispatchEvent(new Event("input"));
    expect(picker.value).toBe("");
    expect(input.value).toBe("last Monday");
  });

  it("clears the range when clearing the calendar", () => {
    const { input, picker } = mount("2026-11-09");
    picker.value = "";
    picker.dispatchEvent(new Event("change"));
    expect(input.value).toBe("");
  });

  it("keeps manual entry available if the native popup cannot open", () => {
    const { input, picker } = mount("today");
    picker.showPicker = vi.fn(() => {
      throw new DOMException("Unavailable");
    });
    expect(() => picker.click()).not.toThrow();
    expect(input.value).toBe("today");
    expect(input.disabled).toBe(false);
  });
});
