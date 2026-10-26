import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { LayoutDesignGroups } from "./layout-design-groups";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));

it("opens one subsection at a time without losing edits in collapsed settings", () => {
  function CardSetting() {
    const [value, setValue] = useState("24");
    return (
      <button type="button" onClick={() => setValue("32")}>
        Card padding {value}px
      </button>
    );
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    act(() =>
      root.render(
        <LayoutDesignGroups
          defaultGroup="Section"
          groups={[
            {
              label: "Section",
              content: <input defaultValue="Section settings" />,
            },
            { label: "Cards", content: <CardSetting /> },
            {
              label: "Links & Buttons",
              content: <input defaultValue="Link settings" />,
            },
          ]}
        />,
      ),
    );
    const heading = (label: string) =>
      Array.from(
        container.querySelectorAll<HTMLButtonElement>("h3 button"),
      ).find((button) => button.textContent === label)!;
    const panel = (label: string) =>
      document.getElementById(heading(label).getAttribute("aria-controls")!)!;
    expect(heading("Section").getAttribute("aria-expanded")).toBe("true");
    expect(panel("Cards").hasAttribute("inert")).toBe(true);
    act(() => heading("Cards").click());
    expect(heading("Section").getAttribute("aria-expanded")).toBe("false");
    expect(panel("Section").hasAttribute("inert")).toBe(true);
    expect(panel("Cards").hasAttribute("inert")).toBe(false);
    act(() => panel("Cards").querySelector("button")!.click());
    act(() => heading("Links & Buttons").click());
    act(() => heading("Cards").click());
    expect(panel("Cards").textContent).toContain("Card padding 32px");
    expect(panel("Links & Buttons").hasAttribute("inert")).toBe(true);
    act(() => heading("Cards").click());
    expect(
      container.querySelectorAll('h3 button[aria-expanded="true"]'),
    ).toHaveLength(0);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

it("respects reduced motion and fits growing content without clipping it", () => {
  let contentHeight = 120;
  const callbacks: (() => void)[] = [];
  const measure = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => ({ height: contentHeight }) as DOMRect);
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    act(() =>
      root.render(
        <LayoutDesignGroups
          defaultGroup="Section"
          groups={[
            {
              label: "Section",
              content: <input defaultValue="Section settings" />,
            },
            { label: "Cards", content: <input defaultValue="Card settings" /> },
          ]}
        />,
      ),
    );
    const headings = container.querySelectorAll<HTMLButtonElement>("h3 button");
    const panels = container.querySelectorAll<HTMLElement>('[role="region"]');
    expect(panels[0].style.height).toBe("120px");
    expect(panels[1].style.height).toBe("0px");
    act(() => headings[1].click());
    expect(panels[0].style.height).toBe("0px");
    expect(panels[1].style.height).toBe("120px");
    act(() => {
      contentHeight = 240;
      for (const callback of callbacks) callback();
    });
    expect(panels[1].style.height).toBe("240px");
    act(() => headings[0].click());
    expect(panels[0].style.height).toBe("240px");
    expect(panels[1].style.height).toBe("0px");
  } finally {
    act(() => root.unmount());
    container.remove();
    measure.mockRestore();
    vi.unstubAllGlobals();
  }
});
