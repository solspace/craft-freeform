import { ModalProvider } from "@components/modals/modal.context";
import { PortalProvider } from "@editor/builder/contexts/portal.context";
import { EscapeStackProvider } from "@ff-client/contexts/escape/escape.context";
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SetupGuide } from "./welcome.setup";
import type { SetupClient } from "./welcome.setup.api";
import { setupOptions, setupValues } from "./welcome.setup.test-fixtures";

vi.mock("@ff-client/utils/urls", () => ({
  generateUrl: (path: string) => `/admin/freeform/${path}`,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string> = {}) =>
    text.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? key),
}));
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let client: SetupClient;
let onSaved: ReturnType<typeof vi.fn<(redirect: string) => void>>;
let onBack: ReturnType<typeof vi.fn<() => void>>;
const dialogMethods = new Map(
  ["showModal", "close"].map((method) => [
    method,
    Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, method),
  ]),
);
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  for (const method of dialogMethods.keys())
    Object.defineProperty(HTMLDialogElement.prototype, method, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = method === "showModal";
      },
    });
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  client = {
    load: vi.fn().mockResolvedValue(structuredClone(setupOptions)),
    save: vi.fn().mockResolvedValue({ redirect: "/admin/freeform/welcome" }),
  };
  onSaved = vi.fn();
  onBack = vi.fn();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  for (const [method, descriptor] of dialogMethods) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, method);
  }
  vi.unstubAllGlobals();
});
const render = async () => {
  await act(async () =>
    root.render(
      <EscapeStackProvider>
        <PortalProvider>
          <ModalProvider>
            <SetupGuide
              headingRef={createRef()}
              onBack={onBack}
              client={client}
              onSaved={onSaved}
            />
          </ModalProvider>
        </PortalProvider>
      </EscapeStackProvider>,
    ),
  );
};
const button = (text: string) =>
  Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(
    (item) => item.textContent?.trim().replace(/^\d+/, "") === text,
  )!;
const click = async (text: string) => {
  await act(async () => button(text).click());
};
const radio = async (value: string) => {
  await act(async () =>
    host
      .querySelector<HTMLInputElement>(`input[type=radio][value="${value}"]`)!
      .click(),
  );
};
const checkbox = async (text: string) => {
  const control = Array.from(
    host.querySelectorAll<HTMLButtonElement>('[role="switch"]'),
  ).find((item) => item.getAttribute("aria-label")?.includes(text));
  if (control) {
    await act(async () => control.click());
    return;
  }
  const label = Array.from(host.querySelectorAll("label")).find((item) =>
    item.textContent?.includes(text),
  )!;
  await act(async () =>
    label.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click(),
  );
};
const workflow = async () => {
  await radio("editors");
  await radio("samples");
  await radio("basic");
  await click("Continue");
  await radio("shared");
};
const suggest = async () => {
  await workflow();
  await click("Continue");
};
const field = (name: string) =>
  host.querySelector<HTMLInputElement & HTMLDivElement>(
    `[aria-label="${name}"]`,
  )!;
