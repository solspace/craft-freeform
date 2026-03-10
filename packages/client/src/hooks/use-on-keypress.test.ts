import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOnKeypress } from "./use-on-keypress";

type KeypressProps = Parameters<typeof useOnKeypress>[0];

describe("use-on-keypress", () => {
  it("binds by default", () => {
    const callback = vi.fn();

    renderHook(() =>
      useOnKeypress({
        callback,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

    expect(callback).toHaveBeenCalled();
  });

  it("binds when meets condition", () => {
    const callback = vi.fn();

    renderHook(() =>
      useOnKeypress({
        callback,
        meetsCondition: true,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

    expect(callback).toHaveBeenCalled();
  });

  it("unbinds when doesn't meet condition", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: KeypressProps) => useOnKeypress(props),
      {
        initialProps: {
          callback,
          meetsCondition: true,
        },
      },
    );

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ callback, meetsCondition: false });

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("unbinds when unmouts", () => {
    const callback = vi.fn();

    const { unmount } = renderHook(
      (props: KeypressProps) => useOnKeypress(props),
      {
        initialProps: {
          callback,
          meetsCondition: true,
        },
      },
    );

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    document.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
