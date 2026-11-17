// @vitest-environment jsdom

import { mountDateTimePicker } from "@solspace/freeform-core";
import { beforeEach, expect, it, vi } from "vitest";
import { createDatetimeExtension } from "./index.js";

vi.mock("@solspace/freeform-core", () => ({ mountDateTimePicker: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "<div><input></div>";
});

it.each([undefined, "freeform", "retired-picker"])(
  "uses the bundled picker for %s and disposes it",
  async (picker) => {
    const destroy = vi.fn();
    vi.mocked(mountDateTimePicker).mockReturnValue({ destroy } as never);
    const setValue = vi.fn();
    const element = document.querySelector("div")!;
    const cleanup = await createDatetimeExtension().mount!({
      field: {
        type: "datetime",
        frontend: {
          config: { picker, format: "d/m/Y", locale: "fr", minuteStep: 15 },
        },
      },
      element,
      setValue,
    } as never);
    expect(mountDateTimePicker).toHaveBeenCalledWith(
      element.querySelector("input"),
      expect.objectContaining({
        format: "d/m/Y",
        locale: "fr",
        minuteStep: 15,
      }),
      setValue,
    );
    expect(document.querySelector("script,link")).toBeNull();
    if (typeof cleanup === "function") cleanup();
    expect(destroy).toHaveBeenCalledOnce();
  },
);

it.each(["browser", "none"])(
  "preserves the explicit %s mode",
  async (picker) => {
    const element = document.querySelector("div")!;
    await createDatetimeExtension().mount!({
      field: {
        type: "datetime",
        frontend: { config: { picker, nativeInputType: "date" } },
      },
      element,
    } as never);
    expect(mountDateTimePicker).not.toHaveBeenCalled();
    expect(element.querySelector("input")!.type).toBe(
      picker === "browser" ? "date" : "text",
    );
  },
);
