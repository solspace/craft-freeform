import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Package test scripts run with packages/scripts as their working directory.
const settingsCardCss = readFileSync(
  resolve(
    process.cwd(),
    "../plugin/src/Resources/css/cp/settings-cards/settings-cards.css",
  ),
  "utf8",
);

const preset = {
  minimal: { error: true, submission: false },
  standard: { error: true, submission: true },
};

// Model Craft's public switch API and its submitted hidden value.
const controls = new WeakMap<HTMLElement, object>();
class NativeSwitch {
  constructor(private element: HTMLButtonElement) {
    controls.set(element, this);
    element.addEventListener("click", () => {
      if (element.getAttribute("aria-checked") === "true") this.turnOff();
      else this.turnOn();
      element.dispatchEvent(new Event("change"));
    });
  }
  turnOn(): void {
    this.set(true);
  }
  turnOff(): void {
    this.set(false);
  }
  private set(on: boolean): void {
    this.element.setAttribute("aria-checked", String(on));
    const input = this.element.querySelector("input");
    if (input) input.value = on ? "1" : "";
  }
}

const mount = async (
  mode = "minimal",
  readonly = false,
  custom: Record<string, boolean> | null = null,
  style = "activity",
  native = false,
): Promise<void> => {
  const initial =
    mode === "custom"
      ? custom || preset.standard
      : preset[mode as keyof typeof preset] || preset.minimal;
  const eventControl = (key: "error" | "submission"): string => {
    const input = `<input type="hidden" slot="hidden-input" name="settings[activityEvents][${key}]" value="${initial[key] ? "1" : ""}">`;
    return native
      ? `<craft-switch data-event-option="${key}" ${initial[key] ? "checked" : ""}><craft-switch-button role="switch" aria-checked="${initial[key]}" ${initial[key] ? "checked" : ""}></craft-switch-button>${input}</craft-switch>`
      : `<button class="lightswitch" type="button" role="switch" data-event-option="${key}" aria-labelledby="${key}-label" aria-checked="${initial[key]}">${input}</button>`;
  };
  document.head.innerHTML = `<style>${settingsCardCss}</style>`;
  document.body.innerHTML = `<form><div data-activity-settings ${readonly ? "data-readonly" : ""}>
    <input type="hidden" name="settings[activityMode]" value="${mode}" data-activity-previous-mode>
    ${["minimal", "standard", "detailed", "custom", "off"].map((value) => `<label><input type="radio" name="settings[activityLogging]" value="${value}" ${(style === "none" ? "off" : mode) === value ? "checked" : ""} ${readonly ? "disabled" : ""}></label>`).join("")}
    <div data-logging-panel="activity">
    <div data-recording-options>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control">${eventControl("error")}</span></div>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control">${eventControl("submission")}</span><label id="submission-label">Saved submissions</label></div>
      <p data-options-hint><span data-mode-hint="preset">Choose <strong>Custom</strong> to change them.</span><span data-mode-hint="custom" hidden>Choose each event type independently.</span></p>
    </div>
    </div>
    <div data-logging-panel="none">Logging is off.</div>
    <h2><span data-storage-title="active">Storage limits</span><span data-storage-title="off" hidden>Existing History</span></h2>
    <script type="application/json" data-activity-presets>${JSON.stringify(preset)}</script>
    <script type="application/json" data-activity-custom>${JSON.stringify(custom)}</script>
  </div></form>`;
  vi.stubGlobal("Craft", { LightSwitch: NativeSwitch });
  vi.stubGlobal("jQuery", (element: HTMLElement) => ({
    data: () => controls.get(element),
    on: (event: string, listener: EventListener) =>
      element.addEventListener(event, listener),
  }));
  await import("../settings-cards/index");
  await import("./index");
};

const choose = (mode: string): void => {
  const radio = document.querySelector<HTMLInputElement>(
    `input[type="radio"][value="${mode}"]`,
  );
  if (!radio) throw new Error("Missing mode");
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
};
const option = (key: string): HTMLButtonElement =>
  document.querySelector(`[data-event-option="${key}"]`)!;
