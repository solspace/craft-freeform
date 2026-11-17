import { bindConfirmationForm } from "@lib/cp/confirmation-dialog";
import { whenCpReady } from "@lib/cp/ready";
import { initializeActivityExport } from "./export";
import { initializeActivityFilters } from "./live-filters";

type NativeActivitySwitch = HTMLElement & {
  checked: boolean;
  disabled: boolean;
  value?: string;
  updateComplete?: Promise<boolean>;
};

type ActivitySwitch = {
  turnOn(silent?: boolean): void;
  turnOff(silent?: boolean): void;
};

const craftUi = window as typeof window & {
  Craft: { LightSwitch: new (element: HTMLElement) => ActivitySwitch };
  jQuery: JQueryStatic;
  hljs?: { highlightElement(element: HTMLElement): void };
};

whenCpReady(async () => {
  const settingsRoot = document.querySelector<HTMLElement>(
    "[data-activity-settings]",
  );

  if (settingsRoot) {
    const radios = Array.from(
      settingsRoot.querySelectorAll<HTMLInputElement>(
        'input[name="settings[activityLogging]"]',
      ),
    );
    const previousMode = settingsRoot.querySelector<HTMLInputElement>(
      "[data-activity-previous-mode]",
    );
    const options = Array.from(
      settingsRoot.querySelectorAll<HTMLElement>("[data-event-option]"),
    );
    const nativeOptions = options.filter((option) =>
      option.matches("craft-switch"),
    );
    if (nativeOptions.length) {
      await customElements.whenDefined("craft-switch");
      await customElements.whenDefined("craft-switch-button");
      await Promise.all(
        nativeOptions.map(
          (option) => (option as NativeActivitySwitch).updateComplete,
        ),
      );
    }
    const switches = new Map(
      options.map((option) => {
        if (option.matches("craft-switch")) {
          const host = option as NativeActivitySwitch;
          const button = host.querySelector<NativeActivitySwitch>(
            "craft-switch-button",
          );
          return [
            option,
            {
              isOn: () => button?.checked ?? host.checked,
              set: (on: boolean, disabled: boolean) => {
                // Native turnOn/turnOff ignore changes while disabled. Presets still
                // need to update the preview and submitted state synchronously.
                host.checked = on;
                host.disabled = disabled;
                if (button) {
                  button.checked = on;
                  button.disabled = disabled;
                }
                const input = host.querySelector<HTMLInputElement>("input");
                if (input) {
                  input.value = on ? host.value || "1" : "";
                  input.disabled = disabled;
                }
              },
              onChange: (listener: EventListener) =>
                host.addEventListener("change", listener),
            },
          ] as const;
        }
        // Craft's legacy switches omit listeners when constructed disabled.
        // Initialize while editable, then lock preset previews below.
        const button = option as HTMLButtonElement;
        const control =
          (craftUi.jQuery(button).data("lightswitch") as
            | ActivitySwitch
            | undefined) || new craftUi.Craft.LightSwitch(button);
        return [
          option,
          {
            isOn: () => button.getAttribute("aria-checked") === "true",
            set: (on: boolean, disabled: boolean) => {
              if (on) control.turnOn(true);
              else control.turnOff(true);
              button.disabled = disabled;
              const input = button.querySelector<HTMLInputElement>("input");
              if (input) input.disabled = disabled;
            },
            onChange: (listener: EventListener) =>
              craftUi.jQuery(button).on("change", listener),
          },
        ] as const;
      }),
    );
    const presets = JSON.parse(
      settingsRoot.querySelector("[data-activity-presets]")?.textContent ||
        "{}",
    ) as Record<string, Record<string, boolean>>;
    const readonly = settingsRoot.hasAttribute("data-readonly");
    const hints = settingsRoot.querySelectorAll<HTMLElement>(
      "[data-options-hint] [data-mode-hint]",
    );
    let previous = previousMode?.value || "minimal";
    const readOptions = (): Record<string, boolean> =>
      Object.fromEntries(
        options.map((option) => [
          option.dataset.eventOption || "",
          switches.get(option)?.isOn() ?? false,
        ]),
      );
    let custom = JSON.parse(
      settingsRoot.querySelector("[data-activity-custom]")?.textContent ||
        "null",
    ) as Record<string, boolean> | null;
    if (previous === "custom") custom = readOptions();

    const update = (): void => {
      const selection =
        radios.find((radio) => radio.checked)?.value || previous;
      const mode = selection === "off" ? previous : selection;
      if (previousMode) previousMode.value = mode;
      settingsRoot
        .querySelectorAll<HTMLElement>("[data-logging-panel]")
        .forEach((panel) => {
          panel.hidden =
            panel.dataset.loggingPanel !==
            (selection === "off" ? "none" : "activity");
        });
      settingsRoot
        .querySelectorAll<HTMLElement>("[data-storage-title]")
        .forEach((title) => {
          title.hidden =
            title.dataset.storageTitle !==
            (selection === "off" ? "off" : "active");
        });
      if (previous === "custom") custom = readOptions();
      if (mode === "custom" && !custom) custom = { ...presets.standard };
      options.forEach((option) => {
        const effective = mode === "custom" ? custom : presets[mode];
        const enabled = !!effective?.[option.dataset.eventOption || ""];
        const disabled = readonly || mode !== "custom";
        switches.get(option)?.set(enabled, disabled);
        option.classList.toggle("noteditable", disabled);
        const row = option.closest<HTMLElement>("[data-event-row]");
        if (row) {
          row.hidden = mode !== "custom" && !enabled;
          row.classList.toggle("is-disabled", disabled);
          row.classList.toggle("is-muted", mode === "custom" && !enabled);
        }
        const holder = option.closest<HTMLElement>(
          ".ff-settings-helper-control",
        );
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
      switches.get(option)?.onChange(() => {
        const customMode = radios.some(
          (radio) => radio.checked && radio.value === "custom",
        );
        option
          .closest("[data-event-row]")
          ?.classList.toggle(
            "is-muted",
            customMode && !switches.get(option)?.isOn(),
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
  const clearForm =
    document.querySelector<HTMLFormElement>(".ff-activity-clear");
  const clearDialog = document.querySelector<HTMLDialogElement>(
    "#activity-clear-confirmation",
  );
  if (clearForm && clearDialog) bindConfirmationForm(clearForm, clearDialog);
  const activityLog = document.querySelector<HTMLElement>(
    "[data-activity-log]",
  );
  if (activityLog) {
    initializeActivityFilters(activityLog, bindActivityActions);
    initializeActivityExport(activityLog);
  }
}, "[data-activity-settings], [data-activity-log]");