const change = async (name: string, value: string) => {
  const input = field(name);
  if (input.getAttribute("role") === "combobox") {
    await act(async () => input.click());
    await act(async () =>
      document
        .querySelector<HTMLElement>(
          `.dropdown-rollout [data-value="${value}"]`,
        )!
        .click(),
    );
    return;
  }
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      input instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(
      new Event(input instanceof HTMLSelectElement ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
};
describe("workflow setup guide", () => {
  it("asks questions before presenting editable recommendations and applies only reviewed changes", async () => {
    await render();
    expect(button("Continue").disabled).toBe(true);
    expect(
      Array.from(host.querySelectorAll("button")).some(
        (button) => button.textContent === "Previous",
      ),
    ).toBe(false);
    await suggest();
    expect(client.save).not.toHaveBeenCalled();
    expect(field("Template Method").textContent).toContain(
      "Form-specific & Global",
    );
    expect(
      field("Formatting Template").querySelector(".ff-recommended-badge"),
    ).toBeNull();
    await checkbox("Template Method");
    expect(field("Template Storage Type")).toBeNull();
    await click("Review");
    await click("Apply setup");
    expect(client.save).toHaveBeenCalledWith(
      {},
      setupValues,
      expect.any(AbortSignal),
      undefined,
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Your setup is saved");
    expect(
      Array.from(host.querySelectorAll("button")).some(
        (button) => button.textContent === "Previous",
      ),
    ).toBe(false);
    await click("Done");
    expect(onSaved).toHaveBeenCalledOnce();
  });
  it("hides omitted inputs, retains their draft, and uses a single actual-value switch for boolean settings", async () => {
    await render();
    await suggest();
    await change("Template Method", "global");
    await checkbox("Template Method");
    expect(field("Template Method")).toBeNull();
    await checkbox("Template Method");
    expect(field("Template Method").textContent).toContain("Global only");
    expect(
      host
        .querySelector('[role="switch"][aria-label="Use Spam Folder"]')
        ?.getAttribute("aria-checked"),
    ).toBe("true");
    await checkbox("Use Spam Folder");
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0].spamFolderEnabled).toBe(
      "false",
    );
  });
  it("shows setup links only after applying and hides unavailable starter resources", async () => {
    await render();
    await suggest();
    expect(host.querySelector(".setup-next-steps")).toBeNull();
    await change("Template Method", "form");
    expect(
      host.querySelector('[aria-label="Create starter email templates"]'),
    ).toBeNull();
    await click("Review");
    await click("Apply setup");
    expect(host.querySelector(".setup-next-steps a")).not.toBeNull();
  });
  it("toggles settings and resource creation from their visible labels", async () => {
    await render();
    await suggest();
    await act(async () =>
      host
        .querySelector<HTMLLabelElement>('label[for="setup-create-profile"]')!
        .click(),
    );
    expect(
      host
        .querySelector('[aria-label="Create a Limited Users profile"]')
        ?.getAttribute("aria-checked"),
    ).toBe("true");
    await act(async () =>
      host
        .querySelector<HTMLLabelElement>(
          'label[for="setup-spamFolderEnabled"]',
        )!
        .click(),
    );
    expect(
      host
        .querySelector('[aria-label="Use Spam Folder"]')
        ?.getAttribute("aria-checked"),
    ).toBe("false");
  });
  it("keeps AB navigation as configured unless explicitly changed", async () => {
    await render();
    await workflow();
    await checkbox("Show A/B Testing in navigation");
    await click("Continue");
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0].abTests).toBe("false");
  });
  it("distinguishes saved and proposed toggle values and lets users undo the change", async () => {
    vi.mocked(client.load).mockResolvedValueOnce({
      ...setupOptions,
      values: { ...setupOptions.values, abTests: "false" },
    });
    await render();
    await workflow();
    await checkbox("Show A/B Testing in navigation");
    await click("Continue");
    const row = host
      .querySelector("#setup-abTests")!
      .closest(".setup-suggestion")!;
    expect(row.querySelector(".setup-value")?.textContent).toBe(
      "DisabledEnabled",
    );
    expect(row.textContent).not.toContain("Currently saved:");
    await act(async () =>
      row.querySelector<HTMLButtonElement>(".setup-reset")!.click(),
    );
    expect(row.querySelector(".setup-value")?.textContent).toBe(
      "Already disabled",
    );
    expect(row.querySelector(".setup-reset")).toBeNull();
    expect(
      row.querySelector('[role="switch"]')?.getAttribute("aria-checked"),
    ).toBe("false");
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0]).not.toHaveProperty(
      "abTests",
    );
  });
  it("marks context-dependent recommended values without changing overrides or saved values", async () => {
    await render();
    await suggest();
    const mode = field("Recording mode");
    expect(mode.textContent).toContain("Minimal");
    expect(mode.querySelector(".ff-recommended-badge")).not.toBeNull();
    await change("Recording mode", "detailed");
    expect(
      field("Recording mode").querySelector(".ff-recommended-badge"),
    ).toBeNull();
    const row = field("Recording mode").closest(".setup-suggestion")!;
    expect(row.querySelector(".setup-recommended-value")?.textContent).toBe(
      "Recommended for this setup: Minimal",
    );
    expect(row.textContent).toContain("Currently saved: Minimal");
    await act(async () => field("Recording mode").click());
    expect(
      document.querySelector(
        '.dropdown-rollout [data-value="minimal"] .ff-recommended-badge',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '.dropdown-rollout [data-value="detailed"] .ff-recommended-badge',
      ),
    ).toBeNull();
    await act(async () =>
      document
        .querySelector<HTMLElement>('.dropdown-rollout [data-value="minimal"]')!
        .click(),
    );
    expect(
      field("Recording mode").querySelector(".ff-recommended-badge"),
    ).not.toBeNull();
    expect(row.querySelector(".setup-recommended-value")).toBeNull();
    await click("Your workflow");
    await radio("advanced");
    await click("Suggested setup");
    // The edited value stays Minimal. Only the recommendation follows the answers.
    expect(field("Recording mode").textContent).toContain("Minimal");
    expect(
      field("Recording mode")
        .closest(".setup-suggestion")
        ?.querySelector(".setup-recommended-value")?.textContent,
    ).toBe("Recommended for this setup: Standard");
  });
  it.each(["detailed", "custom"])(
    "keeps the saved %s recording mode without calling it recommended",
    async (activityMode) => {
      vi.mocked(client.load).mockResolvedValueOnce({
        ...setupOptions,
        values: { ...setupOptions.values, activityMode },
      });
      await render();
      await suggest();
      const control = field("Recording mode");
      const label = activityMode === "detailed" ? "Detailed" : "Custom";
      expect(control.textContent).toContain(label);
      expect(control.querySelector(".ff-recommended-badge")).toBeNull();
      expect(control.closest(".setup-suggestion")?.textContent).toContain(
        `Currently saved: ${label}`,
      );
    },
  );
  it("preselects requested failure alerts, requires supplied recipients, and leaves digests optional", async () => {
    await render();
    await workflow();
    await checkbox("Receive alerts about problems");
    await checkbox("Review submissions in Craft");
    await click("Continue");
    expect(field("Send Email Alerts for Failed Notifications").value).toBe("");
    expect(
      field("Send Email Alerts for Failed Notifications").placeholder,
    ).toBe("name@example.com, team@example.com");
    expect(field("Critical System Error Report Recipients").value).toBe("");
    expect(field("Stats Digest Email")).toBeNull();
    expect(button("Continue").disabled).toBe(true);
    await click("Review");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Enter alert recipients",
    );
    expect(client.save).not.toHaveBeenCalled();
    await change(
      "Send Email Alerts for Failed Notifications",
      "qa-alerts@example.com",
    );
    await checkbox("Include Critical System Error Report Recipients");
    expect(button("Continue").disabled).toBe(false);
    await click("Review");
    expect(host.querySelectorAll(".setup-review dt small")).toHaveLength(0);
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0]).toMatchObject({
      alertNotificationRecipients: "qa-alerts@example.com",
    });
    expect(vi.mocked(client.save).mock.calls[0][0]).not.toHaveProperty(
      "errorNotificationRecipients",
    );
    expect(vi.mocked(client.save).mock.calls[0][0]).not.toHaveProperty(
      "clientDigestRecipients",
    );
  });
  it("guards links with the shared confirmation and preserves the draft on Cancel", async () => {
    await render();
    await workflow();
    const link = Array.from(host.querySelectorAll("a")).find(
      (a) => a.textContent === "All settings",
    )!;
    let blocked = false;
    await act(async () => {
      blocked = !link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });
    expect(blocked).toBe(true);
    expect(document.querySelector("craft-dialog")?.textContent).toContain(
      "Your setup choices have not been applied",
    );
    await act(async () =>
      Array.from(
        document.querySelectorAll<HTMLButtonElement>("craft-dialog button"),
      )
        .find((button) => button.textContent === "Cancel")!
        .click(),
    );
    expect(
      host.querySelector<HTMLInputElement>('input[value="shared"]')?.checked,
    ).toBe(true);
    await click("Back to welcome");
    await act(async () =>
      Array.from(
        document.querySelectorAll<HTMLButtonElement>("craft-dialog button"),
      )
        .find((button) => button.textContent === "Leave setup")!
        .click(),
    );
    expect(onBack).toHaveBeenCalledOnce();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
  });
  it("keeps daily and weekly schedule choices in the legacy setting value", async () => {
    await render();
    await workflow();
    await checkbox("Review submissions in Craft");
    await click("Continue");
    expect(field("Stats Digest Email Frequency")).toBeNull();
    await checkbox("Include Stats Digest Email Frequency");
    await click("Daily");
    expect(host.querySelector('[aria-label="Day of the week"]')).toBeNull();
    await click("Weekly");
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Sunday"]')!.click(),
    );
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0].clientDigestFrequency).toBe(
      "0",
    );
  });
  it("preserves overrides between steps and does not reload on browser focus", async () => {
    await render();
    await suggest();
    await change("Template Method", "global");
    await click("Your workflow");
    await click("Suggested setup");
    expect(field("Template Method").textContent).toContain("Global only");
    window.dispatchEvent(new Event("focus"));
    expect(client.load).toHaveBeenCalledOnce();
    await click("Review");
    expect(host.querySelector(".setup-review")?.textContent).toContain(
      "Global only",
    );
  });
  it("only creates resources explicitly selected and includes them in review", async () => {
    await render();
    await suggest();
    await checkbox("Create a Limited Users profile");
    await checkbox("Create starter email templates");
    await click("Review");
    expect(host.textContent).toContain("New Limited Users profile");
    expect(client.save).not.toHaveBeenCalled();
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][3]).toMatchObject({
      profile: { name: "Form editors", level: "simplified-building" },
      templates: { team: "Team notification", visitor: "Visitor confirmation" },
      requestId: expect.any(String),
    });
  });
  it("offers the same building presets and reviews the chosen access before saving", async () => {
    await render();
    await suggest();
    await checkbox("Create a Limited Users profile");
    expect(field("Editing access").textContent).toContain(
      "Simplified Building",
    );
    expect(host.textContent).toContain("admin notifications");
    await change("Editing access", "advanced-building");
    expect(field("Editing access").textContent).toContain("Advanced Building");
    await click("Review");
    expect(host.textContent).toContain(
      "Build with all field types, notifications, rules, and everyday settings.",
    );
    expect(client.save).not.toHaveBeenCalled();
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][3]).toMatchObject({
      profile: {
        name: "Form editors",
        level: "advanced-building",
        uploads: false,
      },
    });
  });
  it("keeps selected uploads in the simplified profile request", async () => {
    await render();
    await workflow();
    await checkbox("Accept file uploads");
    await click("Continue");
    const count = field("Max Files");
    expect(field("Asset Source")).not.toBeNull();
    expect(
      field("Asset Source").querySelector(".ff-recommended-badge"),
    ).toBeNull();
    expect(count.parentElement?.querySelector("span")?.textContent).toBe(
      "file",
    );
    expect(
      field("Maximum File Size").parentElement?.querySelector("span")
        ?.textContent,
    ).toBe("KB");
    await change("Max Files", "3");
    expect(count.parentElement?.querySelector("span")?.textContent).toBe(
      "files",
    );
    await checkbox("Create a Limited Users profile");
    expect(host.textContent).toContain(
      "Selected upload fields are also available.",
    );
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][3]).toMatchObject({
      profile: { level: "simplified-building", uploads: true },
    });
    expect(vi.mocked(client.save).mock.calls[0][0].defaultUploadCount).toBe(
      "3",
    );
  });
  it("explains unavailable upload volumes and offers their setup only after saving", async () => {
    vi.mocked(client.load).mockResolvedValueOnce({
      ...setupOptions,
      catalog: { ...setupOptions.catalog, defaultUploadSource: [] },
      assetSettingsUrl: "/admin/settings/assets",
    });
    await render();
    await workflow();
    await checkbox("Accept file uploads");
    await click("Continue");
    expect(field("Asset Source")).toBeNull();
    expect(host.textContent).toContain("No upload volumes are available.");
    expect(host.querySelector('a[href="/admin/settings/assets"]')).toBeNull();
    await click("Review");
    await click("Apply setup");
    expect(client.save).toHaveBeenCalledOnce();
    expect(vi.mocked(client.save).mock.calls[0][0]).not.toHaveProperty(
      "defaultUploadSource",
    );
    expect(
      host.querySelector('a[href="/admin/settings/assets"]')?.textContent,
    ).toBe("Set up an upload volume");
  });
  it("does not send a hidden resource after changing to form-specific templates", async () => {
    await render();
    await suggest();
    await checkbox("Create starter email templates");
    await change("Template Method", "form");
    await click("Review");
    expect(host.textContent).not.toContain("New shared email templates");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][3]).toBeUndefined();
  });
  it("keeps failed-save choices and the same resource request identity for retry", async () => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame"],
    });
    vi.mocked(client.save).mockRejectedValueOnce(new Error("offline"));
    await render();
    await suggest();
    await checkbox("Create a Limited Users profile");
    await click("Review");
    await click("Apply setup");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Your choices are still here",
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(host.querySelector('[role="alert"]'));
    await act(async () => vi.advanceTimersByTime(20));
    expect(document.activeElement).toBe(host.querySelector('[role="alert"]'));
    vi.useRealTimers();
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][3]).toEqual(
      vi.mocked(client.save).mock.calls[1][3],
    );
  });
  it("preserves choices on a conflict until the user explicitly reloads", async () => {
    vi.mocked(client.save).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "Settings changed while this guide was open." },
      },
    });
    await render();
    await suggest();
    await click("Review");
    await click("Apply setup");
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await click("Reload settings");
    expect(client.load).toHaveBeenCalledOnce();
    expect(host.querySelector(".setup-review")?.textContent).toContain(
      "Database",
    );
  });
  it("allows questions on read-only sites but disables setting controls and creation", async () => {
    vi.mocked(client.load).mockResolvedValueOnce({
      ...setupOptions,
      canSave: false,
    });
    await render();
    await workflow();
    await checkbox("Receive alerts about problems");
    await click("Continue");
    expect(
      host
        .querySelector('[aria-label="Include Template Method"]')
        ?.getAttribute("disabled"),
    ).not.toBeNull();
    expect(button("Continue").disabled).toBe(false);
    await click("Review");
    expect(button("Apply setup").disabled).toBe(true);
    expect(client.save).not.toHaveBeenCalled();
  });
  it("respects configured locks even when the answers suggest another value", async () => {
    vi.mocked(client.load).mockResolvedValueOnce({
      ...setupOptions,
      locked: ["emailTemplateMethod"],
    });
    await render();
    await suggest();
    expect(
      host
        .querySelector('[aria-label="Include Template Method"]')
        ?.getAttribute("disabled"),
    ).not.toBeNull();
    await click("Review");
    await click("Apply setup");
    expect(vi.mocked(client.save).mock.calls[0][0]).not.toHaveProperty(
      "emailTemplateMethod",
    );
  });
  it("offers load retry, cancels stale loads, and asks before discarding answers", async () => {
    vi.mocked(client.load).mockRejectedValueOnce(new Error("offline"));
    await render();
    await click("Try again");
    await workflow();
    await click("Back to welcome");
    expect(
      document.querySelector("craft-dialog")?.getAttribute("label"),
    ).toContain("Leave the setup guide?");
    await act(async () =>
      Array.from(
        document.querySelectorAll<HTMLButtonElement>("craft-dialog button"),
      )
        .find((button) => button.textContent === "Cancel")!
        .click(),
    );
    expect(onBack).not.toHaveBeenCalled();
    const signal = vi.mocked(client.load).mock.calls.at(-1)![0];
    act(() => root.unmount());
    expect(signal.aborted).toBe(true);
    root = createRoot(host);
  });
  it("disables navigation during save and releases the unload guard after success", async () => {
    let resolve!: (value: { redirect: string }) => void;
    vi.mocked(client.save).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    await render();
    await suggest();
    await click("Review");
    await click("Apply setup");
    expect(button("Back to welcome").disabled).toBe(true);
    expect(button("Previous").disabled).toBe(true);
    onSaved.mockImplementation(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
    await act(async () => resolve({ redirect: "/admin/freeform/welcome" }));
    await click("Done");
  });
});
