import { PropertyType } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import ClockFormatControl from "./clock-format";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

it.each([false, true])(
  "keeps the saved %s clock flag boolean when selecting either clock format",
  (value) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div");
    const root = createRoot(host);
    const updateValue = vi.fn();
    try {
      act(() =>
        root.render(
          <ClockFormatControl
            value={value}
            updateValue={updateValue}
            property={{
              type: PropertyType.Boolean,
              handle: "clock24h",
              label: "Clock format",
            }}
          />,
        ),
      );
      expect(host.querySelector('[aria-pressed="true"]')?.textContent).toBe(
        value ? "24-hour" : "12-hour",
      );
      const buttons = host.querySelectorAll("button");
      act(() => buttons[0].click());
      expect(updateValue).toHaveBeenLastCalledWith(false);
      act(() => buttons[1].click());
      expect(updateValue).toHaveBeenLastCalledWith(true);
    } finally {
      act(() => root.unmount());
      vi.unstubAllGlobals();
    }
  },
);
