import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whenCpReady } from "../../../lib/cp/ready";

const source = readFileSync(
  path.resolve("src/components/cp/code-pack/index.js"),
  "utf8",
)
  .replace(/^import .*;\n/m, "")
  .replace("export function", "function");
const built = readFileSync(
  path.resolve("../plugin/src/Resources/js/scripts/cp/code-pack/index.js"),
  "utf8",
);

for (const [name, script] of [
  ["source", source],
  ["built asset", built],
]) {
  describe(`demo installation (${name})`, () => {
    let form: HTMLFormElement;
    let prefix: HTMLInputElement;
    let button: HTMLButtonElement;
    let root: HTMLElement;
    let request: ReturnType<typeof vi.fn>;
    const element = (selector: string) =>
      root.querySelector<HTMLElement>(selector)!;
    const submit = () =>
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    const flush = async () => {
      for (let i = 0; i < 6; i++) await Promise.resolve();
    };
    const respond = (payload: unknown, ok = true) => ({
      ok,
      json: async () => payload,
    });

    function mount(readOnly = false, exists = true) {
      document.body.innerHTML = `<div id="demo-installer">
        <div data-install-setup><form id="demo-install-form" data-read-only="${readOnly}" data-checked-prefix="freeform-demo">
          <input name="action" value="freeform/codepack/install" type="hidden">
          <input name="CRAFT_CSRF_TOKEN" value="csrf-test-token" type="hidden">
          <input id="prefix" name="prefix" value="freeform-demo" required ${readOnly ? "disabled" : ""}>
          <p id="demo-prefix-error" data-prefix-error hidden>Enter a folder name</p>
          <button type="submit" ${readOnly ? "disabled" : ""}>Install</button>
        </form><code>web/assets/<span data-prefix></span>/</code><span data-name="/forms"></span></div>
        <div data-existing-templates ${exists ? "" : "hidden"}>Folder already exists.</div>
        <div class="freeform-demo-check-status" hidden><span data-destination-status></span><button type="button" data-retry-destination hidden>Retry check</button></div>
        <div data-install-progress hidden tabindex="-1"><progress></progress></div>
        <div data-install-error hidden tabindex="-1"></div>
        <div data-install-result hidden tabindex="-1"></div>
      </div>`;
      form = document.querySelector("form")!;
      prefix = document.querySelector("#prefix")!;
      button = document.querySelector("button")!;
      root = document.querySelector("#demo-installer")!;
      new Function("whenCpReady", script)(whenCpReady);
    }

    beforeEach(() => {
      vi.useFakeTimers();
      vi.stubGlobal("Craft", {
        t: (_category: string, message: string) => message,
      });
      request = vi.fn();
      vi.stubGlobal("fetch", request);
      vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
      mount();
    });
    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      document.body.innerHTML = "";
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("shows indeterminate progress until the server confirms success and prevents duplicate installs", async () => {
      let finish!: (value: unknown) => void;
      request.mockReturnValue(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
      submit();
      submit();
      expect(request).toHaveBeenCalledTimes(1);
      expect(element("[data-install-progress]").hidden).toBe(false);
      expect(element("progress").hasAttribute("value")).toBe(false);
      expect(element("[data-install-result]").hidden).toBe(true);
      expect(root.getAttribute("aria-busy")).toBe("true");
      expect(button.disabled).toBe(true);
      const options = request.mock.calls[0][1];
      expect(options.body.get("prefix")).toBe("freeform-demo");
      expect(options.body.get("CRAFT_CSRF_TOKEN")).toBe("csrf-test-token");
      finish(
        respond({
          success: true,
          html: '<a href="/freeform-demo/">View demos</a>',
        }),
      );
      await flush();
      expect(element("[data-install-progress]").hidden).toBe(true);
      expect(element("[data-install-setup]").hidden).toBe(true);
      expect(element("[data-install-result]").innerHTML).toContain(
        "View demos",
      );
      expect(element("[data-install-result]").hidden).toBe(false);
      expect(document.activeElement).toBe(element("[data-install-result]"));
      expect(root.hasAttribute("aria-busy")).toBe(false);
    });

    it.each([false, true])(
      "restores the form after a server error (HTTP failure: %s)",
      async (httpFailure) => {
        request.mockResolvedValue(
          respond(
            { success: false, message: "Folder is not writable." },
            !httpFailure,
          ),
        );
        submit();
        await flush();
        expect(element("[data-install-error]").textContent).toBe(
          "Folder is not writable.",
        );
        expect(element("[data-install-setup]").hidden).toBe(false);
        expect(element("[data-install-progress]").hidden).toBe(true);
        expect(button.disabled).toBe(false);
        expect(document.activeElement).toBe(element("[data-install-error]"));
        expect(element("[data-install-result]").hidden).toBe(true);
      },
    );

    it.each(["network", "invalid response"])(
      "handles %s without showing success or automatically retrying",
      async (failure) => {
        if (failure === "network")
          request.mockRejectedValue(new TypeError("Failed to fetch"));
        else
          request.mockResolvedValue({
            ok: true,
            json: async () => {
              throw new SyntaxError("HTML login page");
            },
          });
        submit();
        await flush();
        expect(element("[data-install-error]").textContent).toContain(
          "Check the demo folder",
        );
        expect(element("[data-install-result]").hidden).toBe(true);
        expect(element("[data-install-setup]").hidden).toBe(false);
        expect(request).toHaveBeenCalledTimes(1);
      },
    );

    it("allows a deliberate retry after failure", async () => {
      request
        .mockResolvedValueOnce(
          respond({ success: false, message: "Not writable" }),
        )
        .mockResolvedValueOnce(respond({ success: true, html: "Ready" }));
      submit();
      await flush();
      submit();
      await flush();
      expect(request).toHaveBeenCalledTimes(2);
      expect(element("[data-install-error]").hidden).toBe(true);
      expect(element("[data-install-result]").textContent).toBe("Ready");
    });

    it.each(["", "../outside", "folder/child", "folder\\child", ".", ".."])(
      "rejects invalid install path %s",
      (value) => {
        prefix.value = value;
        prefix.dispatchEvent(new Event("input"));
        submit();
        expect(button.disabled).toBe(true);
        expect(element("[data-prefix-error]").hidden).toBe(false);
        expect(prefix.getAttribute("aria-invalid")).toBe("true");
        expect(request).not.toHaveBeenCalled();
      },
    );

    it("updates paths when pasting a folder name and keeps values as text", async () => {
      request.mockResolvedValue(respond({ templatesExist: false }));
      prefix.value = "demo-v5.18";
      prefix.dispatchEvent(new Event("input"));
      expect(button.disabled).toBe(true);
      await vi.advanceTimersByTimeAsync(250);
      expect(button.disabled).toBe(false);
      expect(element("[data-prefix]").textContent).toBe("demo-v5.18");
      expect(element("[data-name]").textContent).toBe("demo-v5.18/forms");
      prefix.value = '<img src=x onerror="alert(1)">';
      prefix.dispatchEvent(new Event("input"));
      expect(root.querySelector("img")).toBeNull();
      expect(button.disabled).toBe(true);
    });

    it("keeps a read-only installer disabled even after input events", () => {
      mount(true);
      prefix.dispatchEvent(new Event("input"));
      submit();
      expect(button.disabled).toBe(true);
      expect(request).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      "preserves the server's initial folder state (%s)",
      (exists) => {
        mount(false, exists);
        expect(element("[data-existing-templates]").hidden).toBe(!exists);
        expect(request).not.toHaveBeenCalled();
      },
    );

    it("debounces folder checks and hides stale warnings while the name changes", async () => {
      request.mockResolvedValue(respond({ templatesExist: false }));
      prefix.value = "new-folder";
      prefix.dispatchEvent(new Event("input"));
      prefix.value = "another-folder";
      prefix.dispatchEvent(new Event("input"));
      expect(element("[data-existing-templates]").hidden).toBe(true);
      expect(button.disabled).toBe(true);
      submit();
      await vi.advanceTimersByTimeAsync(249);
      expect(request).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(request).toHaveBeenCalledTimes(1);
      const data = request.mock.calls[0][1].body;
      expect(data.get("action")).toBe("freeform/codepack/check-destination");
      expect(data.get("prefix")).toBe("another-folder");
      expect(data.get("CRAFT_CSRF_TOKEN")).toBe("csrf-test-token");
      expect(element("[data-existing-templates]").hidden).toBe(true);
      expect(button.disabled).toBe(false);
    });

    it("shows the banner only for an existing folder", async () => {
      request.mockResolvedValue(respond({ templatesExist: true }));
      prefix.value = "existing-folder";
      prefix.dispatchEvent(new Event("input"));
      await vi.advanceTimersByTimeAsync(250);
      expect(element("[data-existing-templates]").hidden).toBe(false);
      expect(button.disabled).toBe(false);
    });

    it("ignores a late response for a previous folder", async () => {
      let finishFirst!: (value: unknown) => void;
      request
        .mockReturnValueOnce(
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
        )
        .mockResolvedValueOnce(respond({ templatesExist: false }));
      prefix.value = "existing-folder";
      prefix.dispatchEvent(new Event("input"));
      await vi.advanceTimersByTimeAsync(250);
      const firstSignal = request.mock.calls[0][1].signal;
      prefix.value = "new-folder";
      prefix.dispatchEvent(new Event("input"));
      expect(firstSignal.aborted).toBe(true);
      await vi.advanceTimersByTimeAsync(250);
      finishFirst(respond({ templatesExist: true }));
      await flush();
      expect(element("[data-existing-templates]").hidden).toBe(true);
      expect(button.disabled).toBe(false);
    });

    it("skips checks for invalid folder names", async () => {
      prefix.value = "../outside";
      prefix.dispatchEvent(new Event("input"));
      await vi.advanceTimersByTimeAsync(250);
      expect(request).not.toHaveBeenCalled();
      expect(element("[data-existing-templates]").hidden).toBe(true);
    });

    it("offers a retry after a failed check and prevents unchecked installation", async () => {
      request
        .mockRejectedValueOnce(new TypeError("Network unavailable"))
        .mockResolvedValueOnce(respond({ templatesExist: false }));
      prefix.value = "new-folder";
      prefix.dispatchEvent(new Event("input"));
      await vi.advanceTimersByTimeAsync(250);
      expect(element("[data-retry-destination]").hidden).toBe(false);
      expect(button.disabled).toBe(true);
      submit();
      expect(request).toHaveBeenCalledTimes(1);
      element("[data-retry-destination]").click();
      await vi.advanceTimersByTimeAsync(0);
      expect(button.disabled).toBe(false);
      expect(element(".freeform-demo-check-status").hidden).toBe(true);
    });

    it("allows retrying a folder check that times out", async () => {
      request.mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      );
      prefix.value = "slow-folder";
      prefix.dispatchEvent(new Event("input"));
      await vi.advanceTimersByTimeAsync(10250);
      expect(element("[data-retry-destination]").hidden).toBe(false);
      expect(button.disabled).toBe(true);
      expect(element("[data-existing-templates]").hidden).toBe(true);
    });

    it("does nothing on pages without the installer", () => {
      document.body.innerHTML = "";
      expect(() =>
        new Function("whenCpReady", script)((initialize: () => void) =>
          initialize(),
        ),
      ).not.toThrow();
    });
  });
}
