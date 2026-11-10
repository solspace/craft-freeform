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
): Promise<void> => {
  const initial =
    mode === "custom"
      ? custom || preset.standard
      : preset[mode as keyof typeof preset] || preset.minimal;
  document.head.innerHTML = `<style>${settingsCardCss}</style>`;
  document.body.innerHTML = `<form><div data-activity-settings ${readonly ? "data-readonly" : ""}>
    <label><input type="radio" name="settings[loggingStyle]" value="activity" ${style === "activity" ? "checked" : ""} ${readonly ? "disabled" : ""}></label>
    <label><input type="radio" name="settings[loggingStyle]" value="classic" ${style === "classic" ? "checked" : ""} ${readonly ? "disabled" : ""}></label>
    <label><input type="radio" name="settings[loggingStyle]" value="none" ${style === "none" ? "checked" : ""} ${readonly ? "disabled" : ""}></label>
    <div data-logging-panel="activity">
    <div data-recording-options>
      <label><input type="radio" name="settings[activityMode]" value="minimal" ${mode === "minimal" ? "checked" : ""}></label>
      <label><input type="radio" name="settings[activityMode]" value="standard" ${mode === "standard" ? "checked" : ""}></label>
      <label><input type="radio" name="settings[activityMode]" value="custom" ${mode === "custom" ? "checked" : ""}></label>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control"><button class="lightswitch" type="button" role="switch" data-event-option="error" aria-checked="${initial.error}"><input type="hidden" name="settings[activityEvents][error]" value="${initial.error ? "1" : ""}"></button></span></div>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control"><button class="lightswitch" type="button" role="switch" data-event-option="submission" aria-labelledby="submission-label" aria-checked="${initial.submission}"><input type="hidden" name="settings[activityEvents][submission]" value="${initial.submission ? "1" : ""}"></button></span><label id="submission-label">Saved submissions</label></div>
      <p data-options-hint><span data-mode-hint="preset">Choose <strong>Custom</strong> to change them.</span><span data-mode-hint="custom" hidden>Choose each event type independently.</span></p>
    </div>
    </div>
    <div data-logging-panel="classic"><label><input type="radio" name="settings[loggingLevel]" value="debug" checked></label></div>
    <div data-logging-panel="none">Logging is off.</div>
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
    `input[value="${mode}"]`,
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

describe("Activity recording settings", () => {
  beforeEach(() => vi.resetModules());

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

  it("shows only the chosen logging style and preserves the other style's preferences", async () => {
    await mount("custom", false, { error: true, submission: false });
    const activity = document.querySelector<HTMLElement>(
      '[data-logging-panel="activity"]',
    )!;
    const classic = document.querySelector<HTMLElement>(
      '[data-logging-panel="classic"]',
    )!;
    expect(activity.hidden).toBe(false);
    expect(classic.hidden).toBe(true);
    choose("classic");
    expect(activity.hidden).toBe(true);
    expect(classic.hidden).toBe(false);
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    expect(values().get("settings[loggingLevel]")).toBe("debug");
    choose("activity");
    expect(activity.hidden).toBe(false);
    expect(classic.hidden).toBe(true);
    expect(isOn("submission")).toBe(false);
  });

  it("opens directly in Classic when saved, including read-only style controls", async () => {
    await mount("minimal", true, null, "classic");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="activity"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="classic"]')!
        .hidden,
    ).toBe(false);
    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="settings[loggingStyle]"][value="classic"]',
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

  it("hides both sets of controls for None while preserving preferences", async () => {
    await mount("custom", false, { error: true, submission: false });
    choose("none");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="activity"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="classic"]')!
        .hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    expect(values().get("settings[loggingLevel]")).toBe("debug");
    choose("activity");
    expect(isOn("error")).toBe(true);
    expect(isOn("submission")).toBe(false);
  });

  it("restores None with all style cards disabled in read-only environments", async () => {
    await mount("minimal", true, null, "none");
    expect(
      document.querySelector<HTMLElement>('[data-logging-panel="none"]')!
        .hidden,
    ).toBe(false);
    expect(
      [
        ...document.querySelectorAll<HTMLInputElement>(
          'input[name="settings[loggingStyle]"]',
        ),
      ].every((input) => input.disabled),
    ).toBe(true);
  });
});