const isOn = (key: string): boolean =>
  option(key).getAttribute("aria-checked") === "true";
const values = (): FormData => new FormData(document.querySelector("form")!);

// Model the Craft 6 light-DOM switch: checked changes before aria-checked,
// and programmatic properties update separately from the submitted input.
function defineNativeSwitches(): void {
  class SwitchButton extends HTMLElement {
    get checked(): boolean {
      return this.hasAttribute("checked");
    }
    set checked(value: boolean) {
      this.toggleAttribute("checked", value);
    }
    get disabled(): boolean {
      return this.hasAttribute("disabled");
    }
    set disabled(value: boolean) {
      this.toggleAttribute("disabled", value);
    }
    connectedCallback(): void {
      this.addEventListener("click", () => {
        if (this.disabled) return;
        this.checked = !this.checked;
        this.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
  }
  class Switch extends HTMLElement {
    updateComplete = Promise.resolve(true);
    get checked(): boolean {
      return this.hasAttribute("checked");
    }
    set checked(value: boolean) {
      this.toggleAttribute("checked", value);
    }
    get disabled(): boolean {
      return this.hasAttribute("disabled");
    }
    set disabled(value: boolean) {
      this.toggleAttribute("disabled", value);
    }
    connectedCallback(): void {
      this.addEventListener(
        "change",
        () => {
          this.checked = this.querySelector<SwitchButton>(
            "craft-switch-button",
          )!.checked;
          this.querySelector<HTMLInputElement>("input")!.value = this.checked
            ? "1"
            : "";
        },
        { capture: true },
      );
    }
  }
  customElements.define("craft-switch-button", SwitchButton);
  customElements.define("craft-switch", Switch);
}

describe("Activity recording settings", () => {
  beforeEach(() => vi.resetModules());

  it("initializes when Craft mounts the settings after the script loads", async () => {
    await mount();
    const fragment = document.querySelector("form")!.cloneNode(true);
    document.body.replaceChildren();
    vi.resetModules();
    await import("./index");
    document.body.append(fragment);
    await Promise.resolve();
    choose("off");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="activity"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
  });

  it("preserves option emphasis when switching recording mode instructions", async () => {
    await mount();
    const presetHint = document.querySelector<HTMLElement>(
      '[data-mode-hint="preset"]',
    )!;
    const customHint = document.querySelector<HTMLElement>(
      '[data-mode-hint="custom"]',
    )!;
    expect(presetHint.hidden).toBe(false);
    expect(customHint.hidden).toBe(true);
    expect(presetHint.querySelector("strong")?.textContent).toBe("Custom");
    choose("custom");
    expect(presetHint.hidden).toBe(true);
    expect(customHint.hidden).toBe(false);
    choose("standard");
    expect(presetHint.hidden).toBe(false);
    expect(customHint.hidden).toBe(true);
    expect(presetHint.querySelector("strong")?.textContent).toBe("Custom");
  });

  it("pauses recording and preserves the last mode and custom choices", async () => {
    await mount("custom", false, { error: true, submission: false });
    const activity = document.querySelector<HTMLElement>(
      '[data-logging-panel="activity"]',
    )!;
    const none = document.querySelector<HTMLElement>(
      '[data-logging-panel="none"]',
    )!;
    expect(activity.hidden).toBe(false);
    expect(none.hidden).toBe(true);
    option("error").click();
    choose("off");
    expect(values().get("settings[activityLogging]")).toBe("off");
    expect(values().get("settings[activityEvents][error]")).toBe("");
    expect(activity.hidden).toBe(true);
    expect(none.hidden).toBe(false);
    expect(
      document.querySelector<HTMLElement>('[data-storage-title="off"]')!.hidden,
    ).toBe(false);
    expect(
      document.querySelector<HTMLElement>('[data-storage-title="active"]')!
        .hidden,
    ).toBe(true);
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    choose("custom");
    expect(activity.hidden).toBe(false);
    expect(none.hidden).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-storage-title="off"]')!.hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-storage-title="active"]')!
        .hidden,
    ).toBe(false);
    expect(isOn("submission")).toBe(false);
    expect(isOn("error")).toBe(false);
  });

  it("opens directly in Off when saved, including read-only cards", async () => {
    await mount("minimal", true, null, "none");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="activity"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="settings[activityLogging]"][value="off"]',
      )!.disabled,
    ).toBe(true);
  });

  it("shows the effective preset and prevents edits until Custom is selected", async () => {
    await mount();
    expect(isOn("submission")).toBe(false);
    expect(option("submission").disabled).toBe(true);
    choose("standard");
    expect(isOn("submission")).toBe(true);
    choose("custom");
    expect(isOn("submission")).toBe(true);
    expect(option("submission").disabled).toBe(false);
    option("submission").click();
    expect(values().get("settings[activityEvents][submission]")).toBe("");
  });

  it("lets labels toggle editable switches while presets remain locked", async () => {
    await mount();
    document.querySelector<HTMLElement>("#submission-label")!.click();
    expect(isOn("submission")).toBe(false);
    choose("custom");
    expect(isOn("submission")).toBe(true);
    document.querySelector<HTMLElement>("#submission-label")!.click();
    expect(isOn("submission")).toBe(false);
    expect(values().get("settings[activityEvents][submission]")).toBe("");
  });

  it("preserves saved Custom choices on page load, including disabled event types", async () => {
    await mount("custom", false, { error: true, submission: false });
    expect(isOn("submission")).toBe(false);
    expect(option("submission").disabled).toBe(false);
  });

  it("never re-enables a Custom exclusion after previewing another preset", async () => {
    await mount("custom", false, { error: true, submission: false });
    choose("standard");
    expect(isOn("submission")).toBe(true);
    choose("custom");
    expect(isOn("submission")).toBe(false);
    option("error").click();
    choose("minimal");
    choose("custom");
    expect(isOn("error")).toBe(false);
    expect(values().get("settings[activityEvents][error]")).toBe("");
  });

  it("restores previously saved Custom exclusions when the page initially opens on a preset", async () => {
    await mount("standard", false, { error: true, submission: false });
    choose("custom");
    expect(isOn("submission")).toBe(false);
  });

  it("shows only included preset cards, and reveals all controls in Custom using Standard defaults", async () => {
    await mount("minimal");
    const row = (key: string) =>
      option(key).closest<HTMLElement>("[data-event-row]")!;
    const holder = (key: string) =>
      option(key).closest<HTMLElement>(".ff-settings-helper-control")!;
    expect(row("error").hidden).toBe(false);
    expect(getComputedStyle(row("error")).display).toBe("grid");
    expect(row("submission").hidden).toBe(true);
    expect(getComputedStyle(row("submission")).display).toBe("none");
    expect(holder("error").hidden).toBe(true);
    choose("standard");
    expect(row("submission").hidden).toBe(false);
    expect(getComputedStyle(row("submission")).display).not.toBe("none");
    expect(holder("submission").hidden).toBe(true);
    choose("minimal");
    choose("custom");
    expect(row("submission").hidden).toBe(false);
    expect(getComputedStyle(row("submission")).display).not.toBe("none");
    expect(holder("submission").hidden).toBe(false);
    expect(isOn("submission")).toBe(true);
    expect(values().get("settings[activityEvents][submission]")).toBe("1");
  });

  it("mutes switched-off Custom events while keeping their controls editable", async () => {
    await mount("custom", false, { error: true, submission: false });
    const row = option("submission").closest<HTMLElement>("[data-event-row]")!;
    expect(row.classList.contains("is-muted")).toBe(true);
    expect(option("submission").disabled).toBe(false);
    option("submission").click();
    expect(row.classList.contains("is-muted")).toBe(false);
    option("submission").click();
    expect(row.classList.contains("is-muted")).toBe(true);
  });

  it("keeps event controls disabled in environments where settings are read-only", async () => {
    await mount("custom", true);
    expect(
      [option("error"), option("submission")].every((input) => input.disabled),
    ).toBe(true);
  });

  it("hides recording controls for Off while preserving preferences", async () => {
    await mount("custom", false, { error: true, submission: false });
    choose("off");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="activity"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    choose("custom");
    expect(isOn("error")).toBe(true);
    expect(isOn("submission")).toBe(false);
  });

  it("remembers the last preset while Off and changes it when another is selected", async () => {
    await mount("standard");
    choose("off");
    expect(values().get("settings[activityMode]")).toBe("standard");
    choose("minimal");
    choose("off");
    expect(values().get("settings[activityMode]")).toBe("minimal");
  });

  it("restores saved Custom choices after loading with logging Off", async () => {
    await mount("custom", false, { error: false, submission: false }, "none");
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][error]")).toBe("");
    choose("custom");
    expect(isOn("error")).toBe(false);
    expect(isOn("submission")).toBe(false);
    expect(option("error").disabled).toBe(false);
  });

  it("restores Off with all cards disabled in read-only environments", async () => {
    await mount("minimal", true, null, "none");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
    expect(
      [
        ...document.querySelectorAll<HTMLInputElement>(
          'input[name="settings[activityLogging]"]',
        ),
      ].every((input) => input.disabled),
    ).toBe(true);
  });

  it("waits for native switch upgrades and keeps saved custom exclusions", async () => {
    await mount(
      "custom",
      false,
      { error: true, submission: false },
      "activity",
      true,
    );
    defineNativeSwitches();
    await vi.waitFor(() => {
      expect(
        option("submission")
          .closest("[data-event-row]")
          ?.classList.contains("is-muted"),
      ).toBe(true);
      expect(values().get("settings[activityEvents][error]")).toBe("1");
      expect(
        option("error")
          .querySelector("craft-switch-button")
          ?.hasAttribute("checked"),
      ).toBe(true);
    });
    choose("off");
    expect(values().get("settings[activityEvents][error]")).toBe("1");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    choose("custom");
    expect(
      option("error")
        .querySelector("craft-switch-button")
        ?.hasAttribute("checked"),
    ).toBe(true);
  });

  it("preserves native edits through Off and preset previews with synchronous form values", async () => {
    await mount(
      "custom",
      false,
      { error: true, submission: false },
      "activity",
      true,
    );
    await vi.waitFor(() =>
      expect(
        option("error")
          .querySelector("craft-switch-button")
          ?.hasAttribute("disabled"),
      ).toBe(false),
    );
    option("error").querySelector<HTMLElement>("craft-switch-button")!.click();
    expect(
      option("error")
        .closest("[data-event-row]")
        ?.classList.contains("is-muted"),
    ).toBe(true);
    choose("off");
    expect(values().get("settings[activityEvents][error]")).toBe("");
    choose("standard");
    expect(
      option("error")
        .querySelector("craft-switch-button")
        ?.hasAttribute("checked"),
    ).toBe(true);
    expect(
      option("submission")
        .querySelector("craft-switch-button")
        ?.hasAttribute("checked"),
    ).toBe(true);
    expect(
      option("error")
        .querySelector("craft-switch-button")
        ?.hasAttribute("disabled"),
    ).toBe(true);
    choose("minimal");
    expect(
      option("submission")
        .querySelector("craft-switch-button")
        ?.hasAttribute("checked"),
    ).toBe(false);
    choose("custom");
    expect(values().get("settings[activityEvents][error]")).toBe("");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    expect(
      option("error")
        .querySelector("craft-switch-button")
        ?.hasAttribute("disabled"),
    ).toBe(false);
  });

  it("keeps native switches and form inputs disabled in read-only custom settings", async () => {
    await mount(
      "custom",
      true,
      { error: true, submission: false },
      "none",
      true,
    );
    await vi.waitFor(() =>
      expect(
        option("error")
          .querySelector("craft-switch-button")
          ?.hasAttribute("disabled"),
      ).toBe(true),
    );
    expect(values().has("settings[activityEvents][error]")).toBe(false);
    option("error").querySelector<HTMLElement>("craft-switch-button")!.click();
    expect(
      option("error")
        .querySelector("craft-switch-button")
        ?.hasAttribute("checked"),
    ).toBe(true);
  });
});
