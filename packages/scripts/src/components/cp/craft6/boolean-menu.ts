import { whenCpReady } from "@lib/cp/ready";

type BooleanCombobox = HTMLElement & {
  value?: string;
};

/** Retain the selected indicator and the legacy select's form/toggle behavior. */
export function enhanceBooleanMenus(root: ParentNode = document): void {
  for (const wrapper of root.querySelectorAll<HTMLElement>(
    ".freeform-boolean-menu",
  )) {
    if (wrapper.dataset.booleanMenuReady) continue;
    const combobox = wrapper.querySelector<BooleanCombobox>("craft-combobox");
    const select = wrapper.querySelector<HTMLSelectElement>("select");
    const indicator = wrapper.querySelector<HTMLElement>(
      ".freeform-boolean-menu-status craft-indicator",
    );
    if (!combobox || !select || !indicator) continue;
    wrapper.dataset.booleanMenuReady = "true";

    const update = (): void => {
      const value = combobox.value ?? combobox.getAttribute("value");
      if (value == null) return;
      const options = JSON.parse(combobox.getAttribute("options") || "[]") as {
        value?: string;
        data?: { boolean?: string };
        options?: { value: string; data?: { boolean?: string } }[];
      }[];
      const option = options
        .flatMap((item) => item.options ?? [item])
        .find((item) => item.value === value);
      const enabled = option?.data?.boolean === "1";
      indicator.setAttribute("fill", enabled ? "success" : "neutral");
      indicator.setAttribute("appearance", enabled ? "solid" : "outline");
      select.dataset.boolean = enabled ? "true" : "false";
      if (select.value !== value) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const scheduleUpdate = (): void => queueMicrotask(update);
    combobox.addEventListener("change", scheduleUpdate);
    update();
  }
}

whenCpReady(() => enhanceBooleanMenus(), ".freeform-boolean-menu");
