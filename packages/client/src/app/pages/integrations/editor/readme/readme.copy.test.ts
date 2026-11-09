import { afterEach, describe, expect, it, vi } from "vitest";
import { wireReadmeCopyButtons } from "./readme.copy";
import { renderReadme } from "./readme.render";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function setup(writeText = vi.fn().mockResolvedValue(undefined)) {
  vi.useFakeTimers();
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  const container = document.createElement("div");
  container.innerHTML = renderReadme(
    '```json\n{"enabled": true}\n```\n\n```html\n<button>Send</button>\n```',
  );
  const cleanup = wireReadmeCopyButtons(container);
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>("button.readme-copy"),
  );
  return { container, buttons, cleanup, writeText };
}

describe("README code copying", () => {
  it("copies only the original example and resets its confirmation", async () => {
    const { buttons, writeText, cleanup } = setup();
    buttons[0]
      .querySelector("svg")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await vi.waitFor(() => expect(buttons[0].textContent).toBe("Copied"));
    expect(writeText).toHaveBeenCalledWith('{"enabled": true}');
    expect(buttons[1].textContent).toBe("Copy code");
    vi.advanceTimersByTime(2000);
    expect(buttons[0].textContent).toBe("Copy code");
    cleanup();
  });

  it("copies HTML as text and keeps each block's feedback separate", async () => {
    const { buttons, writeText, cleanup } = setup();
    buttons[1].click();
    await vi.waitFor(() => expect(buttons[1].textContent).toBe("Copied"));
    expect(writeText).toHaveBeenCalledWith("<button>Send</button>");
    expect(buttons[0].textContent).toBe("Copy code");
    cleanup();
  });

  it("shows manual copy guidance if clipboard access fails", async () => {
    const { container, buttons, cleanup } = setup(
      vi.fn().mockRejectedValue(new Error("Clipboard blocked")),
    );
    buttons[0].click();
    await vi.waitFor(() =>
      expect(
        container.querySelector(".readme-copy-status")?.textContent,
      ).toContain("Select and copy"),
    );
    expect(buttons[0].textContent).toBe("Copy code");
    expect(buttons[0].disabled).toBe(false);
    expect(container.querySelector("code")?.textContent).toBe(
      '{"enabled": true}',
    );
    cleanup();
  });

  it("ignores duplicate clicks while copying and late completion after unmount", async () => {
    let complete!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const { buttons, cleanup } = setup(writeText);
    buttons[0].click();
    buttons[0].click();
    expect(writeText).toHaveBeenCalledTimes(1);
    cleanup();
    complete();
    await Promise.resolve();
    expect(buttons[0].textContent).toBe("Copy code");
    expect(vi.getTimerCount()).toBe(0);
  });
});
