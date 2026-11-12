import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Options } from "./dropdown.options";

it("marks the saved numeric status ID as selected when menu values are strings", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(() =>
      root.render(
        <Options
          value={2}
          options={[
            { value: "1", label: "Pending" },
            { value: "2", label: "Open" },
          ]}
          focusIndex={-1}
          onChange={vi.fn()}
        />,
      ),
    );
    const selected = host.querySelector(
      '[role="option"][aria-selected="true"]',
    )!;
    expect(selected.textContent).toBe("Open");
    expect(selected.querySelector("svg")).not.toBeNull();
    expect(host.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
  } finally {
    await act(() => root.unmount());
    host.remove();
  }
});
