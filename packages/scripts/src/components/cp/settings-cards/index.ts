type SettingsCardSwitch = {
  turnOn(silent?: boolean): void;
  turnOff(silent?: boolean): void;
};

const settingsCardUi = window as typeof window & {
  Craft: { LightSwitch: new (element: HTMLElement) => SettingsCardSwitch };
  jQuery: JQueryStatic;
};

// Keep native Craft switches and their external labels usable outside Activity too.
document
  .querySelectorAll<HTMLButtonElement>(
    ".ff-settings-helper-control .lightswitch",
  )
  .forEach((button) => {
    const control =
      (settingsCardUi.jQuery(button).data("lightswitch") as
        | SettingsCardSwitch
        | undefined) || new settingsCardUi.Craft.LightSwitch(button);
    const label = document.getElementById(
      button.getAttribute("aria-labelledby") || "",
    );
    label?.addEventListener("click", (event) => {
      event.preventDefault();
      if (button.disabled || button.closest("[inert]")) return;
      if (button.getAttribute("aria-checked") === "true") control.turnOff();
      else control.turnOn();
    });
  });
