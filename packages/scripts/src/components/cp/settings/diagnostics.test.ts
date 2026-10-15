import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync(
  path.resolve("src/components/cp/settings/diagnostics.js"),
  "utf8",
);
const built = readFileSync(
  path.resolve("../plugin/src/Resources/js/scripts/cp/settings/diagnostics.js"),
  "utf8",
);

for (const [name, script] of [
  ["source", source],
  ["built asset", built],
]) {
  describe(`diagnostics copy button (${name})`, () => {
    let button: HTMLButtonElement;
    let report: HTMLTextAreaElement;
    let disclosure: HTMLDetailsElement;
    let status: HTMLElement;
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.useFakeTimers();
      document.body.innerHTML = `
        <button id="freeform-copy-diagnostics" data-copied-label="Copied!">Copy Support Report</button>
        <div id="freeform-diagnostics" data-copy-success="Report copied." data-copy-fallback="Copy using your keyboard.">
          <details class="ff-diag-report"><textarea id="freeform-diagnostic-report" readonly>Freeform Diagnostics\nWarning: check settings</textarea></details>
          <p id="freeform-diagnostic-copy-status" role="status"></p>
        </div>`;
      button = document.querySelector("button")!;
      report = document.querySelector("textarea")!;
      disclosure = document.querySelector("details")!;
      status = document.getElementById("freeform-diagnostic-copy-status")!;
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });
      new Function(script)();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      document.body.innerHTML = "";
    });

    it("copies the full report and restores the button after three seconds", async () => {
      button.click();
      await Promise.resolve();
      expect(writeText).toHaveBeenCalledWith(report.value);
      expect(button.textContent).toBe("Copied!");
      expect(status.textContent).toBe("Report copied.");
      expect(disclosure.open).toBe(false);
      vi.advanceTimersByTime(2999);
      expect(button.textContent).toBe("Copied!");
      vi.advanceTimersByTime(1);
      expect(button.textContent).toBe("Copy Support Report");
    });

    it("restarts the feedback timer when copying again", async () => {
      button.click();
      await Promise.resolve();
      vi.advanceTimersByTime(2000);
      button.click();
      await Promise.resolve();
      vi.advanceTimersByTime(2000);
      expect(button.textContent).toBe("Copied!");
      vi.advanceTimersByTime(1000);
      expect(button.textContent).toBe("Copy Support Report");
    });

    it.each(["rejected", "unavailable"])(
      "opens and selects the report when clipboard is %s",
      async (failure) => {
        if (failure === "rejected")
          writeText.mockRejectedValue(new Error("Clipboard denied"));
        else
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: undefined,
          });
        button.click();
        await Promise.resolve();
        expect(disclosure.open).toBe(true);
        expect(document.activeElement).toBe(report);
        expect(report.selectionStart).toBe(0);
        expect(report.selectionEnd).toBe(report.value.length);
        expect(status.textContent).toBe("Copy using your keyboard.");
        expect(button.textContent).toBe("Copy Support Report");
      },
    );

    it("safely skips pages without the diagnostics report", () => {
      document.body.innerHTML = "";
      expect(() => new Function(script)()).not.toThrow();
    });
  });
}
