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
): Promise<void> => {
  const initial =
    mode === "custom"
      ? custom || preset.standard
      : preset[mode as keyof typeof preset] || preset.minimal;
  document.head.innerHTML = `<style>${settingsCardCss}</style>`;
  document.body.innerHTML = `<form><div data-activity-settings ${readonly ? "data-readonly" : ""}>
    <button type="button" role="switch" id="activity-enabled" aria-checked="true"><input type="hidden" name="settings[activityEnabled]" value="1"></button>
    <div data-recording-options>
      <label><input type="radio" name="settings[activityMode]" value="minimal" ${mode === "minimal" ? "checked" : ""}></label>
      <label><input type="radio" name="settings[activityMode]" value="standard" ${mode === "standard" ? "checked" : ""}></label>
      <label><input type="radio" name="settings[activityMode]" value="custom" ${mode === "custom" ? "checked" : ""}></label>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control"><button class="lightswitch" type="button" role="switch" data-event-option="error" aria-checked="${initial.error}"><input type="hidden" name="settings[activityEvents][error]" value="${initial.error ? "1" : ""}"></button></span></div>
      <div data-event-row class="ff-settings-helper" data-layout="split"><span class="ff-settings-helper-control"><button class="lightswitch" type="button" role="switch" data-event-option="submission" aria-labelledby="submission-label" aria-checked="${initial.submission}"><input type="hidden" name="settings[activityEvents][submission]" value="${initial.submission ? "1" : ""}"></button></span><label id="submission-label">Saved submissions</label></div>
      <p data-options-hint data-custom="Custom" data-preset="Preset"></p>
    </div>
    <script type="application/json" data-activity-presets>${JSON.stringify(preset)}</script>
    <script type="application/json" data-activity-custom>${JSON.stringify(custom)}</script>
  </div></form>`;
  vi.stubGlobal("Craft", { LightSwitch: NativeSwitch });
  vi.stubGlobal("jQuery", (element: HTMLElement) => ({
    data: () => controls.get(element),
    on: (event: string, listener: EventListener) =>
      element.addEventListener(event, listener),
  }));
  new NativeSwitch(
    document.querySelector<HTMLButtonElement>("#activity-enabled")!,
  );
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

  it("locks paused recording options without dropping their values when saved", async () => {
    await mount("custom", false, { error: true, submission: false });
    const recording =
      document.querySelector<HTMLButtonElement>("#activity-enabled")!;
    const area = document.querySelector<HTMLElement>(
      "[data-recording-options]",
    )!;
    recording.click();
    expect(area.inert).toBe(true);
    expect(area.classList.contains("is-paused")).toBe(true);
    expect(values().get("settings[activityMode]")).toBe("custom");
    expect(values().get("settings[activityEvents][error]")).toBe("1");
    expect(values().get("settings[activityEvents][submission]")).toBe("");
    recording.click();
    expect(area.inert).toBe(false);
    expect(isOn("error")).toBe(true);
    expect(isOn("submission")).toBe(false);
  });
});
