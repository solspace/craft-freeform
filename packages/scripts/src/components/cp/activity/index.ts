import { bindConfirmationForm } from "@lib/cp/confirmation-dialog";
import { initializeActivityExport } from "./export";
import { initializeActivityFilters } from "./live-filters";

type ActivitySwitch = {
  turnOn(silent?: boolean): void;
  turnOff(silent?: boolean): void;
};

const craftUi = window as typeof window & {
  Craft: { LightSwitch: new (element: HTMLElement) => ActivitySwitch };
  jQuery: JQueryStatic;
  hljs?: { highlightElement(element: HTMLElement): void };
};

const settingsRoot = document.querySelector<HTMLElement>(
  "[data-activity-settings]",
);

if (settingsRoot) {
  const styles = Array.from(
    settingsRoot.querySelectorAll<HTMLInputElement>(
      'input[name="settings[loggingStyle]"]',
    ),
  );
  const updateStyle = (): void => {
    const selected = styles.find((radio) => radio.checked)?.value || "activity";
    settingsRoot
      .querySelectorAll<HTMLElement>("[data-logging-panel]")
      .forEach((panel) => {
        panel.hidden = panel.dataset.loggingPanel !== selected;
      });
  };
  styles.forEach((radio) => {
    radio.addEventListener("change", updateStyle);
  });
  updateStyle();
  const radios = Array.from(
    settingsRoot.querySelectorAll<HTMLInputElement>(
      'input[name="settings[activityMode]"]',
    ),
  );
  const options = Array.from(
    settingsRoot.querySelectorAll<HTMLButtonElement>("[data-event-option]"),
  );
  // Initialize while editable: Craft intentionally omits input listeners for
  // switches that are disabled when constructed. Presets become read-only below.
  const switches = new Map(
    options.map((option) => [
      option,
      (craftUi.jQuery(option).data("lightswitch") as
        | ActivitySwitch
        | undefined) || new craftUi.Craft.LightSwitch(option),
    ]),
  );
  const presets = JSON.parse(
    settingsRoot.querySelector("[data-activity-presets]")?.textContent || "{}",
  ) as Record<string, Record<string, boolean>>;
  const readonly = settingsRoot.hasAttribute("data-readonly");
  const hints = settingsRoot.querySelectorAll<HTMLElement>(
    "[data-options-hint] [data-mode-hint]",
  );
  let previous = radios.find((radio) => radio.checked)?.value || "minimal";
  const readOptions = (): Record<string, boolean> =>
    Object.fromEntries(
      options.map((option) => [
        option.dataset.eventOption || "",
        option.getAttribute("aria-checked") === "true",
      ]),
    );
  let custom = JSON.parse(
    settingsRoot.querySelector("[data-activity-custom]")?.textContent || "null",
  ) as Record<string, boolean> | null;
  if (previous === "custom") custom = readOptions();

  const update = (): void => {
    const mode = radios.find((radio) => radio.checked)?.value || "minimal";
    if (previous === "custom" && mode !== "custom") custom = readOptions();
    if (mode === "custom" && !custom) custom = { ...presets.standard };
    options.forEach((option) => {
      const effective = mode === "custom" ? custom : presets[mode];
      const enabled = !!effective?.[option.dataset.eventOption || ""];
      const control = switches.get(option);
      if (enabled) control?.turnOn(true);
      else control?.turnOff(true);
      option.disabled = readonly || mode !== "custom";
      option.classList.toggle("noteditable", option.disabled);
      const input = option.querySelector<HTMLInputElement>("input");
      if (input) input.disabled = option.disabled;
      const row = option.closest<HTMLElement>("[data-event-row]");
      if (row) {
        row.hidden = mode !== "custom" && !enabled;
        row.classList.toggle("is-disabled", option.disabled);
        row.classList.toggle("is-muted", mode === "custom" && !enabled);
      }
      const holder = option.closest<HTMLElement>(".ff-settings-helper-control");
      if (holder) holder.hidden = mode !== "custom";
    });
    radios.forEach((radio) => {
      (
        radio.closest("[data-mode-card]") || radio.closest("label")
      )?.classList.toggle("is-selected", radio.checked);
    });
    hints.forEach((hint) => {
      hint.hidden =
        hint.dataset.modeHint !== (mode === "custom" ? "custom" : "preset");
    });
    previous = mode;
  };
  radios.forEach((radio) => {
    radio.addEventListener("change", update);
  });
  options.forEach((option) => {
    craftUi.jQuery(option).on("change", () => {
      const customMode = radios.some(
        (radio) => radio.checked && radio.value === "custom",
      );
      option
        .closest("[data-event-row]")
        ?.classList.toggle(
          "is-muted",
          customMode && option.getAttribute("aria-checked") !== "true",
        );
    });
  });
  update();
}

function bindActivityActions(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>(
      "code[data-activity-json]:not([data-highlighted])",
    )
    .forEach((code) => {
      craftUi.hljs?.highlightElement(code);
    });
  root
    .querySelectorAll<HTMLButtonElement>("[data-activity-copy]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const status =
          document.querySelector<HTMLElement>("[data-copy-status]");
        if (!status) return;
        try {
          await navigator.clipboard.writeText(
            button.dataset.activityCopy || "",
          );
          status.textContent = status.dataset.success || "";
        } catch {
          status.textContent = status.dataset.failure || "";
        }
      });
    });
}

bindActivityActions();
const clearForm = document.querySelector<HTMLFormElement>(".ff-activity-clear");
const clearDialog = document.querySelector<HTMLDialogElement>(
  "#activity-clear-confirmation",
);
if (clearForm && clearDialog) bindConfirmationForm(clearForm, clearDialog);
const activityLog = document.querySelector<HTMLElement>("[data-activity-log]");
if (activityLog) {
  initializeActivityFilters(activityLog, bindActivityActions);
  initializeActivityExport(activityLog);
}
